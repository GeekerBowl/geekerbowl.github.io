(function(){
 const keys=new Map();
 let releaseFrame=()=>{};
 function fitFrame(root,frame){
  const resize=()=>{if(!root.contains(frame)){releaseFrame();return;}const viewport=window.visualViewport?.height||window.innerHeight;frame.style.height=Math.max(200,Math.floor(viewport-root.getBoundingClientRect().top-20))+'px';};
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;
  releaseFrame=()=>{window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);observer?.disconnect();};
  window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);observer?.observe(root);resize();
 }
 window.cmShopRequestId=function(id){if(!keys.has(id))keys.set(id,crypto.randomUUID());return keys.get(id);};
 window.cmShopRequestDone=id=>keys.delete(id);
 window.renderCardMaker=async function(){
  releaseFrame();
  const root=document.getElementById('content-container');root.innerHTML='<div class="section"><h1>CARD MAKER</h1><p>正在验证 ONGEKI 使用权与 Aime 主卡…</p></div>';const loading=root.firstElementChild;
  try{const result=await secureFetch('https://api.am-all.com.cn/api/cardmaker/launch',{method:'POST',body:JSON.stringify({})}),url=new URL(result.url);if(url.origin!=='https://api.am-all.com.cn'||url.pathname!=='/cardmaker/enter')throw Error('进入地址无效');if(!root.contains(loading))return;url.searchParams.set('embedded','1');const frame=document.createElement('iframe');frame.title='CARD MAKER';frame.allow='autoplay';frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.referrerPolicy='no-referrer';frame.style.cssText='display:block;width:100%;height:calc(100vh - 120px);min-height:200px;border:0;background:transparent;border-radius:12px';frame.src=url.href;root.replaceChildren(frame);fitFrame(root,frame);}
  catch(e){if(!root.contains(loading))return;root.replaceChildren();const box=document.createElement('div');box.className='section';const title=document.createElement('h1');title.textContent='CARD MAKER';const text=document.createElement('p');text.textContent=e.message;const button=document.createElement('button');button.textContent='重新进入';button.onclick=renderCardMaker;box.append(title,text,button);root.append(box);}
 };
})();
