const App = (function(){
  const cfg = () => window.APP_CONFIG || {};
  const state = { allFiles: [], filtered: [], sortMethod: 'date' };

  // Initialize dashboard after login
  function init() {
    const user = Auth.currentUser();
    document.getElementById('userBadge').textContent = user ? `${user.displayName} (${user.username})` : 'Not signed in';

    const sortSelect = document.getElementById('sortSelect');
    if(sortSelect){
      sortSelect.addEventListener('change', e => {
        state.sortMethod = e.target.value;
        renderFiles();
      });
    }

    const dateFilterInput = document.getElementById('dateFilter');
    if(dateFilterInput){
      dateFilterInput.addEventListener('input', () => applyFilter());
    }

    loadFiles();
  }

  // Fetch all files from GitHub API
  async function loadFiles() {
    const list = document.getElementById('fileList');
    list.innerHTML = '<div class="muted">Loading…</div>';
    try {
      const cfg0 = cfg();
      const folders = cfg0.folders || [""];
      let allFiles = [];

      for (const folder of folders) {
        const contents = await fetch(`https://api.github.com/repos/${cfg0.owner}/${cfg0.repo}/contents/${encodeURIComponent(folder)}?ref=${encodeURIComponent(cfg0.branch)}`)
          .then(res => res.json());

        const items = Array.isArray(contents) ? contents : [contents];
        let files = items.filter(i => i.type === 'file');

        if ((cfg0.extensions || []).length > 0) {
          files = files.filter(f => {
            const m = f.name.toLowerCase().match(/\.([a-z0-9]+)$/);
            return m ? cfg0.extensions.includes(m[1]) : false;
          });
        }

        allFiles = allFiles.concat(files);
      }

      // Fetch latest commit for each file
      const promises = allFiles.map(async f => {
        try {
          const commit = await fetch(`https://api.github.com/repos/${cfg0.owner}/${cfg0.repo}/commits?path=${encodeURIComponent(f.path)}&per_page=1&sha=${encodeURIComponent(cfg0.branch)}`)
            .then(res => res.json());
          return { ...f, commit: commit[0] || null };
        } catch(e) {
          return { ...f, commit: null };
        }
      });

      state.allFiles = await Promise.all(promises);
      applyFilter();
    } catch (e) {
      list.innerHTML = `<div class="error">Error: ${e.message}</div>`;
    }
  }

  // Convert bytes to human-readable size
  function humanSize(bytes){
    if (!bytes) return '';
    const units = ['B','KB','MB','GB'];
    let i=0, n=bytes;
    while (n>=1024 && i<units.length-1){ n/=1024; i++; }
    return n.toFixed(n<10 && i>0?1:0) + ' ' + units[i];
  }

  // Choose icon based on file type
  function iconFor(name){
    const n = name.toLowerCase();
    if (n.match(/\.(png|jpg|jpeg|gif|webp)$/)) return '🖼️';
    if (n.endsWith('.pdf')) return '📄';
    if (n.match(/\.(md|txt|json|csv)$/)) return '📘';
    return '📦';
  }

  // Filter files based on search & date
  function applyFilter(){
    const q = (document.getElementById('search').value || '').toLowerCase();
    const days = parseInt(document.getElementById('dateFilter').value || '0',10);
    const now = Date.now();
    state.filtered = state.allFiles.filter(f => {
      const hay = (f.name + ' ' + (f.commit && f.commit.commit && f.commit.commit.message || '')).toLowerCase();
      const matchesSearch = hay.includes(q);

      let matchesDate = true;
      if(days > 0 && f.commit){
        const commitTime = new Date(f.commit.commit.author.date).getTime();
        matchesDate = (now - commitTime) <= (days * 24 * 60 * 60 * 1000);
      }

      return matchesSearch && matchesDate;
    });

    renderFiles();
  }

  // Render the filtered files in scrollable list
  function renderFiles(){
    const list = document.getElementById('fileList');
    list.innerHTML = '';

    let files = [...state.filtered];
    switch(state.sortMethod){
      case 'size':
        files.sort((a,b) => (b.size || 0) - (a.size || 0)); break;
      case 'alphabetical':
        files.sort((a,b) => a.name.localeCompare(b.name)); break;
      case 'recent':
      case 'date':
      default:
        files.sort((a,b) => {
          const dateA = a.commit ? new Date(a.commit.commit.author.date).getTime() : 0;
          const dateB = b.commit ? new Date(b.commit.commit.author.date).getTime() : 0;
          return dateB - dateA;
        }); break;
    }

    for (const item of files) {
      const a = document.createElement('a');
      a.className = 'list-item';
      a.href = `file.html?path=${encodeURIComponent(item.path)}`;
      const commitMsg = item.commit ? (item.commit.commit.message.split('\n')[0]) : '';
      const commitDate = item.commit ? new Date(item.commit.commit.author.date).toLocaleString() : '';
      a.innerHTML = `
        <div class="li-left">${iconFor(item.name)}</div>
        <div class="li-mid"><div class="item-title">${item.name}</div></div>
        <div class="li-right">
          <div class="meta">${humanSize(item.size)}</div>
          <div class="meta">${commitDate}</div>
          <div class="meta commit-msg">${commitMsg}</div>
        </div>
      `;
      list.appendChild(a);
    }

    if (!files.length) {
      const e = document.createElement('div');
      e.className = 'muted';
      e.textContent = 'No files found.';
      list.appendChild(e);
    }
  }

  return { init, loadFiles, applyFilter };
})();
