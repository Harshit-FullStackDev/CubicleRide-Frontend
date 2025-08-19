import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import EmployeeLayout from '../../components/EmployeeLayout';
import api from '../../api/axios';
import chatSocket from '../../utils/chatSocket';
import { getEmpId } from '../../utils/auth';
import { FaPaperPlane, FaChevronLeft, FaChevronDown } from 'react-icons/fa';

const PAGE_SIZE = 50;

// --- helpers -------------------------------------------------------------
const now = () => Date.now();
const RELATIVE_THRESHOLDS = [
  { limit: 60, fmt: (s) => `${Math.floor(s)}s` },
  { limit: 3600, fmt: (s) => `${Math.floor(s/60)}m` },
  { limit: 86400, fmt: (s) => `${Math.floor(s/3600)}h` },
  { limit: 172800, fmt: () => 'Yesterday' }
];
function relativeTime(ts) {
  try {
    const t = new Date(ts).getTime();
    if (!t) return '';
    const diffSec = (now() - t) / 1000;
    for (const r of RELATIVE_THRESHOLDS) {
      if (diffSec < r.limit) return r.fmt(diffSec);
    }
    return new Date(t).toLocaleDateString();
  } catch { return ''; }
}

function formatClock(ts) {
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
}

function getInitials(nameOrId='') {
  const parts = String(nameOrId).trim().split(/\s+/).slice(0,2);
  if (!parts.length) return '?';
  return parts.map(p=>p[0]?.toUpperCase()||'').join('');
}

