async function initFilePreview() {
  if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const url = params.get("url");
  if (!url) return;
  const preview = document.getElementById("file-preview");
  const download = document.getElementById("download-link");
  download.href = url;
  if (url.match(/\.(png|jpg|jpeg|gif)$/i)) {
    preview.innerHTML = `<img src="${url}" />`;
  } else if (url.match(/\.pdf$/i)) {
    preview.innerHTML = `<embed src="${url}" type="application/pdf" width="100%" height="600px" />`;
  } else {
    const text = await fetch(url).then(r => r.text());
    preview.innerHTML = `<pre>${text.replace(/</g,"&lt;")}</pre>`;
  }
}
if (document.getElementById("file-preview")) initFilePreview();