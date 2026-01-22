const { execSync } = require("child_process");

async function getChangedFiles(projectRoot) {
  try {
    const out = execSync("git diff --name-only", { cwd: projectRoot, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    if (!out) return [];
    return out.split(/\r?\n/).filter(Boolean);
  } catch {

    return [];
  }
}

module.exports = { getChangedFiles };
