const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const P2=[['Sky','#7dd3fc'],['Peach','#f472b6'],['Lilac','#c084fc'],['Mint','#6ee7b7'],['Butter','#fde047'],['Cloud','#e2e8f0']];
const P3=[['Classic Cyan','#38bdf8','#e0f7ff','#7dd3fc'],['Peach Pink','#f472b6','#ffe4f1','#fbcfe8'],['Grape Slime','#a78bfa','#f3e8ff','#c4b5fd'],['Mint Jelly','#34d399','#d1fae5','#6ee7b7']]; // name, base, specular, rim
const DEF={apiKey:'',model:'meta-llama/llama-3.3-70b-instruct:free',avatarType:'2d',style3d:'smooth',palette:'Sky',speed:1.0,squish:1.0,trackGaze:true,firstRun:true,bg:'night',smile:true,blush:.6,autostart:false,startMinimized:true,theme:'dark'};
let activeAvatarType='2d',active3DStyle='smooth',activePalette='Sky',activeBg='night',tab=0,wiz=0;
const speedSlider=$('#speed'),squishSlider=$('#squish'),gazeCheckbox=$('#gaze'),kin=$('#api-key-input'),wk=$('#wiz-key');
const pal=()=>activeAvatarType==='2d'?P2:P3;
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2600)};
const setTheme=t=>{document.documentElement.dataset.theme=t;$('#themeLabel').textContent='Switch to '+(t==='dark'?'Light':'Dark')};
function sync(){
 if(!pal().some(p=>p[0]===activePalette))activePalette=pal()[0][0];
 $('#pals').innerHTML=pal().map(p=>`<button class="swc${p[0]===activePalette?' on':''}" data-pal="${p[0]}" style="--c:${p[1]}"><i></i>${p[0]}${p[2]?`<s style="background:${p[2]}" title="Specular"></s><s style="background:${p[3]}" title="Rim light"></s>`:''}</button>`).join('');
 $('#palnote').textContent=activeAvatarType==='2d'?'2D Pixel Cloud palette.':'3D Mochi Bot palette. Small dots show specular and rim light.';
 $$('[data-av]').forEach(b=>b.classList.toggle('on',b.dataset.av===activeAvatarType));
 $$('[data-geo]').forEach(b=>b.classList.toggle('on',b.dataset.geo===active3DStyle));
 $$('[data-bg]').forEach(b=>b.classList.toggle('on',b.dataset.bg===activeBg));
 $$('.geo').forEach(g=>g.classList.toggle('dim',activeAvatarType!=='3d'));
 $('#sum').textContent=`${activeAvatarType==='2d'?'2D Pixel Cloud':'3D Mochi Bot'} · ${activePalette} · ${kin.value.trim()?'key connected':'no key yet'}`}
const out=()=>{$('#speedv').textContent=(+speedSlider.value).toFixed(2)+'×';$('#squishv').textContent=Math.round(squishSlider.value*100)+'%';$('#blushv').textContent=$('#blush').value+'%'};
function go(i){tab=i;$$('.panel').forEach(p=>p.classList.toggle('on',+p.dataset.p===i));$$('#nav .slink').forEach((b,j)=>b.classList.toggle('on',j===i));sync()}
function wz(i){wiz=clamp(i,0,2);$$('.step').forEach(s=>s.classList.toggle('on',+s.dataset.w===wiz));$$('#dots i').forEach((d,j)=>d.classList.toggle('on',j<=wiz));$('#back').style.visibility=wiz?'':'hidden';$('#next').style.display=wiz<2?'':'none';sync()}
function chk(v){const ok=/^sk-or-[\w-]{10,}$/.test(v),e=$('#kst');e.className='st '+(v?ok?'ok':'bad':'');e.textContent=v?ok?'Looks like a valid OpenRouter key':'OpenRouter keys start with sk-or-. Check for a typo.':'No key yet'}
document.addEventListener('click',e=>{const t=e.target.closest('[data-pal],[data-av],[data-geo],[data-bg],[data-ext],#nav .slink');if(!t)return;
 if(t.dataset.ext!==undefined){e.preventDefault();window.goo?.openExternal?window.goo.openExternal(t.href):window.open(t.href,'_blank');return}
 if(t.dataset.pal)activePalette=t.dataset.pal;if(t.dataset.av)activeAvatarType=t.dataset.av;if(t.dataset.geo)active3DStyle=t.dataset.geo;if(t.dataset.bg)activeBg=t.dataset.bg;
 if(t.closest('#nav'))return go($$('#nav .slink').indexOf(t));sync()});
[speedSlider,squishSlider,$('#blush')].forEach(s=>s.oninput=out);
[kin,wk].forEach(el=>el.oninput=()=>{kin.value=wk.value=el.value;chk(el.value.trim());sync()});
$('#eye').onclick=()=>{kin.type=kin.type==='password'?'text':'password'};
$('#test').onclick=async()=>{const e=$('#kst');e.className='st';e.textContent='Testing…';
 try{const r=await fetch('https://openrouter.ai/api/v1/auth/key',{headers:{Authorization:'Bearer '+kin.value.trim()}});e.className='st '+(r.ok?'ok':'bad');e.textContent=r.ok?'Key verified':'OpenRouter rejected this key ('+r.status+')'}
 catch{e.className='st bad';e.textContent='Could not reach OpenRouter. Check your connection.'}};
$('#next').onclick=()=>wz(wiz+1);$('#back').onclick=()=>wz(wiz-1);
$('#themeToggle').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
async function saveAllSettings(){
 const o={apiKey:kin.value.trim(),model:$('#model-select').value,avatarType:activeAvatarType,style3d:active3DStyle,palette:activePalette,
  speed:parseFloat(speedSlider.value),squish:parseFloat(squishSlider.value),trackGaze:gazeCheckbox.checked,firstRun:false,
  bg:activeBg,smile:$('#smile').checked,blush:$('#blush').value/100,autostart:$('#auto').checked,startMinimized:$('#mini').checked,theme:document.documentElement.dataset.theme};
 if(window.goo?.saveSettings){await window.goo.saveSettings(o);window.goo.closeStudio?.()}
 else{try{localStorage.kumo=JSON.stringify(o)}catch{}toast('Saved locally. No Electron bridge found.')}}
$('#save').onclick=$('#launch').onclick=saveAllSettings;
(async()=>{let s=null;try{s=await window.goo?.getSettings()}catch{}if(!s)try{s=JSON.parse(localStorage.kumo)}catch{}
 s={...DEF,...s};activeAvatarType=s.avatarType;active3DStyle=s.style3d;activePalette=s.palette;activeBg=s.bg;
 kin.value=wk.value=s.apiKey;$('#model-select').value=s.model;speedSlider.value=s.speed;squishSlider.value=s.squish;gazeCheckbox.checked=s.trackGaze;
 $('#smile').checked=s.smile;$('#blush').value=Math.round(s.blush*100);$('#auto').checked=s.autostart;$('#mini').checked=s.startMinimized;
 setTheme(s.theme);chk(s.apiKey);out();go(s.firstRun?0:1);wz(0)})();