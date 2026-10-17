(function(){
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function exportMarkup(){return '<div class="allnet-panel" id="allnet-export"><h4>本服存档导出与快照</h4><p>请先退出游戏并保存。直接导出即时下载，不占用快照。每个账号最多保存2个快照，各保留7天，到期后无法下载。</p><p>本服 .amall 存档加密校验，仅限原主站账号导入；安全合并成绩与养成，不覆盖主站财务、身份和 KEYCHIP。</p><button type="button" class="allnet-btn" data-export="direct">直接导出存档</button><button type="button" class="allnet-btn" data-export="capture">拍摄存档快照</button><button type="button" class="allnet-btn" data-export="refresh">刷新快照</button><div id="allnet-export-list"></div></div>';}
 function bindExport(root,target,messageBox){
  const box=root.querySelector('#allnet-export'),list=root.querySelector('#allnet-export-list');if(!box)return;let busy=false,loadId=0;
  const base='https://api.am-all.com.cn/api/allnet/import/ongeki',query=()=>'?bindingId='+encodeURIComponent(target.value);
  const headers=()=>({Authorization:'Bearer '+(localStorage.getItem('token')||''),'Content-Type':'application/json'});
  async function request(url,options={}){const r=await fetch(url,{headers:headers(),cache:'no-store',...options});const data=await r.json().catch(()=>({message:'服务器响应异常'}));if(!r.ok)throw Error(data.message||'操作失败');return data;}
  async function load(){const ticket=++loadId;try{const r=await request(base+'/snapshots'+query());if(!box.isConnected||ticket!==loadId)return;list.innerHTML='';box.querySelector('[data-export="capture"]').disabled=busy||r.snapshots.length>=2;for(const row of r.snapshots){const item=document.createElement('div');item.className='allnet-panel';const p=document.createElement('p');p.textContent='拍摄时间：'+new Date(row.createdAt).toLocaleString('zh-CN')+'；到期：'+new Date(row.expiresAt).toLocaleString('zh-CN');item.append(p);for(const [action,label]of [['download','下载快照'],['delete','删除快照']]){const b=document.createElement('button');b.type='button';b.className='allnet-btn';b.textContent=label;b.onclick=()=>act(action,row.id);item.append(b);}list.append(item);}}catch(e){list.textContent=e.message;}}
  async function act(kind,id){if(busy)return;busy=true;box.querySelectorAll('button').forEach(b=>b.disabled=true);try{
   if(kind==='refresh'){await load();return;}
   if(kind==='capture'){const r=await request(base+'/snapshots',{method:'POST',body:JSON.stringify({bindingId:Number(target.value)})});await messageBox(r.message,'存档快照');}
   else if(kind==='delete'){if(!await messageBox('确定删除此快照？','删除快照',true))return;const r=await request(base+'/snapshots/'+encodeURIComponent(id)+query(),{method:'DELETE'});await messageBox(r.message,'存档快照');}
   else{const r=await fetch(base+(kind==='direct'?'/export':'/snapshots/'+encodeURIComponent(id))+query(),{headers:headers(),cache:'no-store'});if(!r.ok){const error=await r.json();throw Error(error.message||'下载失败');}const url=URL.createObjectURL(await r.blob()),a=document.createElement('a');a.href=url;a.download=kind==='direct'?'amall-ongeki-save.amall':'amall-ongeki-snapshot.amall';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  }catch(e){await messageBox(e.message,'存档导出与快照');}finally{busy=false;box.querySelectorAll('button').forEach(b=>b.disabled=false);await load();}}
  box.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>act(b.dataset.export));target.addEventListener('change',load);load();
 }
 const labels={sourceBest:"原档最佳成绩",sourcePlaylogs:"原档游玩记录",newBest:'新增可用谱面成绩',updatedBest:'改善已有成绩／次数',newPlaylogs:'新增可用游玩记录',archivedBest:'历史谱面归档',archivedPlaylogs:'历史游玩记录归档',duplicatePlaylogs:'重复游玩记录',importedCards:'新增／改善卡片',importedEquipment:'新增／恢复装备',importedCharacters:'新增／改善角色养成',excludedCards:'排除活动／无效卡片',excludedEquipment:'排除活动／无效装备',excludedScoreCharts:'异常歌曲谱面已排除',excludedScoreLogs:'异常歌曲记录已排除'};
 const warnings=s=>s.suspiciousSongs?.length?`<div role="alert" class="allnet-hint"><strong>${s.suspiciousSongs.length}首歌曲数据异常，不会进行导入，请联系管理员。</strong><ul>${s.suspiciousSongs.map(x=>`<li>${esc(x.title)}（ID ${Number(x.musicId)}）：${esc(x.reason)}</li>`).join('')}</ul></div>`:'';
 const stats=s=>`<dl class="allnet-import-stats">${Object.entries(labels).map(([k,label])=>`<div><dt>${label}</dt><dd>${Number(s[k]||0).toLocaleString()}</dd></div>`).join('')}</dl><p>成长：转生${Number(s.growthBefore.reincarnationNum||0)} / Lv.${Number(s.growthBefore.level||0)} → 转生${Number(s.growthAfter.reincarnationNum||0)} / Lv.${Number(s.growthAfter.level||0)}；当前曲库 Rating：${Number(s.ratingAfter).toFixed(3)}</p>${warnings(s)}`;
 async function request(path,body,plain=false){
  const response=await fetch('https://api.am-all.com.cn/api/allnet/import/'+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+(localStorage.getItem('token')||''),'Content-Type':plain?'application/octet-stream':'application/json'},body:body===undefined?undefined:plain?body:JSON.stringify(body)});
  const data=await response.json().catch(()=>({message:'服务器响应异常'}));if(!response.ok||data.success===false)throw Object.assign(new Error(data.message||data.error||'操作失败'),{code:data.code});return data;
 }
 function render(cards,activated){return `<section class="allnet-card allnet-card--wide" id="allnet-save-import"><h3 class="allnet-card__title">数据导入</h3><div role="tablist" aria-label="导入游戏" class="allnet-import-tabs">${[['ongeki','ONGEKI'],['chunithm','CHUNITHM'],['maimai','maimai DX']].map(([id,label])=>`<button type="button" role="tab" aria-selected="${id==='ongeki'}" class="allnet-btn${id==='ongeki'?'':' allnet-btn--light'}" data-import-game="${id}">${label}</button>`).join('')}</div><p id="allnet-import-unavailable" hidden>此游戏的数据导入暂未开放。</p><div id="allnet-import-panel">${!activated?"<p>请先激活 ONGEKI 利用权；使用数据导入无需开通会员。</p>":!cards.length?"<p>请先绑定 Aime 卡，并在本服登录建档。</p>":`<p class="allnet-hint">支持导入 RinNET ONGEKI Json格式存档。保留本地身份与更好的成绩；当前曲库无法关联的成绩单独归档。支持非活动卡片、icon、plate、称号、服装、饰品及角色养成。活动来源物品、货币、消耗道具和账号资料暂不支持导入。</p><label class="allnet-import-label">目标 Aime 卡<select id="allnet-import-binding" class="allnet-input">${cards.map((c,i)=>`<option value="${Number(c.bindingId)}" ${c.isPrimary?'selected':''}>No.${Number(c.slot||i+1)} · ${esc(c.accessCodeMasked||'已绑定卡片')}${c.isPrimary?'（主卡）':''}</option>`).join('')}</select></label><label class="allnet-import-label">存档文件（RinNET JSON / 本服 .amall，最多30 MiB）<input id="allnet-import-file" type="file" accept=".json,.amall,application/json,application/octet-stream" class="allnet-input"></label><label class="allnet-import-label"><input id="allnet-import-growth" type="checkbox" checked> 导入等级／转生／EXP，保留更高成长进度</label><button type="button" id="allnet-import-preview" class="allnet-btn" disabled>读取并预览</button><div id="allnet-import-summary"></div><button type="button" id="allnet-import-archive" class="allnet-btn allnet-btn--light">下载历史成绩归档</button>${exportMarkup()}`}</div><p id="allnet-import-message" role="status" class="allnet-hint"></p></section>`;}
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
  if(!file)return;bindExport(root,target,messageBox);
  [file,target,growth].forEach(input=>input.addEventListener('change',invalidate));
  read.addEventListener('click',async()=>{setBusy(true);message.textContent='';box.innerHTML='';preview=null;try{
  const selected=file.files[0];if(!selected)throw new Error('请选择 RinNET JSON 或本服 .amall 存档');if(selected.size>30*1024*1024)throw new Error('文件最多30 MiB');
   preview=await request(`ongeki/preview?bindingId=${encodeURIComponent(target.value)}&growth=${growth.checked?'1':'0'}`,await selected.arrayBuffer(),true);
   box.innerHTML=`${stats(preview.summary)}<p class="allnet-hint">预览有效期10分钟。此时尚未写入存档。</p><label class="allnet-import-label"><input id="allnet-import-ended" type="checkbox"> 我已退出游戏，并完成保存</label><button type="button" id="allnet-import-commit" class="allnet-btn">确认导入</button>`;
   const commit=find('commit');find('ended').addEventListener('change',()=>{commit.disabled=!find('ended').checked;});commit.addEventListener('click',async()=>{
    if(busy)return;if(!find('ended').checked){message.textContent='请先确认已退出游戏并保存';return;}
    if(!await messageBox('将合并至所选 Aime 卡，保留更好的成绩和本地账号资料，历史谱面单独归档。会合并非活动卡片、装备及角色养成；异常歌曲和活动物品已排除。','确认导入 ONGEKI 存档',true))return;
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
