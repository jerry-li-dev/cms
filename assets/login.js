document.getElementById("loginBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("loginError");

  const user = window.APP_CONFIG.users.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "app.html";
  } else {
    errorEl.textContent = "Invalid credentials.";
  }
});
