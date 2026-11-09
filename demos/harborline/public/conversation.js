/* Deterministic intent parsing for the local simulation, not an LLM or SDK. */
const Conversation = (() => {
 function route(raw){
  const t=raw.toLowerCase().replace(/[’]/g,"'").trim();
  if(/^(hi|hey|hello|good morning)[!. ]*$/.test(t))return 'greeting';
  if(/\b(why|explain|reason|thinking|which tool|what tool|how did|how do you know)\b/.test(t))return 'explain';
  if(/\b(don't|do not|never)\s+(?:want to )?cancel\b|\bkeep (it|my|the|this)\b/.test(t))return 'keep';
  if(/\b(cancel|cancellation)\b/.test(t))return /\b(policy|fee|cost|can i|what if|what happens)\b/.test(t)?'cancel-policy':'cancel';
  if(/\b(change|move|reschedule|switch|modify|adjust|different date|extend)\b/.test(t))return 'change';
  if(/\b(remember|memory|recall)\b/.test(t))return 'memory';
  if(/\b(cost|price|total|paid|paying|how much)\b/.test(t))return 'price';
  if(reference(t)||/\b(review|look up|lookup|pull up|find)\b.*\b(booking|reservation)\b/.test(t))return 'lookup';
  if(/\b(confirmation|tracking|reference|receipt)\b/.test(t))return 'reference';
  if(/\b(when|what date|which date|dates|check.?in|check.?out|how many nights)\b/.test(t)&&! /late/.test(t))return 'dates';
  if(/\b(my booking|my reservation|what.*booked|what room|which room|my stay)\b/.test(t))return 'summary';
  return null;
 }
 function dates(text,today){
  const iso=text.match(/\b\d{4}-\d{2}-\d{2}\b/g);if(iso?.length===2)return iso;
  const months={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
  const m=text.toLowerCase().match(/\b(jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|through|until|[-–])\s*(?:(jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*)\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?/);
  if(!m)return null;const year=m[5]||today.slice(0,4),fmt=(month,day)=>`${year}-${String(months[month.slice(0,3)]).padStart(2,'0')}-${day.padStart(2,'0')}`;
  return [fmt(m[1],m[2]),fmt(m[3]||m[1],m[4])];
 }
 function reference(text){
  const full=text.match(/\bDEMO-[a-f0-9]{8}\b/i);if(full)return {type:'full',value:full[0].toUpperCase()};
  // Only interpret four digits as an ID when anchored to reference language,
  // or when the entire reply is a four-digit suffix. Never extract from a date.
  const suffix=text.match(/(?:last\s+(?:four|4)(?:\s+digits)?|ending(?:\s+in)?|ends\s+(?:in|with)|reference|confirmation|booking(?:\s+(?:number|code))?)\s*(?:is|of|:|#)?\s*((?:\d[ -]?){3}\d)(?![\d-])/i);
  const bare=text.trim().match(/^(\d[ -]?\d[ -]?\d[ -]?\d)[.!]?$/);
  const match=suffix||bare;return match?{type:'suffix',value:match[1].replace(/[^\d]/g,'')}:null;
 }
 function acknowledgement(text){
  const t=text.toLowerCase().replace(/[’]/g,"'").trim();
  if(/^(yes|yeah|yep|correct|right|that's (?:it|the one|correct)|that is (?:it|the one)|confirm)(?:[,.! ]+(?:that's|that is) (?:the one|it|correct))?[.! ]*$/.test(t))return 'yes';
  if(/^(no|nope|not that one|wrong one|that's not (?:it|the one))[.! ]*$/.test(t))return 'no';
  return null;
 }
 function candidates(text,records){
  const parsed=reference(text);if(parsed)return records.filter(r=>parsed.type==='full'?r.id.toUpperCase()===parsed.value:r.id.slice(-4).toUpperCase()===parsed.value);

  const ref=text.match(/DEMO-[a-f0-9]{8}/i);if(ref)return records.filter(r=>r.id.toUpperCase()===ref[0].toUpperCase());
  if(/dinner|dining|restaurant|table/i.test(text)&&/room|stay/i.test(text))return records.filter(r=>r.intent==='room'||r.intent==='dining');
  if(/dinner|dining|restaurant|table/i.test(text))return records.filter(r=>r.intent==='dining');
  if(/room|stay|booking|date|reservation/i.test(text))return records.filter(r=>r.intent==='room');
  return records;
 }
 return {route,dates,candidates,reference,acknowledgement};
})();
