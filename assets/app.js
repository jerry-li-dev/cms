const App=(function(){
  const cfg=()=>window.APP_CONFIG||{};
  const state={filteredFiles:[],sortMethod:'alphabetical'};
  function init(){
    const user=Auth.currentUser();
    document.getElementById('userBadge').textContent=user?`${user.displayName} (${user.username})`:'Not signed in';
    document.getElementById('sortSelect').addEventListener('change',e=>{ state.sortMethod=e.target.value; renderFiles(); });
    document.getElementById('dateFilter').addEventListener('input',()=>applyFilter());
    renderFiles();
  }
  function applyFilter(){
    const q=(document.getElementById('search').value||'').toLowerCase();
    const fileMap=cfg().fileMap;
    state.filteredFiles=Object.keys(fileMap).filter(name=>name.toLowerCase().includes(q));
    renderFiles();
  }
  function renderFiles(){
    const list=document.getElementById('fileList'); list.innerHTML='';
    let files=[...state.filteredFiles];
    if(state.sortMethod==='alphabetical') files.sort();
    files.forEach(name=>{
      const a=document.createElement('a'); a.className='list-item';
      a.href=`file.html?file=${encodeURIComponent(name)}`; a.textContent=name; list.appendChild(a);
    });
    if(!files.length){ const e=document.createElement('div'); e.className='muted'; e.textContent='No files found.'; list.appendChild(e); }
  }
  return{init,applyFilter};
})();