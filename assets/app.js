// Main app: lists files with size, last commit date, and short commit message.
// WARNING: for each file we call commits endpoint once — for many files you'll hit rate limits.
// Consider limiting folders or implementing server-side caching for production.

const App = (function(){
  const cfg = () => window.APP_CONFIG || {};
  const state = { activeFolder: '', allFiles: [], filtered: [] };

  function init() {
    const user = Auth.currentUser();
    document.getElementById('userBadge').textContent = user ? `${user.displayName} (${user.username})` : 'Not signed in';
    renderFolderList();
    loadFiles(); // initial
  }

  function renderFolderList() {
    const el = document.getElementById('folderList');
    el.innerHTML = '';
    (cfg().folders || []).forEach(f => {
      const btn = document.createElement('div');
      btn.className = 'folder-item';
      btn.textContent = (f === '' ? '/' : f);
      if (f === state.activeFolder) btn.classList.add('active');
      btn.addEventListener('click', () => {
        state.activeFolder = f;
        document.querySelectorAll('.folder-item').forEach(n => n.classList.remove('active'));
        btn.classList.add('active');
        loadFiles();
      });
      el.appendChild(btn);
    });
  }

  async function loadFiles() {
    const list = document.getElementById('fileList');
    list.innerHTML = '<div class="muted">Loading…</div>';
    try {
      const cfg0 = cfg();
      const contents = await GH.listFolderContents(cfg0.owner, cfg0.repo, cfg0.branch, state.activeFolder);
      const items = Array.isArray(contents) ? contents : [contents];
      // filter for files
      let files = items.filter(i => i.type === 'file');
      // filter extensions
      if ((cfg0.extensions || []).length > 0) {
        files = files.filter(f => {
          const m = f.name.toLowerCase().match(/\.([a-z0-9]+)$/);
          return m ? cfg0.extensions.includes(m[1]) : false;
        });
      }

      // fetch commit metadata for each file (parallel but mindful of limits)
      const promises = files.map(async f => {
        try {
          const commit = await GH.getLatestCommit(cfg0.owner, cfg0.repo, cfg0.branch, f.path);
          return { ...f, commit };
        } catch(e) {
          return { ...f, commit: null };
        }
      });

      const withCommits = await Promise.all(promises);
      state.allFiles = withCommits;
      applyFilter();
    } catch (e) {
      list.innerHTML = `<div class="error">Error: ${e.message}</div>`;
    }
  }

  function iconFor(name){
    const n = name.toLowerCase();
    if (n.match(/\.(png|jpg|jpeg|gif|webp)$/)) return '🖼️';
    if (n.endsWith('.pdf')) return '📄';
    if (n.match(/\.(md|txt|json|csv)$/)) return '📘';
    return '📦';
  }

  function humanSize(bytes){
    if (bytes === 0 || bytes === undefined || bytes === null) return '';
    const units = ['B','KB','MB','GB'];
    let i=0; let n = bytes;
    while (n>=1024 && i<units.length-1){ n/=1024; i++; }
    return n.toFixed(n<10 && i>0?1:0) + ' ' + units[i];
  }

  function applyFilter(){
    const q = (document.getElementById('search').value || '').toLowerCase();
    state.filtered = state.allFiles.filter(f => {
      const hay = (f.name + ' ' + (f.path || '') + ' ' + (f.commit && f.commit.commit && f.commit.commit.message || '')).toLowerCase();
      return hay.includes(q);
    });
    renderFiles();
  }

  function renderFiles(){
    const list = document.getElementById('fileList');
    list.innerHTML = '';
    for (const item of state.filtered) {
      const a = document.createElement('a');
      a.className = 'list-item';
      a.href = `file.html?path=${encodeURIComponent(item.path)}`;
      const commitMsg = item.commit ? (item.commit.commit.message.split('\n')[0]) : '';
      const commitDate = item.commit ? new Date(item.commit.commit.author.date).toLocaleString() : '';
      a.innerHTML = `
        <div class="li-left">${iconFor(item.name)}</div>
        <div class="li-mid">
          <div class="item-title">${item.name}</div>
          <div class="item-sub">${item.path}</div>
        </div>
        <div class="li-right">
          <div class="meta">${humanSize(item.size)}</div>
          <div class="meta">${commitDate}</div>
          <div class="meta commit-msg">${commitMsg}</div>
        </div>
      `;
      list.appendChild(a);
    }
    if (!state.filtered.length) {
      const e = document.createElement('div');
      e.className = 'muted';
      e.textContent = 'No files found (or all filtered out).';
      list.appendChild(e);
    }
  }

  return { init, loadFiles, applyFilter };
})();
