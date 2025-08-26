import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../../api/axios';
import PageContainer from '../../../components/PageContainer';

// Simple marker icon fix for default marker (since webpack / CRA asset handling)
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25,41], iconAnchor:[12,41], popupAnchor:[1,-34], shadowSize:[41,41]
});
L.Marker.prototype.options.icon = defaultIcon;

const steps = [
  'FROM_TO', 'ROUTE', 'DATE', 'TIME', 'SEATS', 'APPROVAL', 'PRICE', 'COMMENT', 'CONFIRM'
]; // simplified flow using predefined locations

function OfferRideWizard() {
  const [step, setStep] = useState('FROM_TO');
  const [locations, setLocations] = useState([]); // list from /locations
  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const origin = locations.find(l => String(l.id) === String(originId));
  const destination = locations.find(l => String(l.id) === String(destinationId));
  const [routeCoords, setRouteCoords] = useState([]); // polyline [[lat,lng],...]
  const [routeSummary, setRouteSummary] = useState(null); // {distance,duration}
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState(3);
  const [comfortBack, setComfortBack] = useState(false);
  const [instant, setInstant] = useState(true);
  const [price, setPrice] = useState('');
  const [driverNote, setDriverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState(4);
  const [vehicleStatus, setVehicleStatus] = useState(null); // raw response
  const [vehicleAllowed, setVehicleAllowed] = useState(false);
  const [hasActiveRide, setHasActiveRide] = useState(false); // separate gating reason so vehicle link not shown when active ride exists

  useEffect(()=>{ // fetch vehicle status & capacity + locations
    (async()=>{
      try {
        const r = await api.get('/vehicle/my');
        setVehicleStatus(r.data);
        if (r.data?.capacity) setVehicleCapacity(r.data.capacity);
        if (r.data?.status === 'APPROVED') setVehicleAllowed(true); else setVehicleAllowed(false);
      } catch(e){
        setVehicleStatus(null);
        setVehicleAllowed(false);
      }
      try {
        const locRes = await api.get('/locations');
        setLocations(locRes.data || []);
      } catch(e){ /* ignore */ }
      try {
        const activeRes = await api.get('/ride/active/current');
        if (activeRes.data?.active) {
          setHasActiveRide(true); // block form, but keep vehicleAllowed flag separate so we can conditionally show correct banner
        }
      } catch(e){ /* ignore */ }
    })();
  },[]);

  const canContinue = () => {
  if (hasActiveRide && step !== 'CONFIRM') return false;
  if (!vehicleAllowed && step !== 'CONFIRM') return false;
    switch(step){
      case 'FROM_TO': return originId && destinationId && originId !== destinationId;
      case 'ROUTE': return routeCoords.length>1;
      case 'DATE': return !!date;
      case 'TIME': return !!time;
      case 'SEATS': return seats>0;
      case 'PRICE': return price==='' || parseFloat(price)>=0;
      default: return true;
    }
  };

  const goNext = () => { if (canContinue()) setStep(steps[steps.indexOf(step)+1]); };
  const goPrev = () => { const i = steps.indexOf(step); if (i>0) setStep(steps[i-1]); };

  // Fetch route using OSRM public server (demo). In production you might self-host or use openrouteservice.
  const fetchRoute = async () => {
    if (!origin || !destination || !origin.latitude || !origin.longitude || !destination.latitude || !destination.longitude) return;
    try {
      setError('');
      const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`; // OSRM expects lon,lat
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const json = await res.json();
      if (json?.routes?.length){
        const r = json.routes[0];
        const line = r.geometry.coordinates.map(c=>[c[1],c[0]]);
        setRouteCoords(line);
        setRouteSummary({distance: r.distance, duration: r.duration});
      } else setError('No route found');
    } catch(e){ setError('Routing failed'); }
  };
  useEffect(()=>{ if (step==='ROUTE') fetchRoute(); /* eslint-disable react-hooks/exhaustive-deps */ },[step]);

  const submit = async () => {
    setSubmitting(true); setError('');
    try {
      await api.post('/ride/offer', {
        origin: origin?.name,
        destination: destination?.name,
        date,
        arrivalTime: time,
        carDetails: '', // backend derives
        totalSeats: seats,
        instantBookingEnabled: instant,
        fare: price,
        originLat: origin?.latitude,
        originLng: origin?.longitude,
        destinationLat: destination?.latitude,
        destinationLng: destination?.longitude,
        routeDistanceMeters: routeSummary?.distance ? Math.round(routeSummary.distance) : undefined,
        routeDurationSeconds: routeSummary?.duration ? Math.round(routeSummary.duration) : undefined,
        routeGeometry: routeCoords.length? JSON.stringify(routeCoords): undefined,
        driverNote: (driverNote || '') + (comfortBack ? ((driverNote? '\n':'') + 'Max 2 passengers in back row for comfort.') : '')
      });
      setStep('CONFIRM');
    } catch(e){
      if (e?.response?.status === 403) {
        // differentiate likely causes
        const msg = e.response?.data?.message || 'Forbidden. Vehicle not approved or session invalid.';
        setError(msg);
        if (msg.toLowerCase().includes('vehicle')) {
          // force re-check vehicle so user sees gating content
          setVehicleAllowed(false);
        }
      } else if (e?.response?.status === 409) {
        setError(e.response?.data?.message || 'You already have an active ride.');
      } else {
        setError(e.response?.data?.message || 'Failed to publish');
      }
    }
    finally { setSubmitting(false); }
  };

  const wizardHeader = (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-[#054652]">{step==='CONFIRM'? 'Ride Published' : 'Publish a ride'}</h1>
      {(!hasActiveRide && !vehicleAllowed && step!=='CONFIRM') && (
        <div className="mt-4 mx-auto max-w-xl text-left bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-xs">
          {vehicleStatus === null && 'Vehicle details not found. Please register your vehicle first.'}
          {vehicleStatus && vehicleStatus.status === 'PENDING' && 'Your vehicle is pending approval. You can fill the form but cannot publish until it is approved.'}
          {vehicleStatus && vehicleStatus.status === 'REJECTED' && (
            <span>Vehicle rejected: {vehicleStatus.rejectionReason || 'See vehicle page.'}</span>
          )}
          <div className="mt-2">
            <a href="/employee/vehicle" className="text-blue-700 underline">Go to Vehicle Page</a>
          </div>
        </div>
      )}
      {step!=='CONFIRM' && vehicleAllowed && <p className="text-sm text-gray-500 mt-1">Step {steps.indexOf(step)+1} of {steps.length}</p>}
    </div>
  );

  const Nav = step!=='CONFIRM' && (
    <div className="flex justify-between mt-8">
      <button onClick={goPrev} disabled={steps.indexOf(step)===0 || !vehicleAllowed || hasActiveRide} className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-40">Back</button>
      {step==='COMMENT'
        ? <button onClick={submit} disabled={submitting || !vehicleAllowed || hasActiveRide} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">{submitting? 'Publishing...' : 'Publish ride'}</button>
        : <button onClick={goNext} disabled={!canContinue()} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">Continue</button>}
    </div>
  );

  const renderStep = () => {
  switch(step){
      case 'FROM_TO': return (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-1">From Location</label>
              <select value={originId} onChange={e=>{setOriginId(e.target.value); setRouteCoords([]); setRouteSummary(null);}} className="w-full border rounded-lg px-3 py-2">
                <option value="">Select Origin</option>
                {locations.map(l=> <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">To Location</label>
              <select value={destinationId} onChange={e=>{setDestinationId(e.target.value); setRouteCoords([]); setRouteSummary(null);}} className="w-full border rounded-lg px-3 py-2">
                <option value="">Select Destination</option>
                {locations.map(l=> <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-500">Choose from predefined office / hub locations.</p>
          </div>
          <div className="h-80 rounded-xl overflow-hidden border w-full">
            <MapContainer center={origin? [origin.latitude, origin.longitude] : [28.6139,77.2090]} zoom={9} style={{height:'100%', width:'100%'}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {origin && <Marker position={[origin.latitude, origin.longitude]} />}
              {destination && <Marker position={[destination.latitude, destination.longitude]} />}
            </MapContainer>
          </div>
        </div>
      );
      case 'ROUTE': return (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">What is your route?</h2>
            <p className="text-xs text-gray-500">We calculated the fastest route. (Multiple route options can be added later.)</p>
            {routeSummary && <div className="text-sm bg-blue-50 p-3 rounded">Distance: {(routeSummary.distance/1000).toFixed(1)} km<br/>Duration: {(routeSummary.duration/3600).toFixed(1)} h</div>}
            {!routeSummary && <div className="text-xs text-gray-400">Loading route...</div>}
          </div>
          <div className="h-80 rounded-xl overflow-hidden border">
            <MapContainer center={origin? [origin.latitude, origin.longitude]: [28.6,77.2]} zoom={7} style={{height:'100%', width:'100%'}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {origin && <Marker position={[origin.latitude, origin.longitude]} />}
              {destination && <Marker position={[destination.latitude, destination.longitude]} />}
              {routeCoords.length>1 && <Polyline pathOptions={{color:'#0077b6'}} positions={routeCoords} />}
            </MapContainer>
          </div>
        </div>
      );
      case 'DATE': return (
        <div className="max-w-sm mx-auto space-y-4">
          <h2 className="text-xl font-bold">When are you going?</h2>
          <input type="date" className="w-full border rounded-lg px-3 py-2" min={new Date().toISOString().split('T')[0]} value={date} onChange={e=>setDate(e.target.value)} />
        </div>
      );
      case 'TIME': return (
        <div className="max-w-sm mx-auto space-y-4">
          <h2 className="text-xl font-bold">At what time will you pick passengers up?</h2>
          <input type="time" className="w-full border rounded-lg px-3 py-2 text-center text-3xl font-semibold" value={time} onChange={e=>setTime(e.target.value)} />
        </div>
      );
      case 'SEATS': return (
        <div className="max-w-sm mx-auto space-y-6">
          <h2 className="text-xl font-bold">How many passengers can you take?</h2>
          <div className="flex items-center justify-center gap-8 text-5xl font-bold">
            <button type="button" onClick={()=>setSeats(s=>Math.max(1,s-1))} className="w-14 h-14 rounded-full bg-gray-100">-</button>
            <span>{seats}</span>
            <button type="button" onClick={()=>setSeats(s=>{const max = comfortBack? Math.min(vehicleCapacity, vehicleCapacity-1) : vehicleCapacity; return Math.min(max,s+1);})} className="w-14 h-14 rounded-full bg-gray-100">+</button>
          </div>
          <label className="flex items-start gap-3 text-sm cursor-pointer select-none justify-center">
            <input type="checkbox" checked={comfortBack} onChange={e=>{ const v=e.target.checked; setComfortBack(v); setSeats(s=>{ const max = v? Math.min(vehicleCapacity, vehicleCapacity-1): vehicleCapacity; return Math.min(s,max); }); }} />
            <span><span className="font-medium">Max 2 in the back</span><br/><span className="text-xs text-gray-500">Think comfort, keep the middle seat empty</span></span>
          </label>
          <p className="text-xs text-gray-500 text-center">Capacity up to {comfortBack? Math.min(vehicleCapacity, vehicleCapacity-1): vehicleCapacity}</p>
        </div>
      );
      case 'APPROVAL': return (
        <div className="max-w-lg mx-auto space-y-6">
          <h2 className="text-xl font-bold">Enable Instant Booking for your passengers</h2>
          <div className="space-y-3 text-sm">
            <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer bg-white shadow-sm">
              <input type="radio" name="instant" checked={instant} onChange={()=>setInstant(true)} />
              <div><div className="font-semibold">Enable Instant Booking</div><div className="text-xs text-gray-500">Passengers join automatically.</div></div>
            </label>
            <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer bg-white shadow-sm">
              <input type="radio" name="instant" checked={!instant} onChange={()=>setInstant(false)} />
              <div><div className="font-semibold">Review every request</div><div className="text-xs text-gray-500">You approve or decline each booking.</div></div>
            </label>
          </div>
        </div>
      );
      case 'PRICE': return (
        <div className="max-w-sm mx-auto space-y-4">
          <h2 className="text-xl font-bold">Set your price per seat</h2>
          <div className="flex items-center justify-center text-6xl font-extrabold text-green-600">₹{price || '0'}</div>
          <div className="flex gap-3 justify-center">
            <button onClick={()=>setPrice(p=>{const v=Math.max(0,(+p||0)-10);return v.toString();})} className="w-10 h-10 rounded-full bg-gray-100">-</button>
            <button onClick={()=>setPrice(p=>{const v=(+p||0)+10;return v.toString();})} className="w-10 h-10 rounded-full bg-gray-100">+</button>
          </div>
          <input type="number" min="0" value={price} onChange={e=>setPrice(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Custom price (₹)" />
          <p className="text-xs text-gray-500 text-center">Leave 0 for free.</p>
        </div>
      );
      case 'COMMENT': return (
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-xl font-bold">Ready to publish your ride?</h2>
          <textarea rows={6} value={driverNote} onChange={e=>setDriverNote(e.target.value)} placeholder="Add a comment for passengers (meeting details, luggage, etc.)" className="w-full border rounded-lg px-4 py-3" />
        </div>
      );
      case 'CONFIRM': return (
        <div className="max-w-md mx-auto text-center space-y-6 py-10">
          <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold">Ride published!</h2>
            <p className="text-sm text-gray-500">Your ride from <strong>{origin?.name}</strong> to <strong>{destination?.name}</strong> on {date} at {time} is live.</p>
            <a href="/employee/history/published" className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold">View ride</a>
            <a href="/employee/offer" className="block text-xs text-blue-600 underline">Publish another</a>
        </div>
      );
      default: return null;
    }
  };

  // If an active ride exists (and not in CONFIRM step) show only the blocking message, hide everything else
  if (hasActiveRide && step !== 'CONFIRM') {
    return (
      <PageContainer>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div
            className="relative w-full max-w-2xl mx-auto p-10 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-200/70 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)]"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-grey border border-amber-200 flex items-center justify-center shadow-inner">
                  <span className="text-3xl" aria-hidden="true">🚗</span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#054652]">
                  You already have a published ride.
                </h1>
                <p className="text-sm md:text-base leading-relaxed text-[#5F7C81] font-medium">
                  End or cancel your current ride before publishing a new one. This ensures passengers aren\'t double‑booked.
                </p>
              </div>
            </div>
            <div className="absolute inset-x-0 -bottom-4 mx-auto h-2 max-w-[240px] bg-gradient-to-r from-transparent via-amber-300/60 to-transparent rounded-full blur-sm" aria-hidden="true" />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {wizardHeader}
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">{error}</div>}
        {renderStep()}
        {Nav}
      </div>
    </PageContainer>
  );
}
export default OfferRideWizard;
