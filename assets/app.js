document.addEventListener("DOMContentLoaded", () => {
  if(localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
    return;
  }
  const fileListDiv = document.getElementById("fileList");
  const sortSelect = document.getElementById("sortOptions");
  const { owner, name, branch, folder } = CONFIG.repo;
  const apiUrl = `https://api.github.com/repos/${owner}/${name}/contents/${folder}?ref=${branch}`;

  let files = [];
  fetch(apiUrl).then(r => r.json()).then(data => {
    files = data.filter(f => f.type === "file");
    render(files);
  });

  sortSelect.addEventListener("change", () => {
    render(files, sortSelect.value);
  });

  function render(files, sortBy="name") {
    let sorted = [...files];
    if(sortBy === "name") sorted.sort((a,b)=>a.name.localeCompare(b.name));
    else if(sortBy === "size") sorted.sort((a,b)=>(a.size||0)-(b.size||0));
    else if(sortBy === "date") sorted.sort((a,b)=>new Date(a.git_url)-new Date(b.git_url));
    else if(sortBy === "recent") sorted.reverse();
    fileListDiv.innerHTML = "";
    sorted.forEach(f => {
      const item = document.createElement("div");
      item.textContent = `${f.name} (${(f.size/1024).toFixed(1)} KB)`;
      item.classList.add("file-item");
      item.onclick = () => {
        window.location.href = `file.html?name=${encodeURIComponent(f.name)}&url=${encodeURIComponent(f.download_url)}`;
      };
      fileListDiv.appendChild(item);
    });
  }
});
