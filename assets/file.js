document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const path = params.get('path');
  if (!path) {
    document.getElementById('view').innerHTML = '<div class="error">No file specified.</div>';
    return;
  }
  const cfg = window.APP_CONFIG;
  try {
    const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(cfg.branch)}`);
    if (!res.ok) throw new Error('GitHub API error ' + res.status);
    const meta = await res.json();

    const commitRes = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/commits?path=${encodeURIComponent(path)}&per_page=1&sha=${encodeURIComponent(cfg.branch)}`);
    const commitJson = commitRes.ok ? (await commitRes.json())[0] : null;

    const name = meta.name;
    const raw = meta.download_url;
    const size = meta.size;
    const ext = (name.toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1] || '';

    let preview = '';
    if (['png','jpg','jpeg','gif','webp'].includes(ext)) {
      preview = `<img src="${raw}" alt="${name}" style="max-width:100%; border-radius:8px">`;
    } else if (ext === 'pdf') {
      preview = `<iframe src="${raw}" style="width:100%; height:70vh; border:0;"></iframe>`;
    } else if (['md','txt','json','csv'].includes(ext)) {
      preview = `<iframe src="${raw}" style="width:100%; height:60vh; border:0; background:#fff;"></iframe>`;
    } else {
      preview = `<div class="muted">No inline preview available. Use Download link.</div>`;
    }

    const commitMsg = commitJson ? commitJson.commit.message.split('\n')[0] : 'N/A';
    const commitDate = commitJson ? new Date(commitJson.commit.author.date).toLocaleString() : 'N/A';

    document.getElementById('view').innerHTML = `
      <h2>${name}</h2>
      <div class="kv"><span class="k">Size:</span><span class="v">${(size/1024).toFixed(1)} KB</span></div>
      <div class="kv"><span class="k">Latest commit:</span><span class="v">${commitMsg} (${commitDate})</span></div>
      <div class="preview">${preview}</div>
      <a href="${raw}" class="btn">Download File</a>
    `;
  } catch(e){
    document.getElementById('view').innerHTML = `<div class="error">Error loading file: ${e.message}</div>`;
  }
});
