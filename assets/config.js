// === Replace placeholders inside curly braces before use ===
window.APP_CONFIG = {
  owner: "{YOUR_GITHUB_USERNAME}",
  repo: "{YOUR_REPO_NAME}",
  branch: "{YOUR_BRANCH_NAME}",    // usually "main" or "master"
  folders: ["", "assets", "docs"], // "" = root; add or remove folder strings as needed
  extensions: ["pdf","jpg","png","txt","json","md"], // leave empty [] to allow all
  siteTitle: "Fake CMS (Public Repo Demo)",
  users: [
    { username: "admin", password: "admin123", displayName: "Admin User" },
    { username: "demo",  password: "demo",     displayName: "Demo User" }
  ]
};
