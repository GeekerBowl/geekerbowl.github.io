(function(){
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels={sourceBest:'原文件最佳成绩',sourcePlaylogs:'原文件游玩记录',newBest:'新增可用谱面成绩',updatedBest:'改善已有成绩／次数',newPlaylogs:'新增可用游玩记录',archivedBest:'历史谱面归档',archivedPlaylogs:'历史游玩记录归档',duplicatePlaylogs:'重复游玩记录'};
 const stats=s=>`<dl class="allnet-import-stats">${Object.entries(labels).map(([k,label])=>`<div><dt>${label}</dt><dd>${Number(s[k]).toLocaleString()}</dd></div>`).join('')}</dl><p>成长：转生${Number(s.growthBefore.reincarnationNum||0)} / Lv.${Number(s.growthBefore.level||0)} → 转生${Number(s.growthAfter.reincarnationNum||0)} / Lv.${Number(s.growthAfter.level||0)}；当前曲库 Rating：${Number(s.ratingAfter).toFixed(3)}</p>`;
 async function request(path,body,plain=false){
  const response=await fetch('https://api.am-all.com.cn/api/allnet/import/'+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+(localStorage.getItem('token')||''),'Content-Type':plain?'text/plain':'application/json'},body:body===undefined?undefined:plain?body:JSON.stringify(body)});
  const data=await response.json().catch(()=>({message:'服务器响应异常'}));if(!response.ok||data.success===false)throw Object.assign(new Error(data.message||data.error||'操作失败'),{code:data.code});return data;
 }
 function render(cards,activated){return `<section class="allnet-card allnet-card--wide" id="allnet-save-import"><h3 class="allnet-card__title">游戏存档导入</h3><div role="tablist" aria-label="导入游戏" class="allnet-import-tabs">${[['ongeki','ONGEKI'],['chunithm','CHUNITHM'],['maimai','maimai DX']].map(([id,label])=>`<button type="button" role="tab" aria-selected="${id==='ongeki'}" class="allnet-btn${id==='ongeki'?'':' allnet-btn--light'}" data-import-game="${id}">${label}</button>`).join('')}</div><p id="allnet-import-unavailable" hidden>此游戏的数据导入暂未开放。</p><div id="allnet-import-panel">${!activated?'<p>请先激活 ONGEKI 利用权；本功能不要求付费会员。</p>':!cards.length?'<p>请先绑定 Aime 卡，并在本服务器的 ONGEKI 1.60 登录建档。</p>':`<p class="allnet-hint">支持 RinNET ONGEKI JSON。保留本地身份与更好的成绩；当前曲库无法关联的成绩单独归档。卡片、道具、货币和账号资料不导入。</p><label class="allnet-import-label">目标 Aime 卡<select id="allnet-import-binding" class="allnet-input">${cards.map((c,i)=>`<option value="${Number(c.bindingId)}" ${c.isPrimary?'selected':''}>No.${Number(c.slot||i+1)} · ${esc(c.accessCodeMasked||'已绑定卡片')}${c.isPrimary?'（主卡）':''}</option>`).join('')}</select></label><label class="allnet-import-label">RinNET JSON 文件（最多10 MiB）<input id="allnet-import-file" type="file" accept=".json,application/json" class="allnet-input"></label><label class="allnet-import-label"><input id="allnet-import-growth" type="checkbox" checked> 导入等级／转生／EXP，保留更高成长进度</label><button type="button" id="allnet-import-preview" class="allnet-btn" disabled>读取并预览</button><div id="allnet-import-summary"></div><button type="button" id="allnet-import-archive" class="allnet-btn allnet-btn--light">下载历史成绩归档</button>`}</div><p id="allnet-import-message" role="status" class="allnet-hint"></p></section>`;}
 function bind(container,messageBox,refresh){
  const root=container.querySelector('#allnet-save-import');if(!root)return;
  let busy=false,preview=null;
  const find=id=>root.querySelector('#allnet-import-'+id),file=find('file'),target=find('binding'),growth=find('growth'),read=find('preview'),box=find('summary'),message=find('message');
  function setBusy(value){busy=value;root.querySelectorAll('input,select,button').forEach(e=>{e.disabled=value;});if(read)read.disabled=value||!file.files.length;if(find('commit'))find('commit').disabled=value||!find('ended').checked;}
  function invalidate(){preview=null;if(box)box.innerHTML='';message.textContent='';if(read)read.disabled=!file.files.length;}
  root.querySelectorAll('[data-import-game]').forEach(button=>button.addEventListener('click',()=>{
   if(busy)return;root.querySelectorAll('[data-import-game]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.classList.toggle('allnet-btn--light',b!==button);});
   find('panel').hidden=button.dataset.importGame!=='ongeki';find('unavailable').hidden=button.dataset.importGame==='ongeki';invalidate();
  }));
  if(!file)return;
  [file,target,growth].forEach(input=>input.addEventListener('change',invalidate));
  read.addEventListener('click',async()=>{setBusy(true);message.textContent='';box.innerHTML='';preview=null;try{
   const selected=file.files[0];if(!selected)throw new Error('请选择 RinNET JSON 文件');if(selected.size>10*1024*1024)throw new Error('文件最多10 MiB');
   preview=await request(`ongeki/preview?bindingId=${encodeURIComponent(target.value)}&growth=${growth.checked?'1':'0'}`,await selected.text(),true);
   box.innerHTML=`${stats(preview.summary)}<p class="allnet-hint">预览有效期10分钟。此时尚未写入存档。</p><label class="allnet-import-label"><input id="allnet-import-ended" type="checkbox"> 我已退出游戏，并完成保存</label><button type="button" id="allnet-import-commit" class="allnet-btn">确认导入</button>`;
   const commit=find('commit');find('ended').addEventListener('change',()=>{commit.disabled=!find('ended').checked;});commit.addEventListener('click',async()=>{
    if(busy)return;if(!find('ended').checked){message.textContent='请先确认已退出游戏并保存';return;}
    if(!await messageBox('将合并至所选 Aime 卡，保留更好的成绩和本地账号资料，历史谱面单独归档。卡片与道具不迁移。','确认导入 ONGEKI 存档',true))return;
    if(!root.isConnected||!preview)return;setBusy(true);try{
     const response=await request('ongeki/commit',{taskId:preview.taskId,endedGame:true});preview=null;
     box.innerHTML=stats(response.result);message.textContent=response.message;
    }catch(e){message.textContent=e.message;if(['EXPIRED','TARGET_CHANGED'].includes(e.code)){preview=null;box.innerHTML='';}}finally{setBusy(false);}
   });
  }catch(e){message.textContent=e.message;}finally{setBusy(false);}});
  find('archive').addEventListener('click',async()=>{if(busy)return;setBusy(true);try{
   const data=await request('ongeki/archive?bindingId='+encodeURIComponent(target.value));const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='ongeki-historical-archive.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){message.textContent=e.message;}finally{setBusy(false);}});
 }
 window.AllnetSaveImport={render,bind};
})();
