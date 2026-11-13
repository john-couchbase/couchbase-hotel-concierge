(()=>{
 const main=document.querySelector('main'),workspace=document.querySelector('.workspace');
 const nav=document.createElement('nav');nav.className='workspace-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Hotel workspace');
 const frame=document.createElement('iframe');frame.className='hub-tab-frame';frame.title='Tool Hub';frame.id='hub-tab-panel';frame.hidden=true;frame.setAttribute('role','tabpanel');frame.setAttribute('aria-labelledby','hub-tab');
 workspace.id='concierge-tab-panel';workspace.setAttribute('role','tabpanel');workspace.setAttribute('aria-labelledby','concierge-tab');
 const buttons=['Concierge','Tool Hub'].map((label,i)=>{const b=document.createElement('button');b.textContent=label;b.id=i?'hub-tab':'concierge-tab';b.setAttribute('role','tab');b.setAttribute('aria-controls',i?frame.id:workspace.id);b.onclick=()=>select(i);nav.append(b);return b;});
 workspace.before(nav);workspace.after(frame);
 function syncTheme(){frame.contentDocument?.body?.classList.toggle('dark',document.body.classList.contains('dark'));}
 function select(i,url){buttons.forEach((b,n)=>{b.setAttribute('aria-selected',String(n===i));b.tabIndex=n===i?0:-1;});workspace.hidden=!!i;frame.hidden=!i;if(i){const path=url||'/hub?mode='+(document.body.dataset.live==='true'?'live':'simulation');if(!frame.getAttribute('src')||url)frame.src=path;} }
 frame.onload=()=>{const doc=frame.contentDocument;if(!doc)return;const header=doc.querySelector('header');if(header)header.hidden=true;doc.querySelector('.hero')?.remove();doc.querySelector('footer')?.remove();const style=doc.createElement('style');style.textContent='main{padding:16px;max-width:none}';doc.head.append(style);syncTheme();};
 new MutationObserver(syncTheme).observe(document.body,{attributes:true,attributeFilter:['class']});
 nav.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=e.key==='Home'?0:e.key==='End'?1:buttons[0].getAttribute('aria-selected')==='true'?1:0;select(i);buttons[i].focus();};
 window.HotelWorkspace={openHub(url){select(1,url);nav.scrollIntoView({block:'nearest'});buttons[1].focus({preventScroll:true});}};
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;const url=new URL(a.href,location.href);if(url.origin===location.origin&&url.pathname==='/hub'){e.preventDefault();window.HotelWorkspace.openHub(url.pathname+url.search);}});
 select(0);
})();
