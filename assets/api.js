// Minimal GitHub API helpers (public repo; no auth).
(function(){
  const BASE = 'https://api.github.com';

  async function listFolderContents(owner, repo, branch, path) {
    // Use contents API for specific folder listing (preserves file metadata)
    const target = (path === "" || path === "/") ? "" : encodeURIComponent(path);
    const url = `${BASE}/repos/${owner}/${repo}/contents/${target}` + (branch ? `?ref=${encodeURIComponent(branch)}` : '');
    const res = await fetch(url, { headers: { 'Accept':'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);
    return res.json(); // array or file object
  }

  async function getLatestCommit(owner, repo, branch, filepath) {
    const url = `${BASE}/repos/${owner}/${repo}/commits?path=${encodeURIComponent(filepath)}&per_page=1` + (branch ? `&sha=${encodeURIComponent(branch)}` : '');
    const res = await fetch(url, { headers: { 'Accept':'application/vnd.github+json' } });
    if (!res.ok) return null;
    const j = await res.json();
    return (Array.isArray(j) && j[0]) ? j[0] : null;
  }

  window.GH = { listFolderContents, getLatestCommit };
})();
