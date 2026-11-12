/* Fixture catalog records. These are demonstrative application tools, not live SDK calls. */
const GuidedScenario={
 create(intent,c){
  if(intent==='upgrade'){
   const eligible=['Gold','Platinum'].includes(c.tier),approved=eligible&&!c.used&&c.available;
   const blocked=!eligible?'Membership does not qualify.':c.used?'The complimentary upgrade is already used.':'An upgrade room is unavailable.';
   return {prompt:'harborline_upgrade_policy',policy:'Gold or Platinum · one complimentary upgrade per stay · subject to availability',context:`${c.tier} member · Stay ${c.ref}`,tools:[
    {name:'check_loyalty_tier',arguments:{},result:{tier:c.tier},call:true,reason:'Verify membership before offering an upgrade.',output:`${c.tier} · ${eligible?'eligible':'not eligible'}`},
    {name:'find_reservations',arguments:{},result:{bookings:[{reference:c.ref,kind:'room',upgrade_used:c.used}]},call:true,reason:eligible?'Check this stay’s allowance and room availability.':'Membership already blocks the upgrade.',output:`${c.ref} · Upgrade ${c.used?'already used':'not used'}${c.used?'':c.available?' · Deluxe Harbor View available':' · Upgrade room unavailable'}`},
    {name:'apply_upgrade',arguments:{},result:{reference:c.ref,room:'Deluxe Harbor View',extra_charge:0},call:approved,reason:approved?'Membership, unused allowance and availability all qualify.':blocked,output:'Deluxe Harbor View · no extra charge'}
   ]};
  }
  if(intent==='dining')return {prompt:'harborline_dining_policy',policy:'Check opening hours, then request a table for the guest’s time and party size.',context:`${c.day} · 8 pm · ${c.guests} guests${c.ref?' · from saved stay':''}`,tools:[
   {name:'get_outlet_hours',arguments:{},result:{name:'Skyline Rooftop',opens:17,closes:23},call:true,reason:'Check that 8 pm falls within restaurant hours.',output:'Skyline Rooftop · open 5–11 pm'},
   {name:'book_restaurant',arguments:{date:c.date,hour:20,guests:c.guests},result:c.available?{reference:c.dinnerRef,date:c.date,hour:20,guests:c.guests,booked:true}:{booked:false,reason:'No table available'},call:true,reason:'Request the table; the reservation tool checks availability.',output:c.available?`${c.day}, 8 pm · ${c.guests} guests · confirmed`:`No table for ${c.guests} guests at 8 pm · no booking made`}
  ]};
  if(intent==='checkout')return {prompt:'late-checkout',policy:'Complimentary checkout until 2 pm only when the departure schedule allows it; otherwise 11 am.',context:`Stay ${c.ref} · ${c.departure}`,tools:[
   {name:'find_reservations',call:true,reason:'Read the active stay and departure date.',output:`${c.ref} · Departure ${c.departure}`},
   {name:'check_departure_schedule',call:true,reason:'Check whether the next arrival allows extra time.',output:c.available?'Room can be held until 2 pm':'Room needed for the next arrival'},
   {name:'update_checkout',call:c.available,reason:c.available?'The schedule allows complimentary late checkout.':'The next arrival requires standard checkout.',output:`${c.departure} · 2 pm · No extra charge`}
  ]};
  return null;
 }
};
