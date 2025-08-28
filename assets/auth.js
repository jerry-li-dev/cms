document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const user = CONFIG.users.find(u => u.username === username && u.password === password);
    if(user) {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "app.html";
    } else {
      document.getElementById("loginError").textContent = "Invalid credentials.";
    }
  });
});
