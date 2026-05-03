import { FARES_16, EXTRA_STOP, HOTELS, DESTINATIONS } from './data.js'

export function addMins(t, m) {
  if (!t) return ''
  const [h, mi] = t.split(":").map(Number)
  const tot = h * 60 + mi + m
  return `${String(Math.floor(tot/60)%24).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`
}

export function subMins(t, m) {
  if (!t) return ''
  const [h, mi] = t.split(":").map(Number)
  const tot = Math.max(0, h * 60 + mi - m)
  return `${String(Math.floor(tot/60)).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`
}

export function getPickupTime(job) {
  if (job.type === "race") return job.pickupTime
  if (job.type === "arrival") return addMins(job.liveTime || job.flightTime, 35)
  return subMins(job.flightTime, 75)
}

export function getTagColor(tag) {
  if (!tag) return "#374151"
  if (tag.includes("Race")) return "#dc2626"
  if (tag === "Changeover") return "#d97706"
  if (tag === "Post-TT") return "#6b7280"
  if (tag === "Qualifying") return "#7c3aed"
  return "#374151"
}

export function getDayAvail(jobs) {
  const total = jobs.reduce((s, j) => s + (j.pax||0), 0)
  if (jobs.some(j => j.type === "race" && j.pax > 48) && total > 60) return "full"
  if (total > 32) return "busy"
  if (total > 0) return "available"
  return "free"
}

export const AVAIL_COLOR = { free:"#22c55e", available:"#f59e0b", busy:"#f97316", full:"#ef4444" }
export const AVAIL_LABEL = { free:"FREE", available:"AVAIL", busy:"BUSY", full:"FULL" }

export function isTariff2(t) {
  if (!t) return false
  const h = parseInt(t.split(":")[0])
  return h >= 23 || h < 6
}

export function estimateFare(job) {
  if (job.type === "race") {
    const dest = (job.dest || "Hillberry").split("→")[0].trim()
    const f = FARES_16[dest] || FARES_16["Hillberry"]
    const t2 = isTariff2(job.pickupTime)
    return { total: (t2 ? f.t2 : f.t1) * 2, tariff: t2 ? 2 : 1, perBus: t2 ? f.t2 : f.t1, note: "×2 buses" }
  }
  const f = FARES_16["Airport"]
  const t2 = isTariff2(job.flightTime)
  const base = t2 ? f.t2 : f.t1
  const hotelCount = Object.keys(job.hotels||{}).length
  const stops = Math.max(0, hotelCount - 1) * EXTRA_STOP
  return { total: base + stops, tariff: t2 ? 2 : 1, extraStops: stops, hotelCount }
}

// Build a Google Maps URL for navigation
export function googleMapsUrl(destination) {
  const q = encodeURIComponent(destination)
  return `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`
}

// Build navigation URL for a job
export function getNavUrl(job) {
  if (job.type === "race") {
    const dest = (job.dest||"Hillberry").split("→")[0].trim()
    return googleMapsUrl(DESTINATIONS[dest] || dest)
  }
  if (job.type === "arrival") {
    // Going TO airport to collect
    return googleMapsUrl(DESTINATIONS["Airport"])
  }
  // Departure — going to first hotel
  const firstHotel = Object.keys(job.hotels||{})[0]
  if (firstHotel && HOTELS[firstHotel]) {
    return googleMapsUrl(HOTELS[firstHotel].address)
  }
  return null
}

// Distance in km between two GPS points
export function distance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2-lat1) * Math.PI / 180
  const dLon = (lon2-lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// Format relative time (eg "2m ago")
export function timeAgo(timestamp) {
  if (!timestamp) return 'never'
  const sec = Math.floor((Date.now() - timestamp) / 1000)
  if (sec < 30) return 'just now'
  if (sec < 60) return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec/60)}m ago`
  if (sec < 86400) return `${Math.floor(sec/3600)}h ago`
  return `${Math.floor(sec/86400)}d ago`
}
