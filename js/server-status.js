(()=>{
 let clean=null;
 window.renderServerStatus=()=>{
  clean?.();const host=document.getElementById('content-container');if(!host)return;
  host.innerHTML='<section class="section"><h1>服务器状态</h1><iframe title="服务器状态" src="https://crew.am-all.com.cn/status/embed/" style="display:block;width:100%;height:850px;border:0;background:transparent" referrerpolicy="no-referrer"></iframe></section>';
  const frame=host.querySelector('iframe'),controller=new AbortController();
  window.addEventListener('message',event=>{if(event.origin!=='https://crew.am-all.com.cn'||event.source!==frame.contentWindow||event.data?.type!=='service-status-height')return;const h=Number(event.data.height);if(Number.isFinite(h))frame.style.height=Math.min(1800,Math.max(400,h))+'px'},{signal:controller.signal});
  const observer=new MutationObserver(()=>{if(!host.contains(frame))clean?.()});observer.observe(host,{childList:true,subtree:true});
  clean=()=>{controller.abort();observer.disconnect();clean=null};
 };
})();
