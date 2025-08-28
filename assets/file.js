// Renders file landing page and preview (basic inline for images, pdfs, text)
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
    const meta = await res.json(); // contains download_url, size, name, path
    // get latest commit too
    const commitRes = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/commits?path=${encodeURIComponent(path)}&per_page=1&sha=${encodeURIComponent(cfg.branch)}`);
    let commitJson = null;
    if (commitRes.ok) commitJson = (await commitRes.json())[0];

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

    const commitMsg = commitJson ? commitJson.commit.message.split('\\n')[0] : 'N/A';
    const commitDate = commitJson ? new Date(commitJson.commit.author.date).toLocaleString() : 'N/A';

    document.getElementById('view').innerHTML = `
      <div style="padding:16px">
        <h2>${name}</h2>
        <div class="kv"><div class="k">Path</div><div class="v">${meta.path}</div></div>
        <div class="kv"><div class="k">Size</div><div class="v">${(size/1024).toFixed(1)} KB</div></div>
        <div class="kv"><div class="k">Latest Commit</div><div class="v">${commitJson ? commitJson.sha.substring(0,7) : 'N/A'} — ${commitMsg}</div></div>
        <div style="margin:10px 0;"><a class="btn" href="${raw}" download>Download</a> <a class="btn secondary" href="${raw}" target="_blank">Open Raw</a> <a class="btn secondary" href="https://github.com/${cfg.owner}/${cfg.repo}/blob/${cfg.branch}/${encodeURIComponent(meta.path)}" target="_blank">View on GitHub</a></div>
        <div class="preview">${preview}</div>
      </div>
    `;
  } catch (e) {
    document.getElementById('view').innerHTML = `<div class="error">Error: ${e.message}</div>`;
  }
});
