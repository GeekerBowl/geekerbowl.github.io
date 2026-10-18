(function(){
 const keys=new Map();
 window.cmShopRequestId=function(id){if(!keys.has(id))keys.set(id,crypto.randomUUID());return keys.get(id);};
 window.cmShopRequestDone=id=>keys.delete(id);
 window.renderCardMaker=async function(){
  const root=document.getElementById('content-container');root.innerHTML='<div class="section"><h1>CARD MAKER</h1><p>正在验证 ONGEKI 使用权与 Aime 主卡…</p></div>';
  try{const result=await secureFetch('https://api.am-all.com.cn/api/cardmaker/launch',{method:'POST',body:JSON.stringify({})}),url=new URL(result.url);if(url.origin!=='https://api.am-all.com.cn'||url.pathname!=='/cardmaker/enter')throw Error('进入地址无效');location.assign(url.href);}
  catch(e){root.replaceChildren();const box=document.createElement('div');box.className='section';const title=document.createElement('h1');title.textContent='CARD MAKER';const text=document.createElement('p');text.textContent=e.message;const button=document.createElement('button');button.textContent='重新进入';button.onclick=renderCardMaker;box.append(title,text,button);root.append(box);}
 };
})();
