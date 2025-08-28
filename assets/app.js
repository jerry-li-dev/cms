let fileList = [];

async function fetchFiles() {
  try {
    const { repoOwner, repoName, branch, folderPath } = window.APP_CONFIG;
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}?ref=${branch}`
    );
    const data = await response.json();

    fileList = data
      .filter(item => item.type === "file")
      .map(item => ({
        name: item.name,
        path: item.path,
        size: item.size,
        date: item.sha ? item.sha.substring(0,7) : new Date().toISOString(),
        url: item.download_url || item.url
      }));
    renderFiles();
  } catch (err) {
    console.error("Error fetching files:", err);
  }
}

function renderFiles() {
  const listEl = document.getElementById("fileList");
  listEl.innerHTML = "";
  fileList.forEach(file => {
    const item = document.createElement("div");
    item.className = "file-item";
    item.textContent = `${file.name} ( ${(file.size/1024).toFixed(1)} KB )`;
    item.addEventListener("click", () => showPreview(file));
    listEl.appendChild(item);
  });
}

function showPreview(file) {
  const previewEl = document.getElementById("filePreview");
  previewEl.innerHTML = `
    <h3>${file.name}</h3>
    <p>Size: ${(file.size/1024).toFixed(1)} KB</p>
    <a href="${file.url}" download>Download</a>
    <iframe src="${file.url}" width="100%" height="400px"></iframe>
  `;
}

document.getElementById("sortSelect").addEventListener("change", (e) => {
  const val = e.target.value;
  if (val === "alpha") fileList.sort((a,b)=>a.name.localeCompare(b.name));
  if (val === "size") fileList.sort((a,b)=>a.size-b.size);
  if (val === "date") fileList.sort((a,b)=> new Date(b.date) - new Date(a.date));
  renderFiles();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
});

window.onload = fetchFiles;
