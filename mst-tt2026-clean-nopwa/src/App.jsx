import { useState, useEffect, useMemo, useRef } from 'react'
import { DRIVERS, HOTELS, ROAD_CLOSURES, ALL_DATES, CONTACTS, DESTINATIONS, NO_SHOW_FEE } from './data.js'
import { BASE_JOBS } from './jobs.js'
import {
  isFirebaseConfigured, subscribeToJobs, saveJobToCloud, deleteJobFromCloud,
  updateDriverLocation, subscribeToLocations
} from './firebase.js'
import {
  addMins, getPickupTime, getTagColor, getDayAvail, AVAIL_COLOR, AVAIL_LABEL,
  estimateFare, googleMapsUrl, getNavUrl, distance, timeAgo
} from './utils.js'

const S = {
  lbl: { display:"block", fontSize:11, color:"#6b7280", marginBottom:4, textTransform:"uppercase", letterSpacing:1, fontWeight:600 },
  inp: { display:"block", width:"100%", background:"#1f2937", border:"1px solid #374151", borderRadius:6, padding:"9px 10px", color:"#f9fafb", fontSize:14, marginBottom:12, boxSizing:"border-box", outline:"none", fontFamily:"inherit" },
}

// ─── DRIVER SELECT (first visit only) ─────────────────────────────────────────
function DriverSelect({ onSelect }) {
  return (
    <div style={{position:"fixed",inset:0,background:"#030712",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}}>
      <div style={{maxWidth:340,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:11,color:"#6b7280",letterSpacing:3,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>MST · Isle of Man TT 2026</div>
        <h1 style={{margin:"0 0 30px",fontSize:24,fontWeight:800}}>Operations <span style={{color:"#f59e0b"}}>Live</span></h1>
        <div style={{fontSize:13,color:"#9ca3af",marginBottom:18}}>Who's using this device?</div>
        {Object.entries(DRIVERS).filter(([k])=>k==="A"||k==="B").map(([k,d])=>(
          <button key={k} onClick={()=>onSelect(k)} style={{
            display:"block",width:"100%",padding:"16px",marginBottom:10,
            background:`linear-gradient(135deg, ${d.color}22, ${d.color}11)`,
            border:`2px solid ${d.color}`,borderRadius:12,color:d.color,
            fontSize:18,fontWeight:800,cursor:"pointer",
          }}>
            {d.emoji} {d.name}
          </button>
        ))}
        <button onClick={()=>onSelect("viewer")} style={{
          display:"block",width:"100%",padding:"12px",marginTop:8,
          background:"transparent",border:"1px solid #374151",borderRadius:10,color:"#6b7280",fontSize:13,cursor:"pointer",
        }}>
          Just viewing (read-only)
        </button>
      </div>
    </div>
  )
}

// ─── HOTEL CHIPS ─────────────────────────────────────────────────────────────
function HotelChips({ hotels }) {
  return (
    <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
      {Object.entries(hotels||{}).map(([h,n])=>(
        <span key={h} style={{
          background:HOTELS[h]?.color||"#555",color:"#fff",borderRadius:3,padding:"1px 5px",
          fontSize:10,fontWeight:700,fontFamily:"monospace",
        }}>{HOTELS[h]?.short || h.slice(0,2)} ×{n}</span>
      ))}
    </div>
  )
}

// ─── MANIFEST MODAL ──────────────────────────────────────────────────────────
function ManifestModal({ job, onClose, onUpdate, readOnly }) {
  const allParties = job.parties || []
  const contacts = allParties.flatMap(p => (CONTACTS[p]||[]).map(c => ({...c, party: p})))
  const [boarded, setBoarded] = useState(job.boarded || {})
  const [noShows, setNoShows] = useState(job.noShows || {})

  const toggleBoard = key => {
    if (readOnly) return
    setBoarded(b => ({...b, [key]: !b[key]}))
    setNoShows(n => ({...n, [key]: false}))
  }
  const toggleNoShow = key => {
    if (readOnly) return
    setNoShows(n => ({...n, [key]: !n[key]}))
    setBoarded(b => ({...b, [key]: false}))
  }

  const boardedCount = Object.values(boarded).filter(Boolean).length
  const noShowCount = Object.values(noShows).filter(Boolean).length

  function handleSave() {
    onUpdate({ ...job, boarded, noShows })
    onClose()
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:2000}}>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderTopLeftRadius:16,borderTopRightRadius:16,padding:20,width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#374151",borderRadius:2,margin:"0 auto 14px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <h3 style={{margin:0,fontSize:16,color:"#f9fafb"}}>
              {job.type==="race" ? `🏁 ${job.dest}` : `✈ ${job.flight}`}
            </h3>
            <div style={{fontSize:11,color:"#6b7280",marginTop:3}}>
              Pickup: <strong style={{color:"#f9fafb"}}>{getPickupTime(job)}</strong> · {job.pax} pax
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7280",fontSize:24,padding:0,lineHeight:1}}>×</button>
        </div>

        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>
          {Object.entries(job.hotels||{}).map(([h,n])=>(
            <span key={h} style={{background:HOTELS[h]?.color||"#555",color:"#fff",borderRadius:4,padding:"3px 9px",fontSize:11,fontWeight:700}}>
              {HOTELS[h]?.short||h.slice(0,2)} ×{n}
            </span>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
          {[
            {l:"Expected",v:job.pax,c:"#9ca3af"},
            {l:"Boarded",v:boardedCount,c:"#22c55e"},
            {l:"No-show",v:noShowCount,c:"#ef4444"},
          ].map(({l,v,c})=>(
            <div key={l} style={{background:"#111827",borderRadius:8,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:800,color:c,fontFamily:"monospace"}}>{v}</div>
              <div style={{fontSize:10,color:"#6b7280"}}>{l}</div>
            </div>
          ))}
        </div>

        {contacts.length > 0 ? contacts.map((c,i) => {
          const key = `${c.party}-${i}`
          const isBoarded = boarded[key]
          const isNoShow = noShows[key]
          return (
            <div key={key} style={{
              background:isBoarded?"#0a1a0e":isNoShow?"#1c0a0a":"#111827",
              border:`1px solid ${isBoarded?"#22c55e44":isNoShow?"#ef444444":"#1e293b"}`,
              borderRadius:8,padding:"10px 12px",marginBottom:7,
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#f9fafb"}}>{c.lead}</div>
                  <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{c.party} · {c.pax} pax</div>
                  {c.contact && (
                    <a href={`tel:${c.contact.replace(/\s/g,"")}`} style={{
                      fontSize:13,color:"#3b82f6",display:"inline-block",marginTop:4,fontFamily:"monospace",
                    }}>📞 {c.contact}</a>
                  )}
                  {c.notes && <div style={{fontSize:11,color:"#f59e0b",marginTop:3}}>{c.notes}</div>}
                </div>
                {!readOnly && (
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    <button onClick={()=>toggleBoard(key)} style={{
                      padding:"7px 12px",borderRadius:6,fontSize:13,fontWeight:700,
                      background:isBoarded?"#14532d":"#1f2937",
                      border:`1px solid ${isBoarded?"#22c55e":"#374151"}`,
                      color:isBoarded?"#4ade80":"#9ca3af",
                    }}>{isBoarded?"✓":"On"}</button>
                    <button onClick={()=>toggleNoShow(key)} style={{
                      padding:"7px 10px",borderRadius:6,fontSize:13,
                      background:isNoShow?"#450a0a":"#1f2937",
                      border:`1px solid ${isNoShow?"#ef4444":"#374151"}`,
                      color:isNoShow?"#f87171":"#9ca3af",
                    }}>✗</button>
                  </div>
                )}
              </div>
            </div>
          )
        }) : (
          <div style={{textAlign:"center",padding:"24px 0",color:"#6b7280",fontSize:13}}>
            Bulk transfer — {job.pax} pax across hotels (no individual contacts)
          </div>
        )}

        {noShowCount > 0 && (
          <div style={{background:"#450a0a",border:"1px solid #7f1d1d",borderRadius:8,padding:"10px 12px",marginTop:8}}>
            <div style={{fontSize:12,color:"#fca5a5",fontWeight:700}}>
              {noShowCount} no-show fee: £{(noShowCount * NO_SHOW_FEE.t1).toFixed(2)} (T1)
            </div>
          </div>
        )}

        {!readOnly && (
          <button onClick={handleSave} style={{
            width:"100%",marginTop:14,padding:"13px",background:"#1d4ed8",border:"none",
            borderRadius:10,color:"#fff",fontWeight:700,fontSize:15,
          }}>Save & Close</button>
        )}
      </div>
    </div>
  )
}

// ─── ADD/EDIT MODAL ──────────────────────────────────────────────────────────
function JobModal({ date, existing, onSave, onClose }) {
  const def = existing || {}
  const initFare = def.id ? (def.fareOverride!=null ? def.fareOverride : estimateFare(def).total) : ""
  const [form, setForm] = useState({
    type: def.type || "arrival",
    flight: def.flight || "", flightTime: def.flightTime || "",
    pax: def.pax || "", bus: def.bus || "A",
    dest: def.dest || "", pickupTime: def.pickupTime || "",
    notes: def.notes || "", fareOverride: initFare, paid: def.paid || false,
    hotelCH: def.hotels?.["Chesterhouse"] || "",
    hotelCL: def.hotels?.["Claremont"] || "",
    hotelRU: def.hotels?.["Rutland"] || "",
    hotelEV: def.hotels?.["Ellan Vannin Hotel"] || "",
    hotelBW: def.hotels?.["Best Western Palace Hotel & Casino"] || "",
    hotelOtherName: "", hotelOtherPax: "",
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const autoFare = useMemo(() => {
    const mock = {
      type: form.type, flightTime: form.flightTime, pickupTime: form.pickupTime,
      dest: form.dest, pax: +form.pax || 0,
      hotels: {
        ...(+form.hotelCH ? {"Chesterhouse":+form.hotelCH} : {}),
        ...(+form.hotelCL ? {"Claremont":+form.hotelCL} : {}),
        ...(+form.hotelRU ? {"Rutland":+form.hotelRU} : {}),
        ...(+form.hotelEV ? {"Ellan Vannin Hotel":+form.hotelEV} : {}),
        ...(+form.hotelBW ? {"Best Western Palace Hotel & Casino":+form.hotelBW} : {}),
      }
    }
    return estimateFare(mock)
  }, [form])

  function handleSave() {
    const hotels = {}
    if (+form.hotelCH) hotels["Chesterhouse"] = +form.hotelCH
    if (+form.hotelCL) hotels["Claremont"] = +form.hotelCL
    if (+form.hotelRU) hotels["Rutland"] = +form.hotelRU
    if (+form.hotelEV) hotels["Ellan Vannin Hotel"] = +form.hotelEV
    if (+form.hotelBW) hotels["Best Western Palace Hotel & Casino"] = +form.hotelBW
    if (form.hotelOtherName && +form.hotelOtherPax) hotels[form.hotelOtherName] = +form.hotelOtherPax
    const fareVal = form.fareOverride !== "" ? parseFloat(form.fareOverride) : null
    const job = {
      id: def.id || `custom-${Date.now()}`,
      date, type: form.type, pax: +form.pax || 0,
      hotels, notes: form.notes, paid: form.paid, fareOverride: fareVal,
    }
    if (form.type === "race") {
      Object.assign(job, { dest: form.dest, pickupTime: form.pickupTime, busA: 16, busB: 16 })
      job.overflow = Math.max(0, job.pax - 32)
      job.overflowNote = job.overflow > 0 ? `${job.overflow} pax over capacity` : ""
    } else {
      Object.assign(job, { flight: form.flight, flightTime: form.flightTime, bus: form.bus })
    }
    onSave(job)
  }

  const tc = { arrival:"#3b82f6", departure:"#10b981", race:"#f59e0b", custom:"#a855f7" }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderTopLeftRadius:16,borderTopRightRadius:16,padding:20,width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#374151",borderRadius:2,margin:"0 auto 14px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
          <h3 style={{color:"#f9fafb",margin:0,fontSize:16}}>{def.id?"Edit":"Add"} Job — {date}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7280",fontSize:24,padding:0,lineHeight:1}}>×</button>
        </div>

        <label style={S.lbl}>Type</label>
        <div style={{display:"flex",gap:5,marginBottom:14}}>
          {["arrival","departure","race","custom"].map(t => (
            <button key={t} onClick={()=>set("type",t)} style={{
              flex:1,padding:"9px 2px",borderRadius:8,fontSize:11,fontWeight:700,
              background: form.type===t ? `${tc[t]}22` : "#1f2937",
              border:`1px solid ${form.type===t ? tc[t] : "#374151"}`,
              color: form.type===t ? tc[t] : "#6b7280",
            }}>{t.toUpperCase()}</button>
          ))}
        </div>

        {form.type === "race" ? (
          <>
            <label style={S.lbl}>Destination</label>
            <input style={S.inp} value={form.dest} onChange={e=>set("dest",e.target.value)} placeholder="e.g. Hillberry"/>
            <label style={S.lbl}>Pickup Time</label>
            <input style={S.inp} type="time" value={form.pickupTime} onChange={e=>set("pickupTime",e.target.value)}/>
          </>
        ) : (
          <>
            <label style={S.lbl}>Flight Number</label>
            <input style={S.inp} value={form.flight} onChange={e=>set("flight",e.target.value.toUpperCase())} placeholder="e.g. EI3212"/>
            <label style={S.lbl}>{form.type==="arrival" ? "Landing" : "Departure"} Time</label>
            <input style={S.inp} type="time" value={form.flightTime} onChange={e=>set("flightTime",e.target.value)}/>
            <label style={S.lbl}>Driver</label>
            <div style={{display:"flex",gap:5,marginBottom:14}}>
              {Object.entries(DRIVERS).map(([k,d])=>(
                <button key={k} onClick={()=>set("bus",k)} style={{
                  flex:1,padding:"9px 2px",borderRadius:8,fontSize:11,fontWeight:700,
                  background: form.bus===k ? `${d.color}22` : "#1f2937",
                  border:`1px solid ${form.bus===k ? d.color : "#374151"}`,
                  color: form.bus===k ? d.color : "#6b7280",
                }}>{d.name}</button>
              ))}
            </div>
          </>
        )}

        <label style={S.lbl}>Total Pax</label>
        <input style={S.inp} type="number" value={form.pax} onChange={e=>set("pax",e.target.value)} placeholder="0"/>

        <label style={S.lbl}>Hotel Split</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {[
            ["hotelCH","Chesterhouse","#f97316"],
            ["hotelCL","Claremont","#3b82f6"],
            ["hotelRU","Rutland","#10b981"],
            ["hotelEV","Ellan Vannin","#a855f7"],
            ["hotelBW","Best Western","#ec4899"],
          ].map(([k,lbl,col]) => (
            <div key={k}>
              <div style={{fontSize:11,color:col,marginBottom:3,fontWeight:700}}>{lbl}</div>
              <input style={{...S.inp,marginBottom:0}} type="number" value={form[k]} onChange={e=>set(k,e.target.value)} placeholder="0"/>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8,marginBottom:14}}>
          <input style={{...S.inp,marginBottom:0}} value={form.hotelOtherName} onChange={e=>set("hotelOtherName",e.target.value)} placeholder="Other hotel"/>
          <input style={{...S.inp,marginBottom:0}} type="number" value={form.hotelOtherPax} onChange={e=>set("hotelOtherPax",e.target.value)} placeholder="Pax"/>
        </div>

        <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:10,padding:12,marginBottom:14}}>
          <div style={{fontSize:11,color:"#6b7280",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>— Fare —</div>
          <div style={{fontSize:13,marginBottom:8}}>
            <span style={{color:"#9ca3af"}}>Auto: </span>
            <strong style={{color: autoFare.tariff===2 ? "#f59e0b" : "#f9fafb"}}>£{autoFare.total.toFixed(2)} (T{autoFare.tariff})</strong>
            {autoFare.extraStops>0 && <span style={{color:"#6b7280"}}> · +£{autoFare.extraStops} extra stops</span>}
          </div>
          <label style={S.lbl}>Override (blank = auto)</label>
          <input style={{...S.inp,marginBottom:10}} type="number" step="0.50" value={form.fareOverride} onChange={e=>set("fareOverride",e.target.value)} placeholder={`£${autoFare.total.toFixed(2)}`}/>
          <button onClick={()=>set("paid",!form.paid)} style={{
            padding:"9px 14px",borderRadius:8,fontWeight:700,fontSize:13,
            background: form.paid ? "#14532d" : "#1f2937",
            border:`1px solid ${form.paid ? "#22c55e" : "#374151"}`,
            color: form.paid ? "#4ade80" : "#9ca3af",
          }}>{form.paid ? "✓ PAID" : "Mark as Paid"}</button>
        </div>

        <label style={S.lbl}>Notes</label>
        <textarea style={{...S.inp,height:60,resize:"vertical"}} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Special requirements..."/>

        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={handleSave} style={{flex:1,padding:"13px",background:"#1d4ed8",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15}}>{def.id?"Update":"Save"}</button>
          <button onClick={onClose} style={{padding:"13px 18px",background:"#1f2937",border:"1px solid #374151",borderRadius:10,color:"#9ca3af",fontSize:15}}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── JOB CARD ────────────────────────────────────────────────────────────────
function JobCard({ job, onEdit, onDelete, onTogglePaid, onOpenManifest, readOnly }) {
  const pickup = getPickupTime(job)
  const isRace = job.type === "race"
  const borderColor = isRace ? "#f59e0b" : job.type === "arrival" ? "#3b82f6" : "#10b981"
  const fare = estimateFare(job)
  const fareAmt = job.fareOverride != null ? job.fareOverride : fare.total
  const boardedCount = Object.values(job.boarded||{}).filter(Boolean).length
  const noShowCount = Object.values(job.noShows||{}).filter(Boolean).length
  const driver = job.bus ? DRIVERS[job.bus] : null
  const navUrl = getNavUrl(job)

  return (
    <div className="fade-in" style={{
      background: job.paid ? "#0a1a0e" : "#111827",
      border:`1px solid ${(job.overflow||0)>0 ? "#ef4444" : job.paid ? "#22c55e44" : borderColor}`,
      borderLeft:`3px solid ${(job.overflow||0)>0 ? "#ef4444" : job.paid ? "#22c55e" : borderColor}`,
      borderRadius:8,padding:"10px 12px",marginBottom:8,
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:1,color:borderColor,fontFamily:"monospace"}}>
              {isRace?"🏁 RACE":job.type==="arrival"?"▲ ARR":"▼ DEP"}
            </span>
            {isRace
              ? <span style={{fontSize:13,fontWeight:700,color:"#f9fafb"}}>{job.dest}</span>
              : <span style={{fontSize:13,fontWeight:700,color:"#f9fafb"}}>{job.flight} @ {job.flightTime}</span>
            }
            {driver && <span style={{fontSize:10,fontWeight:700,color:driver.color}}>{driver.name}</span>}
          </div>

          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
            <span style={{fontSize:11,fontFamily:"monospace",color:"#9ca3af"}}>
              🚐 {isRace?"Pickup":job.type==="arrival"?"Collect":"Hotel pickup"}: <strong style={{color:"#f9fafb"}}>{pickup}</strong>
            </span>
            <span style={{fontSize:11,color:"#9ca3af",fontFamily:"monospace"}}>👥 {job.pax} pax</span>
            <span style={{
              fontSize:12,fontWeight:700,fontFamily:"monospace",borderRadius:4,padding:"1px 7px",
              background: job.paid?"#14532d":job.fareOverride!=null?"#1e3a5f":"#1c1f26",
              border:`1px solid ${job.paid?"#22c55e":job.fareOverride!=null?"#3b82f6":"#374151"}`,
              color: job.paid?"#4ade80":job.fareOverride!=null?"#93c5fd":"#f9fafb",
            }}>£{Number(fareAmt).toFixed(0)}{job.paid && " ✓"}</span>
          </div>

          <HotelChips hotels={job.hotels}/>

          {isRace && job.overflow>0 && (
            <div style={{fontSize:11,color:"#fca5a5",background:"#450a0a",borderRadius:4,padding:"3px 8px",display:"inline-block",marginTop:5}}>⚠️ {job.overflowNote}</div>
          )}
          {isRace && job.notes && <div style={{fontSize:11,color:"#6b7280",marginTop:4}}>{job.notes}</div>}

          {(boardedCount>0 || noShowCount>0) && (
            <div style={{marginTop:5,fontSize:11,display:"flex",gap:8}}>
              {boardedCount>0 && <span style={{color:"#4ade80"}}>✓ {boardedCount} on</span>}
              {noShowCount>0 && <span style={{color:"#f87171"}}>✗ {noShowCount} no-show</span>}
            </div>
          )}

          {/* Action row */}
          <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
            <button onClick={()=>onOpenManifest(job)} style={{
              padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:700,
              background:"#1e3a5f",border:"1px solid #3b82f6",color:"#93c5fd",
            }}>📋 List</button>
            {navUrl && (
              <a href={navUrl} target="_blank" rel="noopener" style={{
                padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:700,
                background:"#0a1a0e",border:"1px solid #22c55e",color:"#4ade80",textDecoration:"none",
              }}>🧭 Navigate</a>
            )}
            {!readOnly && (
              <>
                <button onClick={()=>onTogglePaid(job.id)} style={{
                  padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:700,
                  background: job.paid ? "#14532d" : "#1f2937",
                  border:`1px solid ${job.paid ? "#22c55e" : "#374151"}`,
                  color: job.paid ? "#4ade80" : "#9ca3af",
                }}>{job.paid ? "✓ PAID" : "£ Paid?"}</button>
                <button onClick={()=>onEdit(job)} style={{padding:"5px 10px",borderRadius:6,fontSize:11,background:"transparent",border:"1px solid #374151",color:"#9ca3af"}}>Edit</button>
                <button onClick={()=>onDelete(job.id)} style={{padding:"5px 9px",borderRadius:6,fontSize:11,background:"transparent",border:"1px solid #374151",color:"#6b7280"}}>×</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LOCATION MAP ───────────────────────────────────────────────────────────
function LocationsView({ locations, myDriver }) {
  const drivers = Object.entries(locations).filter(([id]) => DRIVERS[id])

  return (
    <div style={{padding:"4px 0"}}>
      <div style={{fontSize:10,color:"#6b7280",letterSpacing:2,fontWeight:700,textTransform:"uppercase",marginBottom:12}}>— Live Driver Locations —</div>

      {drivers.length === 0 && (
        <div style={{textAlign:"center",padding:"30px 20px",color:"#6b7280"}}>
          <div style={{fontSize:30,marginBottom:8}}>📍</div>
          <div style={{fontSize:13}}>No locations shared yet</div>
          <div style={{fontSize:11,marginTop:6}}>Tap "Share My Location" below to start</div>
        </div>
      )}

      {drivers.map(([id, loc]) => {
        const d = DRIVERS[id]
        if (!d) return null
        const isMe = id === myDriver
        const ago = timeAgo(loc.updatedAt)
        const stale = loc.updatedAt && (Date.now() - loc.updatedAt > 5*60*1000)

        return (
          <div key={id} style={{
            background:"#0f172a",border:`2px solid ${d.color}`,borderRadius:10,padding:14,marginBottom:10,
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:stale?"#6b7280":d.color,boxShadow:`0 0 12px ${stale?"transparent":d.color}`}}/>
                <span style={{fontSize:16,fontWeight:800,color:"#f9fafb"}}>{d.emoji} {d.name}</span>
                {isMe && <span style={{fontSize:10,color:"#6b7280",fontWeight:700}}>(YOU)</span>}
              </div>
              <span style={{fontSize:11,color:stale?"#f87171":"#6b7280"}}>{ago}{stale && " ⚠️"}</span>
            </div>
            {loc.lat && loc.lng && (
              <>
                <div style={{fontSize:11,fontFamily:"monospace",color:"#6b7280",marginBottom:8}}>
                  {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                  {loc.speed != null && <span> · {Math.round(loc.speed * 3.6)} km/h</span>}
                </div>
                <a href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`} target="_blank" rel="noopener" style={{
                  display:"inline-block",padding:"7px 14px",background:`${d.color}22`,border:`1px solid ${d.color}`,
                  borderRadius:6,color:d.color,fontSize:12,fontWeight:700,textDecoration:"none",
                }}>🗺️ View on Google Maps</a>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [myDriver, setMyDriver] = useState(() => {
    try { return localStorage.getItem("mst_driver") || null } catch { return null }
  })
  const [jobs, setJobs] = useState(BASE_JOBS)
  const [locations, setLocations] = useState({})
  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date().toISOString().slice(0,10)
    return ALL_DATES.find(d => d.date === t) ? t : "2026-05-28"
  })
  const [showAdd, setShowAdd] = useState(false)
  const [editJob, setEditJob] = useState(null)
  const [manifestJob, setManifestJob] = useState(null)
  const [filter, setFilter] = useState("all")
  const [driverFilter, setDriverFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("schedule")
  const [now, setNow] = useState(new Date())
  const [sharingLocation, setSharingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [syncStatus, setSyncStatus] = useState("idle")
  const watchIdRef = useRef(null)

  // Driver selection persistence
  useEffect(() => {
    if (myDriver) {
      try { localStorage.setItem("mst_driver", myDriver) } catch {}
    }
  }, [myDriver])

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  // Subscribe to Firestore jobs (with fallback to local)
  useEffect(() => {
    if (!isFirebaseConfigured) return
    setSyncStatus("connecting")
    const unsub = subscribeToJobs(cloudJobs => {
      setSyncStatus("synced")
      // Merge: cloud overrides base, but show base if cloud is empty
      if (cloudJobs.length === 0) {
        // First time setup — push all base jobs to cloud
        BASE_JOBS.forEach(j => saveJobToCloud(j))
      } else {
        setJobs(cloudJobs)
      }
    })
    return () => unsub()
  }, [])

  // Subscribe to driver locations
  useEffect(() => {
    if (!isFirebaseConfigured) return
    const unsub = subscribeToLocations(setLocations)
    return () => unsub()
  }, [])

  // GPS sharing
  function startSharingLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported")
      return
    }
    if (!myDriver || myDriver === "viewer") {
      setLocationError("Pick driver first")
      return
    }
    setLocationError(null)
    setSharingLocation(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        updateDriverLocation(myDriver, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
        })
      },
      err => {
        setLocationError(err.message)
        setSharingLocation(false)
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 60000 }
    )
  }

  function stopSharingLocation() {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setSharingLocation(false)
  }

  useEffect(() => () => stopSharingLocation(), [])


  const readOnly = myDriver === "viewer"

  function saveJob(job) {
    if (isFirebaseConfigured) {
      saveJobToCloud(job)
    } else {
      setJobs(js => js.find(j => j.id === job.id) ? js.map(j => j.id === job.id ? job : j) : [...js, job])
    }
    setEditJob(null)
    setShowAdd(false)
  }

  function deleteJob(id) {
    if (!window.confirm("Remove this job?")) return
    if (isFirebaseConfigured) {
      deleteJobFromCloud(id)
    } else {
      setJobs(js => js.filter(j => j.id !== id))
    }
  }

  function togglePaid(id) {
    const job = jobs.find(j => j.id === id)
    if (!job) return
    saveJob({ ...job, paid: !job.paid })
  }

  function updateJob(job) {
    saveJob(job)
  }

  const jobsByDate = useMemo(() => {
    const m = {}
    jobs.forEach(j => { if (!m[j.date]) m[j.date] = []; m[j.date].push(j) })
    return m
  }, [jobs])

  const dayJobs = useMemo(() => (jobsByDate[selectedDate]||[])
    .filter(j => filter === "all" || j.type === filter)
    .filter(j => driverFilter === "all" || j.bus === driverFilter || j.type === "race")
    .sort((a,b) => (getPickupTime(a)||"00:00").localeCompare(getPickupTime(b)||"00:00")),
    [jobsByDate, selectedDate, filter, driverFilter])

  const busAJobs = dayJobs.filter(j => j.bus === "A" || j.type === "race")
  const busBJobs = dayJobs.filter(j => j.bus === "B")
  const totalPaxDay = dayJobs.reduce((s,j) => s + (j.pax||0), 0)
  const dayInfo = ALL_DATES.find(d => d.date === selectedDate)
  const closure = ROAD_CLOSURES[selectedDate]
  const nowStr = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`
  const myDriverInfo = DRIVERS[myDriver] || {}

  const dayRev = dayJobs.reduce((s,j) => { const f = estimateFare(j); return s + (j.fareOverride!=null ? j.fareOverride : f.total) }, 0)
  const totalRev = jobs.reduce((s,j) => { const f = estimateFare(j); return s + (j.fareOverride!=null ? j.fareOverride : f.total) }, 0)
  const totalPaid = jobs.filter(j => j.paid).reduce((s,j) => { const f = estimateFare(j); return s + (j.fareOverride!=null ? j.fareOverride : f.total) }, 0)


  // Show driver select after all hooks have run to avoid React hook order crashes
  if (!myDriver) {
    return <DriverSelect onSelect={setMyDriver}/>
  }

  return (
    <div style={{minHeight:"100vh",background:"#030712",color:"#f9fafb"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0c1220,#0f172a)",borderBottom:"1px solid #1e293b",padding:"10px 14px",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:920,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
          <div>
            <div style={{fontSize:9,color:"#6b7280",letterSpacing:3,fontWeight:700,textTransform:"uppercase"}}>MST · TT 2026</div>
            <h1 style={{margin:"2px 0 0",fontSize:17,fontWeight:800,letterSpacing:-0.5}}>
              <span style={{color:myDriverInfo?.color||"#f9fafb"}}>{myDriverInfo?.emoji||""}</span> {myDriverInfo?.name||"Viewer"}
              {isFirebaseConfigured && <span style={{
                fontSize:9,marginLeft:8,padding:"2px 6px",borderRadius:3,fontWeight:700,
                background: syncStatus==="synced" ? "#14532d" : "#1c1f26",
                color: syncStatus==="synced" ? "#4ade80" : "#6b7280",
              }}>{syncStatus==="synced"?"✓ SYNCED":"…"}</span>}
            </h1>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{fontFamily:"monospace",fontSize:18,fontWeight:700,background:"#0f172a",padding:"4px 10px",borderRadius:8,border:"1px solid #1e293b"}}>{nowStr}</div>
            <button onClick={()=>{if(window.confirm("Switch driver?")) {setMyDriver(null); try{localStorage.removeItem("mst_driver")}catch{}}}} style={{
              background:"transparent",border:"1px solid #374151",color:"#6b7280",borderRadius:6,padding:"5px 8px",fontSize:10,
            }}>Switch</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:920,margin:"0 auto",padding:"12px 12px 100px"}}>
        {/* Calendar Strip */}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",gap:3,overflowX:"auto",paddingBottom:4,scrollSnapType:"x mandatory"}}>
            {ALL_DATES.map(({date,label,tag})=>{
              const avail = getDayAvail(jobsByDate[date]||[])
              const isSel = date === selectedDate
              const dr = (jobsByDate[date]||[]).reduce((s,j)=>{const f=estimateFare(j);return s+(j.fareOverride!=null?j.fareOverride:f.total)},0)
              return (
                <button key={date} onClick={()=>setSelectedDate(date)} style={{
                  flex:"0 0 auto",scrollSnapAlign:"start",
                  background: isSel ? "#1e3a5f" : "#0f172a",
                  border:`2px solid ${isSel ? "#3b82f6" : AVAIL_COLOR[avail]}`,
                  borderRadius:8,padding:"6px 8px",minWidth:66,textAlign:"center",
                }}>
                  <div style={{fontSize:9,color:isSel?"#93c5fd":"#9ca3af",marginBottom:2,fontWeight:600}}>{label.split(" ").slice(0,2).join(" ")}</div>
                  <div style={{fontSize:9,fontWeight:700,color:AVAIL_COLOR[avail],background:`${AVAIL_COLOR[avail]}22`,borderRadius:3,padding:"1px 4px",marginBottom:2}}>{AVAIL_LABEL[avail]}</div>
                  <div style={{fontSize:8,color:getTagColor(tag),background:`${getTagColor(tag)}22`,borderRadius:3,padding:"1px 4px",marginBottom:2}}>{tag}</div>
                  {dr>0 && <div style={{fontSize:9,color:"#22c55e",fontFamily:"monospace",fontWeight:700}}>£{dr.toFixed(0)}</div>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:5,marginBottom:12,borderBottom:"1px solid #1e293b",paddingBottom:8}}>
          {[["schedule","📋 Today"],["gaps","🟢 Gaps"],["locations","📍 Map"],["revenue","💷 £"]].map(([v,l])=>(
            <button key={v} onClick={()=>setActiveTab(v)} style={{
              padding:"7px 12px",borderRadius:7,fontSize:12,fontWeight:700,
              background: activeTab===v ? "#1d4ed8" : "transparent",
              border:`1px solid ${activeTab===v ? "#3b82f6" : "#374151"}`,
              color: activeTab===v ? "#fff" : "#9ca3af",
            }}>{l}</button>
          ))}
        </div>

        {/* SCHEDULE TAB */}
        {activeTab==="schedule" && (
          <>
            {/* Day header */}
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"11px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div>
                <h2 style={{margin:0,fontSize:16,fontWeight:800}}>{dayInfo?.label}</h2>
                <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:4,background:`${getTagColor(dayInfo?.tag||"")}22`,color:getTagColor(dayInfo?.tag||"")}}>{dayInfo?.tag}</span>
                  {closure && <span style={{fontSize:11,color:"#fca5a5",background:"#450a0a",padding:"2px 7px",borderRadius:4}}>🔴 Roads {closure.close}–{closure.open}</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:totalPaxDay>32?"#ef4444":totalPaxDay>0?"#f59e0b":"#22c55e",lineHeight:1}}>{totalPaxDay}</div><div style={{fontSize:9,color:"#6b7280"}}>pax</div></div>
                <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:"#22c55e",lineHeight:1,fontFamily:"monospace"}}>£{dayRev.toFixed(0)}</div><div style={{fontSize:9,color:"#6b7280"}}>today</div></div>
              </div>
            </div>

            {/* Filters */}
            <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:4}}>
                {[["all","All"],["A","Harry"],["B","Leanne"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setDriverFilter(v)} style={{
                    padding:"5px 10px",borderRadius:5,fontSize:11,fontWeight:700,
                    background: driverFilter===v ? "#1f2937" : "transparent",
                    border:`1px solid ${driverFilter===v ? (v==="A"?"#f97316":v==="B"?"#7c3aed":"#374151") : "transparent"}`,
                    color: driverFilter===v ? (v==="A"?"#f97316":v==="B"?"#7c3aed":"#f9fafb") : "#6b7280",
                  }}>{l}</button>
                ))}
              </div>
              <div style={{width:1,background:"#1e293b",margin:"0 4px"}}/>
              <div style={{display:"flex",gap:4}}>
                {["all","arrival","departure","race"].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{
                    padding:"5px 9px",borderRadius:5,fontSize:11,fontWeight:600,
                    background: filter===f ? "#1f2937" : "transparent",
                    border:`1px solid ${filter===f ? "#374151" : "transparent"}`,
                    color: filter===f ? "#f9fafb" : "#6b7280",
                  }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
                ))}
              </div>
            </div>

            {/* Bus lanes */}
            {dayJobs.length > 0 ? (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["A",busAJobs],["B",busBJobs]].map(([bus,bjobs])=>{
                  const d = DRIVERS[bus]
                  const bRev = bjobs.reduce((s,j)=>{const f=estimateFare(j);return s+(j.fareOverride!=null?j.fareOverride:f.total)},0)
                  return (
                    <div key={bus}>
                      <div style={{background:d.color,borderRadius:"8px 8px 0 0",padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontWeight:800,fontSize:12,color:"#fff"}}>{d.emoji} {d.name}</span>
                        <span style={{fontSize:10,color:"#ffffff99"}}>{bjobs.reduce((s,j)=>s+(j.busA||j.pax),0)} · £{bRev.toFixed(0)}</span>
                      </div>
                      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderTop:"none",borderRadius:"0 0 8px 8px",padding:8,minHeight:60}}>
                        {bjobs.length===0
                          ? <div style={{textAlign:"center",padding:"16px 0",color:"#22c55e",fontSize:12}}>✓ Free</div>
                          : bjobs.map(j => <JobCard key={j.id} job={j} onEdit={setEditJob} onDelete={deleteJob} onTogglePaid={togglePaid} onOpenManifest={setManifestJob} readOnly={readOnly}/>)
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{background:"#0f172a",border:"2px dashed #22c55e",borderRadius:10,padding:"30px 20px",textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:6}}>✓</div>
                <div style={{fontSize:14,color:"#22c55e",fontWeight:700,marginBottom:4}}>Both Drivers Free</div>
                <div style={{fontSize:12,color:"#6b7280",marginBottom:14}}>No jobs scheduled — available to fill</div>
                {!readOnly && <button onClick={()=>setShowAdd(true)} style={{background:"#22c55e",border:"none",borderRadius:8,color:"#000",padding:"9px 18px",fontWeight:700,fontSize:13}}>+ Add a Job</button>}
              </div>
            )}
          </>
        )}

        {/* GAPS TAB */}
        {activeTab==="gaps" && (
          <div>
            <div style={{fontSize:10,color:"#6b7280",letterSpacing:2,fontWeight:700,textTransform:"uppercase",marginBottom:12}}>— Available Days —</div>
            {ALL_DATES.map(({date,label,tag})=>{
              const avail = getDayAvail(jobsByDate[date]||[])
              if (avail!=="free" && avail!=="available") return null
              const slotsLeft = 32 - (jobsByDate[date]||[]).reduce((s,j)=>s+j.pax,0)
              const rc = ROAD_CLOSURES[date]
              return (
                <div key={date} onClick={()=>{setSelectedDate(date);setActiveTab("schedule")}} style={{
                  display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"11px 14px",background:"#0f172a",borderRadius:8,
                  border:`1px solid ${AVAIL_COLOR[avail]}33`,marginBottom:6,
                }}>
                  <div>
                    <span style={{fontSize:13,fontWeight:700,color:"#f9fafb"}}>{label}</span>
                    <span style={{fontSize:11,color:"#6b7280",marginLeft:8}}>{tag}</span>
                    {rc && <span style={{fontSize:10,color:"#fca5a5",marginLeft:8}}>🔴 {rc.close}–{rc.open}</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:13,color:"#22c55e",fontWeight:700}}>{slotsLeft} seats</span>
                    <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,background:`${AVAIL_COLOR[avail]}22`,color:AVAIL_COLOR[avail]}}>{AVAIL_LABEL[avail]}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* LOCATIONS TAB */}
        {activeTab==="locations" && (
          <>
            <LocationsView locations={locations} myDriver={myDriver}/>
            {!readOnly && (
              <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",zIndex:100}}>
                {!sharingLocation ? (
                  <button onClick={startSharingLocation} style={{
                    padding:"13px 26px",background:"#1d4ed8",border:"none",borderRadius:30,color:"#fff",
                    fontWeight:700,fontSize:14,boxShadow:"0 6px 20px rgba(29,78,216,0.4)",
                  }}>📍 Share My Location</button>
                ) : (
                  <button onClick={stopSharingLocation} style={{
                    padding:"13px 26px",background:"#dc2626",border:"none",borderRadius:30,color:"#fff",
                    fontWeight:700,fontSize:14,boxShadow:"0 6px 20px rgba(220,38,38,0.4)",
                  }}>🛑 Stop Sharing</button>
                )}
              </div>
            )}
            {locationError && (
              <div style={{background:"#450a0a",border:"1px solid #7f1d1d",borderRadius:8,padding:10,marginTop:10,fontSize:12,color:"#fca5a5"}}>
                ⚠️ {locationError}
              </div>
            )}
          </>
        )}

        {/* REVENUE TAB */}
        {activeTab==="revenue" && (
          <div>
            <div style={{fontSize:10,color:"#6b7280",letterSpacing:2,fontWeight:700,textTransform:"uppercase",marginBottom:12}}>— Revenue Tracker —</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
              {[
                {l:"2-Week Total",v:`£${totalRev.toFixed(0)}`,c:"#9ca3af"},
                {l:"Today",v:`£${dayRev.toFixed(0)}`,c:"#f59e0b"},
                {l:"Collected",v:`£${totalPaid.toFixed(0)}`,c:"#4ade80"},
                {l:"Outstanding",v:`£${(totalRev-totalPaid).toFixed(0)}`,c:totalRev-totalPaid>0?"#f87171":"#4ade80"},
              ].map(({l,v,c})=>(
                <div key={l} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{l}</div>
                  <div style={{fontSize:24,fontWeight:800,color:c,fontFamily:"monospace",lineHeight:1}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:14}}>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>Payment progress</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:8,background:"#1f2937",borderRadius:4,overflow:"hidden"}}>
                  <div style={{width:`${totalRev>0?Math.round((totalPaid/totalRev)*100):0}%`,height:"100%",background:"#22c55e",borderRadius:4,transition:"width 0.4s"}}/>
                </div>
                <span style={{fontSize:13,color:"#9ca3af",fontFamily:"monospace",fontWeight:700}}>{totalRev>0?Math.round((totalPaid/totalRev)*100):0}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add button */}
      {!readOnly && activeTab==="schedule" && (
        <button onClick={()=>setShowAdd(true)} style={{
          position:"fixed",bottom:20,right:20,width:56,height:56,borderRadius:"50%",
          background:"#1d4ed8",border:"none",color:"#fff",fontSize:28,fontWeight:300,
          boxShadow:"0 6px 20px rgba(29,78,216,0.5)",zIndex:50,
        }}>+</button>
      )}

      {/* Modals */}
      {showAdd && <JobModal date={selectedDate} onSave={saveJob} onClose={()=>setShowAdd(false)}/>}
      {editJob && <JobModal date={editJob.date} existing={editJob} onSave={saveJob} onClose={()=>setEditJob(null)}/>}
      {manifestJob && <ManifestModal job={manifestJob} onClose={()=>setManifestJob(null)} onUpdate={updateJob} readOnly={readOnly}/>}
    </div>
  )
}