function Inbox() {
  const me = getEmpId();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]); // [{rideId,otherEmpId,otherName,unread,lastTs,lastPreview}]
  const [active, setActive] = useState(null); // {rideId, otherEmpId, closed:boolean}
  const [messages, setMessages] = useState([]); // MessageDTO[] sorted ascending (may contain temp optimistic)
  const [page, setPage] = useState(0);
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [lastSeenTs, setLastSeenTs] = useState(0); // numeric ms last bottom reach to separate NEW divider
  const [newMsgFlash, setNewMsgFlash] = useState(false);
  const optimisticIdRef = useRef(0);

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
      if (evt.type === 'read') {
        if (active && evt.rideId === active.rideId && evt.reader === active.otherEmpId) {
          setMessages(ms => ms.map(m => (m.fromEmpId === me && new Date(m.ts).getTime() <= evt.upTo ? { ...m, read: true, _status: m._status === 'sending' ? 'sent' : m._status } : m)));
        }
        return;
      }
      if (evt.type === 'closed') {
        setActive(a => a && a.rideId === evt.rideId ? { ...a, closed: true } : a);
        return;
      }
      if (evt.type === 'deleted') {
        setConversations(prev => prev.filter(c => !(c.rideId === evt.rideId && ((c.otherEmpId === evt.other) || (c.otherEmpId === evt.by)))));
        setActive(a => (a && a.rideId === evt.rideId && (a.otherEmpId === evt.other || a.otherEmpId === evt.by)) ? null : a);
        setMessages([]);
        return;
      }
      // inbound/outbound message
      const m = evt;
      setConversations(prev => {
        const idx = prev.findIndex(x => x.rideId === m.rideId && (x.otherEmpId === (m.fromEmpId === me ? m.toEmpId : m.fromEmpId)));
        let next = [...prev];
        const other = (m.fromEmpId === me ? m.toEmpId : m.fromEmpId);
        const existing = idx >= 0 ? next[idx] : { rideId: m.rideId, otherEmpId: other, otherName: other, unread: 0, lastTs: m.ts, lastPreview: m.content };
        const updated = { ...existing, lastTs: m.ts, lastPreview: m.content, unread: (m.toEmpId === me ? (existing.unread || 0) + (active && active.rideId === m.rideId && active.otherEmpId === other ? 0 : 1) : existing.unread || 0) };
        if (idx >= 0) next[idx] = updated; else next = [updated, ...next];
        return next;
      });

      const isActive = active && active.rideId === m.rideId && (m.fromEmpId === active.otherEmpId || m.toEmpId === active.otherEmpId);
      if (isActive) {
        setMessages(ms => {
          const k = messageKey(m);
          // Replace optimistic temp if same author+content and within 5s
            const fiveSecAgo = Date.now() - 5000;
            let replaced = false;
            const next = ms.map(existing => {
              if (!existing.id?.startsWith?.('temp-')) return existing;
              if (existing.fromEmpId === m.fromEmpId && existing.content === m.content && new Date(existing.ts).getTime() >= fiveSecAgo) {
                replaced = true;
                return { ...m };
              }
              return existing;
            });
            if (!replaced && !next.some(x => messageKey(x) === k)) next.push(m);
            return next;
        });
        if (m.toEmpId === me) chatSocket.markRead(m.rideId, active.otherEmpId, m.ts);
        // Flash new message highlight if user scrolled up
        if (!atBottom && m.fromEmpId !== me) {
          setNewMsgFlash(true);
          setTimeout(()=> setNewMsgFlash(false), 1200);
        }
      }
    });
    return () => off();
  }, [me, active, messageKey, atBottom]);

  // Auto-scroll to latest message whenever list changes
  useEffect(() => {
    if (!listRef.current) return;
    if (atBottom) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      // update last seen ts to the latest message
      const last = messages[messages.length - 1];
      if (last) setLastSeenTs(new Date(last.ts).getTime());
    }
  }, [messages, active, atBottom]);

  // Scroll listener for atBottom detection & infinite scroll
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handler = () => {
      const nearTop = el.scrollTop < 80; // px threshold
      if (nearTop && active) {
        // load older if more pages likely
        if (!loading) loadMessages(active.rideId, active.otherEmpId, page + 1);
      }
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
      setAtBottom(bottom);
      if (bottom) {
        const last = messages[messages.length - 1];
        if (last) setLastSeenTs(new Date(last.ts).getTime());
      }
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, [active, loadMessages, page, messages, loading]);

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
    if (!active || !inputRef.current || sending) return;
    const text = inputRef.current.value.trim();
    if (!text) return;
    setSending(true);
    // optimistic append
    const tempId = `temp-${optimisticIdRef.current++}`;
    const tempMsg = { id: tempId, rideId: active.rideId, fromEmpId: me, toEmpId: active.otherEmpId, content: text, ts: new Date().toISOString(), read: false, _status: 'sending' };
    setMessages(ms => [...ms, tempMsg]);
    inputRef.current.value = '';
    autoResize();
    try {
      chatSocket.sendMessage(active.rideId, active.otherEmpId, text);
    } finally {
      setTimeout(()=> setMessages(ms => ms.map(m => m.id === tempId ? { ...m, _status: 'sent' } : m)), 300); // after small delay mark as sent if not replaced
      setSending(false);
    }
  };

  const loadOlder = () => {
    if (!active) return;
    loadMessages(active.rideId, active.otherEmpId, page + 1);
  };

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a,b)=> new Date(b.lastTs||0) - new Date(a.lastTs||0));
  }, [conversations]);

  // Group messages by consecutive sender & 5 min window
  const grouped = useMemo(() => {
    if (!messages.length) return [];
    const groups = [];
    let cur = null;
    for (const m of messages) {
      const ts = new Date(m.ts).getTime();
      if (!cur || cur.fromEmpId !== m.fromEmpId || (ts - cur._lastTs) > 5*60*1000) {
        cur = { fromEmpId: m.fromEmpId, items: [m], _lastTs: ts, firstTs: ts };
        groups.push(cur);
      } else {
        cur.items.push(m);
        cur._lastTs = ts;
      }
    }
    return groups;
  }, [messages]);

  const activeConversationMeta = useMemo(() => active && conversations.find(c=>c.rideId===active.rideId && c.otherEmpId===active.otherEmpId), [active, conversations]);

  const autoResize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(e);
    }
  };

  const showNewDivider = (tsNum) => tsNum > lastSeenTs;

  return (
    <EmployeeLayout heading="Inbox" subheading="Chat with your ride participants">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 border-b text-xs text-gray-500 flex items-center justify-between">
            <span>Conversations</span>
            <span className="text-[10px] text-gray-400">{sortedConversations.length}</span>
          </div>
          <ul className="divide-y">
            {loading && <li className="p-3 text-xs text-gray-400">Loading...</li>}
            {!loading && sortedConversations.length === 0 && <li className="p-3 text-xs text-gray-400">No conversations yet</li>}
            {sortedConversations.map(c => (
              <li key={`${c.rideId}-${c.otherEmpId}`} className={`p-3 cursor-pointer hover:bg-orange-50 transition-colors ${active && active.rideId===c.rideId && active.otherEmpId===c.otherEmpId ? 'bg-orange-50' : ''}`} onClick={()=>selectConversation(c)}>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[11px] font-semibold shadow-sm">{getInitials(c.otherName || c.otherEmpId)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm truncate">{c.otherName || c.otherEmpId}</div>
                      <div className="text-[10px] text-gray-400 whitespace-nowrap">{relativeTime(c.lastTs)}</div>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{c.lastPreview}</div>
                  </div>
                  {!!c.unread && <span className="ml-2 inline-block min-w-5 px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] text-center self-start">{c.unread}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 bg-white rounded-xl shadow border border-gray-100 flex flex-col">
          <div className="px-3 py-2 border-b flex items-center gap-2 text-sm">
            {active ? (
              <>
                <button className="p-1 rounded hover:bg-gray-100 md:hidden" onClick={()=>setActive(null)}><FaChevronLeft/></button>
                <div className="font-semibold truncate flex-1 flex items-center gap-2">
                  <span className="hidden sm:inline w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-[11px] text-white flex items-center justify-center font-semibold">{getInitials(activeConversationMeta?.otherName || active.otherEmpId)}</span>
                  <span>{(activeConversationMeta?.otherName) || active.otherEmpId}</span>
                </div>
                {active.closed && <span className="text-[11px] text-red-600">Closed</span>}
                <div className="ml-auto flex items-center gap-2">
                  {!active.closed && (
                    <button onClick={deleteConversation} className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 text-[11px]">Delete</button>
                  )}
                </div>
              </>
            ) : <div className="text-xs text-gray-500">Select a conversation</div>}
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative" aria-live="polite">
            {active && grouped.map((g, gi) => {
              const incoming = g.fromEmpId !== me;
              const showAvatar = incoming; // only show avatar for incoming groups
              return (
                <div key={g.firstTs + '-' + gi} className={`flex ${incoming ? 'items-start' : 'items-end flex-col'} gap-1`}> 
                  {g.items.map((m, i) => {
                    const tsNum = new Date(m.ts).getTime();
                    const isLastInGroup = i === g.items.length - 1;
                    const showDivider = incoming && showNewDivider(tsNum) && !atBottom; // show NEW marker on first new incoming
                    return (
                      <React.Fragment key={messageKey(m)}>
                        {showDivider && (
                          <div className="w-full flex items-center my-2">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
                            <span className="px-2 text-[10px] uppercase tracking-wide text-orange-600 font-medium">New</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
                          </div>
                        )}
                        <div className={`group max-w-[78%] ${incoming ? 'self-start' : 'self-end'} flex ${incoming ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
                          {showAvatar && i === 0 && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[11px] font-semibold flex items-center justify-center shadow-sm select-none">{getInitials(activeConversationMeta?.otherName || active.otherEmpId)}</div>
                          )}
                          <div className={`rounded-2xl px-3 py-2 text-sm shadow-sm relative ${incoming ? 'bg-gray-100 text-gray-800' : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'} ${m._status==='sending' ? 'opacity-80' : ''}`}>
                            <div className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</div>
                            {isLastInGroup && (
                              <div className={`mt-1 flex items-center gap-1 ${incoming ? 'text-gray-500' : 'text-white/80'} text-[10px]`}> 
                                <span>{formatClock(m.ts)}</span>
                                {m.fromEmpId === me && (
                                  <span className="flex items-center gap-0.5">
                                    <svg className={`w-3 h-3 ${m.read ? '' : 'opacity-60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    {m.read && (
                                      <svg className="w-3 h-3 -ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })}
            {active && page > 0 && (
              <div className="text-center">
                <button onClick={loadOlder} className="inline-flex items-center gap-1 px-3 py-1 text-[11px] rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"><FaChevronDown/> Load older</button>
              </div>
            )}
            {!active && (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">Select a conversation to start chatting</div>
            )}
            {!atBottom && active && (
              <button onClick={()=>{ if(listRef.current){ listRef.current.scrollTop = listRef.current.scrollHeight; } }} className={`absolute left-1/2 -translate-x-1/2 bottom-3 px-3 py-1 rounded-full shadow text-xs flex items-center gap-1 bg-orange-600 text-white hover:bg-orange-500 transition ${newMsgFlash ? 'ring-2 ring-offset-2 ring-orange-300' : ''}`}>
                Jump to latest
              </button>
            )}
          </div>
          <form onSubmit={send} className="p-2 border-t flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                disabled={!active || active.closed}
                onInput={autoResize}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder={active ? (active.closed ? 'Chat closed' : 'Type a message...') : 'Select a conversation'}
                className="w-full resize-none px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm leading-relaxed disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <div className="absolute right-2 -bottom-4 text-[10px] text-gray-400 select-none">Enter to send • Shift+Enter newline</div>
            </div>
            <button aria-label="Send message" disabled={!active || active.closed || sending} className="px-3 py-2 rounded-lg bg-orange-600 text-white disabled:opacity-50 flex items-center justify-center h-10 w-10">
              <FaPaperPlane className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default Inbox;
