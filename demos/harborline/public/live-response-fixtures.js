/* Sanitized response templates from successful live room/dinner tests on 2026-11-13.
   Dates, guest counts, room results and references always come from this simulation.
   No live session identifiers, API keys, token usage or customer records are replayed. */
const LiveResponseFixtures={
 rooms(rooms){return `There are ${rooms.length} rooms available for your dates: ${rooms.map(r=>`${r.name} at ${r.rate/100} USD/night`).join(', ')}. Choose a room to review the total.`;},
 dinner(r){return `Dinner saved for ${r.guests} on ${r.date} at ${String(r.hour).padStart(2,'0')}:00. Reference: ${r.reference}.`;}
};
