const fs = require("fs");

function loadTargets(filePath) {
  if (!filePath) return {};
  if (!fs.existsSync(filePath)) return {};

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    
    return {};
  }
}

module.exports = { loadTargets };
