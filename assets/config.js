window.APP_CONFIG = {
  owner: "{YOUR_GITHUB_USERNAME}",
  repo: "{YOUR_REPO_NAME}",
  branch: "{YOUR_BRANCH_NAME}",
  folders: [""],
  extensions: ["pdf","txt","md","png","jpg"],
  users: [
    { username: "alice", password: "alice123", displayName: "Alice" },
    { username: "bob", password: "bob123", displayName: "Bob" },
    { username: "charlie", password: "charlie123", displayName: "Charlie" }
  ],
  fileMap: {
    "file1.pdf": "docs/subfolder/file1.pdf",
    "image.png": "images/image.png",
    "readme.md": "readme.md"
  }
};