async function fakeLogin(username, password) {
  const validUser = window.CONFIG.users.find(
    u => u.username === username && u.password === password
  );
  return !!validUser;
}

document.getElementById("login-form")?.addEventListener("submit", async e => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (await fakeLogin(username, password)) {
    sessionStorage.setItem("loggedIn", "true");
    window.location.href = "app.html";
  } else {
    alert("Invalid username or password");
  }
});

async function fetchFileList() {
  const owner = "octocat"; // Replace with your repo
  const repo = "Hello-World";
  const branch = "main";
  const url = `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`;
  const res = await fetch(url);
  return await res.json();
}

function renderFileList(files) {
  const container = document.getElementById("file-list");
  container.innerHTML = "";
  files.forEach(file => {
    const item = document.createElement("div");
    item.className = "file-item";
    item.innerHTML = `<a href="file.html?url=${encodeURIComponent(file.download_url)}">${file.name}</a>`;
    container.appendChild(item);
  });
}

async function initFileList() {
  if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
    return;
  }
  let files = await fetchFileList();
  renderFileList(files);
}
if (document.getElementById("file-list")) initFileList();