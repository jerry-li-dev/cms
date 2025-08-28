const App=(function(){
  const cfg=()=>window.APP_CONFIG||{};
  const state={filteredFiles:[],sortMethod:'alphabetical',fileMeta:{}};

  async function init(){
    const user=Auth.currentUser();
    document.getElementById('userBadge').textContent=user?`${user.displayName} (${user.username})`:'Not signed in';
    document.getElementById('sortSelect').addEventListener('change',e=>{ state.sortMethod=e.target.value; renderFiles(); });
    document.getElementById('dateFilter').addEventListener('input',()=>applyFilter());

    await loadFilesFromRepo();
    applyFilter();
  }

  async function loadFilesFromRepo(path="") {
    const res = await fetch(`https://api.github.com/repos/${cfg().owner}/${cfg().repo}/contents/${path}?ref=${cfg().branch}`);
    const data = await res.json();
    const map = {};
    for(const f of data){
      if(f.type === "file") map[f.name]=f.path;
      else if(f.type === "dir") Object.assign(map, await loadFilesFromRepo(f.path));
    }
    cfg().fileMap = map; // populate dynamically
    state.fileMeta = {};
    for(const name in map){
      const res2 = await fetch(`https://api.github.com/repos/${cfg().owner}/${cfg().repo}/contents/${encodeURIComponent(map[name])}?ref=${encodeURIComponent(cfg().branch)}`);
      const fileData = await res2.json();
      const commits = await fetch(`https://api.github.com/repos/${cfg().owner}/${cfg().repo}/commits?path=${encodeURIComponent(map[name])}&per_page=1&sha=${encodeURIComponent(cfg().branch)}`).then(r=>r.json());
      state.fileMeta[name] = {size:fileData.size||0, date: commits[0]? new Date(commits[0].commit.author.date).getTime():0};
    }
    state.filteredFiles = Object.keys(cfg().fileMap);
  }

  function applyFilter(){
    const q=(document.getElementById('search').value||'').toLowerCase();
    const days=parseInt(document.getElementById('dateFilter').value||'0',10);
    const now=Date.now();
    state.filteredFiles=Object.keys(state.fileMeta).filter(name=>{
      const matchesSearch=name.toLowerCase().includes(q);
      const matchesDate=days>0?(now-state.fileMeta[name].date)<=days*24*60*60*1000:true;
      return matchesSearch&&matchesDate;
    });
    renderFiles();
  }

  function renderFiles(){
    const list=document.getElementById('fileList');
    list.innerHTML='';
    let files=[...state.filteredFiles];
    switch(state.sortMethod){
      case 'size': files.sort((a,b)=>state.fileMeta[b].size-state.fileMeta[a].size); break;
      case 'recent': files.sort((a,b)=>state.fileMeta[b].date-state.fileMeta[a].date); break;
      case 'alphabetical':
      default: files.sort();
    }
    files.forEach(name=>{
      const a=document.createElement('a');
      a.className='list-item';
      a.href=`file.html?file=${encodeURIComponent(name)}`;
      a.textContent=name;
      const metaDiv=document.createElement('div');
      metaDiv.className='meta';
      metaDiv.textContent=`Size: ${state.fileMeta[name].size} bytes, Date: ${new Date(state.fileMeta[name].date).toLocaleString()}`;
      a.appendChild(metaDiv);
      list.appendChild(a);
    });
    if(!files.length){ const e=document.createElement('div'); e.className='muted'; e.textContent='No files found.'; list.appendChild(e); }
  }

  return {init,applyFilter};
})();
