// Fake client-side auth (localStorage). NOT SECURE — demo only.
(function(){
  const KEY = "fakecms_session_v1";

  function login(username, password) {
    const cfg = window.APP_CONFIG || {};
    const match = (cfg.users || []).find(u => u.username === username && u.password === password);
    if (!match) return null;
    const token = btoa(`${username}:${Date.now()}`);
    const session = { username: match.username, displayName: match.displayName, token, ts: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(session));
    return session;
  }

  function logout() {
    localStorage.removeItem(KEY);
    location.href = "index.html";
  }

  function currentUser() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch(e){ return null; }
  }

  function requireAuth() {
    if (!currentUser()) {
      const redirect = encodeURIComponent(location.pathname + location.search + location.hash);
      location.replace('index.html?redirect=' + redirect);
    }
  }

  window.Auth = { login, logout, currentUser, requireAuth };
})();
