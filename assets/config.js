// === Replace placeholders inside curly braces before use ===
window.APP_CONFIG = {
  owner: "jerry-li-dev",
  repo: "cms",
  branch: "main",    // usually "main" or "master"
  folders: [""],
  extensions: ["pdf","txt","md","png","jpg"],
  users: [
      { username: "alice", password: "alice123", displayName: "Alice" },
      { username: "bob", password: "bob123", displayName: "Bob" },
      { username: "charlie", password: "charlie123", displayName: "Charlie" }
    ],
    fileMap: {} // dynamically populated at runtime
  };
