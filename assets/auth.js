window.Auth = {
  user: null,
  currentUser: function() { const saved = sessionStorage.getItem('fakeUser'); if(saved && !this.user) this.user = JSON.parse(saved); return this.user; },
  login: function() {
    const u=document.getElementById('username').value.trim();
    const p=document.getElementById('password').value.trim();
    const users=window.APP_CONFIG.users||[];
    const match=users.find(user=>user.username===u && user.password===p);
    if(match){ this.user={username:match.username,displayName:match.displayName}; sessionStorage.setItem('fakeUser',JSON.stringify(this.user)); document.getElementById('loginContainer').style.display='none'; document.getElementById('dashboard').style.display='block'; App.init(); } 
    else { alert("Invalid username or password."); }
  },
  logout: function() { this.user=null; sessionStorage.removeItem('fakeUser'); document.getElementById('dashboard').style.display='none'; document.getElementById('loginContainer').style.display='block'; },
  checkLogin: function() { if(this.currentUser()) { document.getElementById('loginContainer').style.display='none'; document.getElementById('dashboard').style.display='block'; App.init(); } else { document.getElementById('loginContainer').style.display='block'; document.getElementById('dashboard').style.display='none'; } }
};