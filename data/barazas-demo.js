/* WaziHub TOPIC_LOCATION */
(function (g) {
  g.WaziData = g.WaziData || {};
  g.WaziData.TOPIC_LOCATION =     Health: 'Subcounty Hospital',
    Sanitation: 'Town Social Hall',
    Water: 'Water Board Offices',
    Education: 'Teachers Resource Centre',
    Budget: 'County Treasury Hall',
    Roads: 'Public Works Yard',
    Transport: 'Public Works Yard',
    Energy: 'County Power Offices',
    Agriculture: 'Agricultural Training Centre',
    Environment: 'Environmental Resource Centre',
    Governance: 'County Hall',
    Trade: 'Main Market Hall',
    Tourism: 'Tourism Info Centre',
    Youth: 'Youth Empowerment Centre',
    Gender: 'Social Services Hall',
    default: 'County Social Hall'
  };
})(typeof window !== 'undefined' ? window : globalThis);
(function (g) {
  g.WaziData.getDemoBarazas = function () { return [
  { id:1, title:"Community Sanitation Forum", county:"Nakuru", datetime:new Date(Date.now()+3600*1000).toISOString(), meeting_link:"https://meet.jit.si/WaziHub-demo-1", recording_link:"", upvotes:12, downvotes:3, host:"Public Health Dept.", participants:42, tags:["Health","Sanitation"], highlights: [] },
  { id:2, title:"Ward Education Baraza", county:"Kiambu", datetime:new Date(Date.now()+48*3600*1000).toISOString(), meeting_link:"https://meet.jit.si/WaziHub-demo-2", recording_link:"https://example.com/recording.mp4", upvotes:8, downvotes:1, host:"Ward Office", participants:18, tags:["Education","Budget"], highlights: [] },
  { id:3, title:"Kisumu Water Update", county:"Kisumu", datetime:new Date(Date.now()-26*3600*1000).toISOString(), meeting_link:"https://example.com/live-not-embed", recording_link:"https://example.com/water.mp4", upvotes:25, downvotes:2, host:"Water Board", participants:120, tags:["Water","Projects"], highlights: [
    { id:"h1", text:"Contractor committed to clear drainage by next week.", up:15, down:2 },
    { id:"h2", text:"Budget reallocation of KSh 10M to flood-prone wards.", up:22, down:1 },
    { id:"h3", text:"Community to share geotagged photos via WhatsApp line.", up:8, down:0 }
  ] }
]; };
})(typeof window !== 'undefined' ? window : globalThis);
