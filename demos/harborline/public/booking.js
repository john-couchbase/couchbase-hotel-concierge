/* Pure demo pricing and stay validation. All amounts are fictional USD. */
const Booking = (() => {
 const rooms=[{id:'king',name:'Harbor King',rate:18900,capacity:2,detail:'One king bed · City view'},
 {id:'twin',name:'Harbor Twin',rate:21900,capacity:4,detail:'Two queen beds · City view'},
 {id:'suite',name:'Harbor Suite',rate:28900,capacity:4,detail:'King bed + sofa bed · Harbor view'}];
 function day(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return NaN;const d=new Date(value+'T00:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===value?d.getTime():NaN;}
 function stay(start,end,guests,today){const a=day(start),b=day(end),nights=(b-a)/86400000;guests=Number(guests);
 if(!Number.isFinite(a)||!Number.isFinite(b))throw Error('Choose valid check-in and check-out dates.');
 if(start<today)throw Error('Choose today or a future check-in date.');
 if(nights<1||nights>30)throw Error('Choose a stay of 1–30 nights.');
 if(!Number.isInteger(guests)||guests<1||guests>4)throw Error('This demo supports 1–4 guests.');
 return {start,end,guests,nights};}
 function quote(room,nights){const subtotal=room.rate*nights,tax=Math.round(subtotal*.10);return {subtotal,tax,total:subtotal+tax};}
 const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2}).format(cents/100);
 return {rooms,stay,quote,money};
})();
