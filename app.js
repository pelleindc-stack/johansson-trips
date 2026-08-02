
const tabs=[...document.querySelectorAll('.tabs button')], panels=[...document.querySelectorAll('.panel')];
tabs.forEach(b=>b.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));panels.forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.tab).classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}));
document.querySelectorAll('input[type=checkbox]').forEach((cb,i)=>{const k='maui-check-'+i;cb.checked=localStorage.getItem(k)==='1';cb.addEventListener('change',()=>localStorage.setItem(k,cb.checked?'1':'0'))});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'))}
