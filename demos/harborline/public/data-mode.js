(()=>{
 const live=document.body.dataset.live==='true';
 document.querySelectorAll('.data-mode a').forEach(link=>{
  if((link.dataset.mode==='live')===live)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  link.addEventListener('click',event=>{
   if(link.hasAttribute('aria-current')){event.preventDefault();return;}
   if(typeof busy!=='undefined'&&busy){event.preventDefault();return;}
  });
 });
})();
