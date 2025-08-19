import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import EmployeeLayout from '../../components/EmployeeLayout';
import api from '../../api/axios';
import chatSocket from '../../utils/chatSocket';
import { getEmpId } from '../../utils/auth';
import { FaPaperPlane, FaChevronLeft, FaChevronDown } from 'react-icons/fa';

const PAGE_SIZE = 50;

function Inbox() {
  const me = getEmpId();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]); // [{rideId,otherEmpId,otherName,unread,lastTs,lastPreview}]
  const [active, setActive] = useState(null); // {rideId, otherEmpId, closed:boolean}
  const [messages, setMessages] = useState([]); // MessageDTO[] sorted ascending
  const [page, setPage] = useState(0);
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/ride/chat/conversations');
      setConversations(res.data || []);
    } catch {
      setConversations([]);
    } finally { setLoading(false); }
  }, []);

  const messageKey = useCallback((m) => (m.id ?? `${m.rideId}-${m.ts}-${m.fromEmpId}-${m.toEmpId}`), []);

  const dedupe = useCallback((arr) => {
    const seen = new Set();
    const out = [];
    for (const m of arr) {
      const k = messageKey(m);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(m);
    }
    return out;
  }, [messageKey]);

  const loadMessages = useCallback(async (rid, other, p = 0) => {
    try {
      const res = await api.get('/ride/chat/messages', { params: { rideId: rid, otherEmpId: other, page: p, size: PAGE_SIZE } });
      const list = res.data || [];
      setMessages(prev => {
        const base = p === 0 ? [] : prev;
        return dedupe([...base, ...list]);
      });
      setPage(p);
      // mark read up to latest
      const upTo = list.length ? list[list.length - 1].ts : null;
      if (upTo) chatSocket.markRead(rid, other, upTo);
    } catch { /* ignore */ }
  }, [dedupe]);

  const selectConversation = useCallback((c) => {
    setActive({ rideId: c.rideId, otherEmpId: c.otherEmpId, closed: false });
    setMessages([]);
    loadMessages(c.rideId, c.otherEmpId, 0);
  }, [loadMessages]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const deleteConversation = useCallback(async () => {
    if (!active) return;
    if (!window.confirm('Delete this conversation for both participants?')) return;
    try {
      await api.delete('/ride/chat/delete', { params: { rideId: active.rideId, otherEmpId: active.otherEmpId } });
      setConversations(prev => prev.filter(c => !(c.rideId === active.rideId && c.otherEmpId === active.otherEmpId)));
      setActive(null);
      setMessages([]);
    } catch {}
  }, [active]);

  useEffect(() => {
    chatSocket.connect();
    const off = chatSocket.addListener((evt) => {
      if (!evt) return;
      // handle read receipts/closed events/generic message
      if (evt.type === 'read') {
        if (active && evt.rideId === active.rideId && evt.reader === active.otherEmpId) {
          // mark my outgoing messages as read up to ts
          setMessages(ms => ms.map(m => (m.fromEmpId === me && new Date(m.ts).getTime() <= evt.upTo ? { ...m, read: true } : m)));
        }
        return;
      }
      if (evt.type === 'closed') {
        // chat closed for ride
        setConversations(prev => prev);
        setActive(a => a && a.rideId === evt.rideId ? { ...a, closed: true } : a);
        return;
      }
      if (evt.type === 'deleted') {
        setConversations(prev => prev.filter(c => !(c.rideId === evt.rideId && ((c.otherEmpId === evt.other) || (c.otherEmpId === evt.by)))));
        setActive(a => (a && a.rideId === evt.rideId && (a.otherEmpId === evt.other || a.otherEmpId === evt.by)) ? null : a);
        setMessages([]);
        return;
      }
      // assume MessageDTO
      const m = evt;
      // update conversation preview/unread
      setConversations(prev => {
        const idx = prev.findIndex(x => x.rideId === m.rideId && (x.otherEmpId === (m.fromEmpId === me ? m.toEmpId : m.fromEmpId)));
        let next = [...prev];
        const other = (m.fromEmpId === me ? m.toEmpId : m.fromEmpId);
        const existing = idx >= 0 ? next[idx] : { rideId: m.rideId, otherEmpId: other, otherName: other, unread: 0, lastTs: m.ts, lastPreview: m.content };
        const updated = { ...existing, lastTs: m.ts, lastPreview: m.content, unread: (m.toEmpId === me ? (existing.unread || 0) + 1 : existing.unread || 0) };
        if (idx >= 0) next[idx] = updated; else next = [updated, ...next];
        return next;
      });
      // if message belongs to active thread, append and send read receipt
      setActive(a => {
        if (a && a.rideId === m.rideId && (m.fromEmpId === a.otherEmpId || m.toEmpId === a.otherEmpId)) {
          setMessages(ms => {
            const k = messageKey(m);
            if (ms.some(x => messageKey(x) === k)) return ms; // already present
            const next = [...ms, m];
            return next;
          });
          if (m.toEmpId === me) chatSocket.markRead(m.rideId, a.otherEmpId, m.ts);
        }
        return a;
      });
    });
    return () => off();
  }, [me, active, messageKey]);

  // Auto-scroll to latest message whenever list changes
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, active]);

  // Auto-select conversation based on query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rid = params.get('rideId');
    const emp = params.get('emp');
    if (rid && emp) {
      const rideId = Number(rid);
      setActive(cur => cur && cur.rideId === rideId && cur.otherEmpId === emp ? cur : { rideId, otherEmpId: emp, closed: false });
      setMessages([]);
      loadMessages(rideId, emp, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const send = async (e) => {
    e.preventDefault();
    if (!active || !inputRef.current) return;
    const text = inputRef.current.value.trim();
    if (!text) return;
    setSending(true);
    try {
      chatSocket.sendMessage(active.rideId, active.otherEmpId, text);
      inputRef.current.value = '';
    } finally { setSending(false); }
  };

  const loadOlder = () => {
    if (!active) return;
    loadMessages(active.rideId, active.otherEmpId, page + 1);
  };

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a,b)=> new Date(b.lastTs||0) - new Date(a.lastTs||0));
  }, [conversations]);

  return (
    <EmployeeLayout heading="Inbox" subheading="Chat with your ride participants">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 border-b text-xs text-gray-500">Conversations</div>
          <ul className="divide-y">
            {loading && <li className="p-3 text-xs text-gray-400">Loading...</li>}
            {!loading && sortedConversations.length === 0 && <li className="p-3 text-xs text-gray-400">No conversations yet</li>}
            {sortedConversations.map(c => (
              <li key={`${c.rideId}-${c.otherEmpId}`} className={`p-3 cursor-pointer hover:bg-orange-50 ${active && active.rideId===c.rideId && active.otherEmpId===c.otherEmpId ? 'bg-orange-50' : ''}`} onClick={()=>selectConversation(c)}>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm truncate">{c.otherName || c.otherEmpId}</div>
                  {!!c.unread && <span className="ml-2 inline-block min-w-5 px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] text-center">{c.unread}</span>}
                </div>
                <div className="text-[11px] text-gray-500 truncate">{c.lastPreview}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 bg-white rounded-xl shadow border border-gray-100 flex flex-col">
          <div className="px-3 py-2 border-b flex items-center gap-2 text-sm">
            {active ? (
              <>
                <button className="p-1 rounded hover:bg-gray-100 md:hidden" onClick={()=>setActive(null)}><FaChevronLeft/></button>
                <div className="font-semibold truncate flex-1">{(conversations.find(c=>c.rideId===active.rideId && c.otherEmpId===active.otherEmpId)?.otherName) || active.otherEmpId}</div>
                {active.closed && <span className="text-[11px] text-red-600">Closed</span>}
                <div className="ml-auto flex items-center gap-2">
                  {!active.closed && (
                    <button onClick={deleteConversation} className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 text-[11px]">Delete</button>
                  )}
                </div>
              </>
            ) : <div className="text-xs text-gray-500">Select a conversation</div>}
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {active && (
              <>
                {page > 0 && (
                  <button onClick={loadOlder} className="mx-auto mb-2 px-3 py-1 text-[11px] rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center gap-1"><FaChevronDown/> Load older</button>
                )}
                {messages.map(m => (
                  <div key={messageKey(m)} className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.fromEmpId===me ? 'ml-auto bg-orange-500 text-white' : 'mr-auto bg-gray-100 text-gray-800'}`}>
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    <div className={`mt-1 text-[10px] ${m.fromEmpId===me ? 'text-white/70' : 'text-gray-500'}`}>{new Date(m.ts).toLocaleTimeString()}</div>
                  </div>
                ))}
              </>
            )}
          </div>
          <form onSubmit={send} className="p-2 border-t flex items-center gap-2">
            <input ref={inputRef} disabled={!active || active.closed} placeholder={active && !active.closed ? 'Type a message...' : 'Chat closed'} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <button disabled={!active || active.closed || sending} className="px-3 py-2 rounded-lg bg-orange-600 text-white disabled:opacity-50"><FaPaperPlane/></button>
          </form>
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default Inbox;
