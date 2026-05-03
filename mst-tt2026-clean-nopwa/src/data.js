// ─── DRIVERS ──────────────────────────────────────────────────────────────────
export const DRIVERS = {
  A: { name: "Harry",  color: "#f97316", emoji: "🚐" },
  B: { name: "Leanne", color: "#7c3aed", emoji: "🚐" },
  "9-seater": { name: "9-Seater", color: "#22c55e", emoji: "🚙" },
}

// ─── HOTELS — with addresses for Maps navigation ─────────────────────────────
export const HOTELS = {
  "Chesterhouse":                       { color:"#f97316", short:"CH", address:"Chesterhouse Hotel, Loch Promenade, Douglas, Isle of Man" },
  "Claremont":                          { color:"#3b82f6", short:"CL", address:"Claremont Hotel, Loch Promenade, Douglas, Isle of Man" },
  "Rutland":                            { color:"#10b981", short:"RU", address:"Rutland Hotel, Queens Promenade, Douglas, Isle of Man" },
  "Ellan Vannin Hotel":                 { color:"#a855f7", short:"EV", address:"Ellan Vannin Hotel, Athol Street, Douglas, Isle of Man" },
  "Best Western Palace Hotel & Casino": { color:"#ec4899", short:"BW", address:"Palace Hotel, Central Promenade, Douglas, Isle of Man" },
}

export const DESTINATIONS = {
  "Airport":      "Isle of Man Airport, Ronaldsway, Ballasalla",
  "Hillberry":    "Hillberry, Onchan, Isle of Man",
  "Creg-ny-Baa":  "Creg-ny-Baa, Onchan, Isle of Man",
  "Bungalow":     "The Bungalow, Snaefell Mountain, Isle of Man",
  "Sea Terminal": "Sea Terminal, Douglas, Isle of Man",
}

// ─── ROAD CLOSURES ────────────────────────────────────────────────────────────
export const ROAD_CLOSURES = {
  "2026-05-25":{close:"10:00",open:"21:30",label:"Q1"},
  "2026-05-26":{close:"18:00",open:"21:30",label:"Q2"},
  "2026-05-27":{close:"12:30",open:"21:30",label:"Q3+Q4"},
  "2026-05-29":{close:"10:00",open:"16:30",label:"Q5+Q6"},
  "2026-05-30":{close:"10:00",open:"21:30",label:"Race Day 1"},
  "2026-05-31":{close:"12:30",open:"18:30",label:"Race Day 2"},
  "2026-06-02":{close:"10:00",open:"17:00",label:"Race Day 3"},
  "2026-06-03":{close:"10:00",open:"17:00",label:"Race Day 4"},
  "2026-06-05":{close:"10:00",open:"21:30",label:"Race Day 5"},
  "2026-06-06":{close:"10:00",open:"21:30",label:"Race Day 6"},
}

export const ALL_DATES = [
  {date:"2026-05-26",label:"Tue 26 May",tag:"Pre-TT"},
  {date:"2026-05-27",label:"Wed 27 May",tag:"Qualifying"},
  {date:"2026-05-28",label:"Thu 28 May",tag:"Rest Day"},
  {date:"2026-05-29",label:"Fri 29 May",tag:"Qualifying"},
  {date:"2026-05-30",label:"Sat 30 May",tag:"Race Day 1"},
  {date:"2026-05-31",label:"Sun 31 May",tag:"Race Day 2"},
  {date:"2026-06-01",label:"Mon 01 Jun",tag:"Changeover"},
  {date:"2026-06-02",label:"Tue 02 Jun",tag:"Race Day 3"},
  {date:"2026-06-03",label:"Wed 03 Jun",tag:"Race Day 4"},
  {date:"2026-06-04",label:"Thu 04 Jun",tag:"Rest Day"},
  {date:"2026-06-05",label:"Fri 05 Jun",tag:"Race Day 5"},
  {date:"2026-06-06",label:"Sat 06 Jun",tag:"Race Day 6"},
  {date:"2026-06-07",label:"Sun 07 Jun",tag:"Post-TT"},
  {date:"2026-06-08",label:"Mon 08 Jun",tag:"Post-TT"},
  {date:"2026-06-09",label:"Tue 09 Jun",tag:"Post-TT"},
  {date:"2026-06-10",label:"Wed 10 Jun",tag:"Post-TT"},
]

// ─── FARES (Elegance 16-seater) ──────────────────────────────────────────────
export const FARES_16 = {
  "Airport":{t1:60,t2:80}, "Ballasalla":{t1:55,t2:70}, "Onchan":{t1:30,t2:45},
  "Douglas":{t1:25,t2:35}, "Castletown":{t1:65,t2:85}, "Peel":{t1:70,t2:90},
  "Ramsey":{t1:85,t2:110}, "St Johns":{t1:60,t2:80}, "Kirk Michael":{t1:80,t2:110},
  "Ballaugh":{t1:75,t2:100}, "Jurby":{t1:90,t2:120}, "Laxey":{t1:50,t2:65},
  "Glen Helen":{t1:65,t2:85}, "Port Erin":{t1:75,t2:100}, "Port St Mary":{t1:75,t2:100},
  "Colby":{t1:70,t2:95}, "Sulby":{t1:80,t2:105}, "Maughold":{t1:80,t2:105},
  "Dalby":{t1:75,t2:100}, "Patrick":{t1:70,t2:90}, "Andreas":{t1:90,t2:115},
  "Hillberry":{t1:65,t2:85}, "Creg-ny-Baa":{t1:65,t2:85}, "Bungalow":{t1:75,t2:100},
}

export const WAITING_RATE = { t1:75, t2:100 }
export const EXTRA_STOP = 3
export const NO_SHOW_FEE = { t1:7.5, t2:10 }

// ─── GUEST CONTACTS ───────────────────────────────────────────────────────────
export const CONTACTS = {
  "Bennett":[{lead:"Robert Bennett",contact:"+1 909-709-6188",pax:1,notes:""}],
  "Breiner":[{lead:"Carl Breiner",contact:"+1 410-935-8271",pax:1,notes:""},{lead:"Matthew Breiner",contact:"+1 443-640-5369",pax:2,notes:"Awaiting flight info"}],
  "Griffin":[{lead:"David Griffin",contact:"+1 317-512-4778",pax:4,notes:""}],
  "Harrington":[{lead:"Mark Harrington",contact:"+1 509 991 6970",pax:1,notes:""}],
  "Nefzger":[{lead:"Carol Nefzger",contact:"+1 561-628-6063",pax:2,notes:""}],
  "Pardini":[{lead:"William Pardini",contact:"+1 650-670-2181",pax:3,notes:"Arriving by ferry"}],
  "Taskin":[{lead:"Artin Taskin",contact:"+1 401 226 2794",pax:3,notes:""}],
  "Tradup":[{lead:"James Tradup",contact:"+1 651-238-7245",pax:2,notes:""}],
  "Barr":[{lead:"Tim Barr",contact:"+1 405-760-8059",pax:2,notes:""}],
  "Beall":[{lead:"Chester Beall",contact:"+1 678-758-1475",pax:2,notes:""}],
  "Bowles":[{lead:"Alan Bowles",contact:"+1 512-809-1326",pax:2,notes:""}],
  "Dein":[{lead:"Scott Dein",contact:"+1 734-925-6118",pax:2,notes:""}],
  "Denton":[{lead:"Johnny Denton",contact:"+1 619 513 0546",pax:3,notes:""}],
  "Dixon":[{lead:"Sherard K. Dixon",contact:"+1 404 428 1478",pax:2,notes:""},{lead:"Phil Wadzinski",contact:"+1 920-265-7024",pax:2,notes:""}],
  "Duggan":[{lead:"John Duggan",contact:"+61 418 456694",pax:2,notes:""}],
  "Eck":[{lead:"Rachel Eck",contact:"+1 610 349 1362",pax:2,notes:""}],
  "Maier":[{lead:"Grant Maier",contact:"+1 509-710-7049",pax:1,notes:""},{lead:"Rohit Joshi",contact:"+1 403-617-3798",pax:2,notes:""}],
  "McWhirter":[{lead:"Lisa McWhirter",contact:"+1 407 595 5321",pax:2,notes:""}],
  "Novak":[{lead:"Terike Novak",contact:"+1 940-703-9884",pax:2,notes:""}],
  "Okurowski":[{lead:"Mary Ellen Okurowski",contact:"+1 301-257-0407",pax:2,notes:""}],
  "Price":[{lead:"Gerald Price Jr.",contact:"+1 904 699 0450",pax:2,notes:""}],
  "Trudel":[{lead:"Julie Trudel",contact:"+1 321-759-0728",pax:4,notes:"⚠️ 1 pax mobility issues"}],
  "Fortin":[{lead:"Carmen Fortin",contact:"+1 804 594 5231",pax:2,notes:"Ellan Vannin Hotel"}],
  "Bomhoff":[{lead:"Cody Bomhoff",contact:"+1 405-808-2230",pax:3,notes:""}],
  "Desjarlais":[{lead:"Andrew Desjarlais",contact:"+1 832 305 4958",pax:2,notes:""}],
  "Gerch":[{lead:"Todd Gerch",contact:"+1 310 562 8076",pax:3,notes:""}],
  "Hunt":[{lead:"Michael Hunt",contact:"+1 940-273-4710",pax:2,notes:""}],
  "Nilsson":[{lead:"David Nilsson",contact:"+1 732-983-8787",pax:2,notes:""}],
  "Potter":[{lead:"George Potter",contact:"+1 817 403 5000",pax:2,notes:""}],
  "Race":[{lead:"Bruce Race",contact:"+1 808-561-6932",pax:2,notes:""}],
  "Rossey":[{lead:"Kenneth Rossey",contact:"+1 412 726 5468",pax:3,notes:""}],
  "Stokes":[{lead:"Vanessa Stokes",contact:"+1 503-820-8907",pax:2,notes:""}],
  "Whitney":[{lead:"Susan Whitney",contact:"+1 865-567-5286",pax:2,notes:""}],
  "Bartell":[{lead:"Richard Bartell",contact:"+1 804-513-7943",pax:2,notes:""}],
  "Happ":[{lead:"Christopher Happ",contact:"+1 512-694-4143",pax:4,notes:""}],
  "Lopez":[{lead:"Andre Lopez",contact:"+1 949-292-7082",pax:5,notes:""},{lead:"Garrett Garcia",contact:"+1 619-322-9689",pax:1,notes:"Departing early Jun 03"},{lead:"Jesse Doty",contact:"+1 702-468-1786",pax:1,notes:"⚠️ Arriving late TBC"}],
  "Providence":[{lead:"Tiffany Providence",contact:"+1 678-617-5005",pax:2,notes:""}],
  "Revels":[{lead:"Gregory Revels",contact:"+1 804-314-3675",pax:2,notes:""}],
  "Shirtliff":[{lead:"Scott Baker",contact:"+1 705-740-3908",pax:2,notes:""}],
  "Williams":[{lead:"James Williams",contact:"+1 209-598-5309",pax:6,notes:""}],
  "Agner":[{lead:"William Agner",contact:"+1 619-804-2622",pax:2,notes:""}],
  "Buss":[{lead:"Josie Buss",contact:"+1 904-537-5650",pax:2,notes:""}],
  "Calhoun":[{lead:"Sandy Calhoun",contact:"+1 423-322-9767",pax:2,notes:""}],
  "Cook":[{lead:"Sandra Cook",contact:"+1 617-678-1341",pax:5,notes:""}],
  "Dockins":[{lead:"Heather Dockins",contact:"+1 815-721-5157",pax:2,notes:""}],
  "Farkas":[{lead:"Ron Farkas",contact:"+1 858-335-8126",pax:2,notes:""}],
  "Gillies":[{lead:"Steve Gillies",contact:"+61 411603355",pax:2,notes:""}],
  "Hill":[{lead:"Graham Hill",contact:"+63 9498830950",pax:4,notes:"WhatsApp"}],
  "Ion":[{lead:"Dan Ion",contact:"+40 748112058",pax:2,notes:""}],
  "McFee / Park":[{lead:"Heather McFee",contact:"+1 805-590-5997",pax:6,notes:""}],
  "O'Connor":[{lead:"Dennis O'Connor",contact:"+1 732-768-7667",pax:2,notes:""}],
  "Pate":[{lead:"Catheron Pate",contact:"+1 423-836-6702",pax:2,notes:""}],
  "Sanne":[{lead:"Thomas Sanne",contact:"+1 936-499-8474",pax:2,notes:""}],
  "Thielmann":[{lead:"Nancy Thielmann",contact:"+1 908-616-6499",pax:2,notes:"Departure only"}],
  "Block":[{lead:"Dennis Block",contact:"+1 805-451-3249",pax:4,notes:""}],
  "Clarke":[{lead:"Jessica Clarke",contact:"+1 910-417-7351",pax:3,notes:""}],
  "Cole":[{lead:"Albert Cole",contact:"+1 515-238-1909",pax:1,notes:""},{lead:"Steven Neal",contact:"+1 515-210-2272",pax:1,notes:""}],
  "Cooney":[{lead:"Charles Cooney",contact:"+1 515-249-5418",pax:2,notes:""}],
  "Curry":[{lead:"Steven Curry",contact:"+27 83 9629496",pax:2,notes:""}],
  "Daggett":[{lead:"Scott Daggett",contact:"+1 727-251-4591",pax:1,notes:""}],
  "Ferguson":[{lead:"Brian Ferguson",contact:"+64 274 977 249",pax:3,notes:"⚠️ Sea terminal transfer"}],
  "Lucas":[{lead:"Aiyana Lucas",contact:"+1 503-810-1170",pax:2,notes:""}],
  "Matthews":[{lead:"Richard Matthews",contact:"+64 274295810",pax:1,notes:""}],
  "Miller":[{lead:"Karen Miller",contact:"+1 606-922-4898",pax:2,notes:""}],
  "Molle":[{lead:"Evelyn Molle",contact:"+49 1709033330",pax:2,notes:""}],
  "Neal":[{lead:"Mason Neal",contact:"+1 515-231-8071",pax:2,notes:""}],
  "Ramsay":[{lead:"Robbie Ramsay",contact:"+1 902-577-7736",pax:2,notes:""}],
  "Schlacter":[{lead:"Betty Schlacter",contact:"+1 309-453-3228",pax:2,notes:""}],
  "Weesner":[{lead:"James R Weesner",contact:"+1 402-499-9895",pax:5,notes:""}],
  "Winn":[{lead:"Stuart Forstrom",contact:"+1 503-704-0944",pax:1,notes:""},{lead:"Michael Winn",contact:"+1 781-910-0020",pax:3,notes:""}],
  "Winter":[{lead:"Mark Winter",contact:"+27 71 603 2213",pax:2,notes:""}],
}
