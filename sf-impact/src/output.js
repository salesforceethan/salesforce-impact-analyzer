function toJson(payload) {
  return JSON.stringify(payload, null, 2);
}

function toCsv(payload) {
  // One row per match line
  const rows = [["file", "matchCount", "line", "pattern", "targets", "snippet"]];

  for (const r of payload.results || []) {
    for (const m of r.matches || []) {
      rows.push([
        r.file || "",
        String(r.matchCount ?? ""),
        String(m.line ?? ""),
        escapeCsv(m.pattern ?? ""),
        escapeCsv((m.targets || []).join("|")),
        escapeCsv(m.snippet ?? "")
      ]);
    }
  }

  return rows.map((r) => r.join(",")).join("\n");
}

function toTable(payload) {
  const lines = [];
  lines.push(`Targets: ${(payload.targets || []).join(", ")}`);
  lines.push("");

  // Per-target quick stats
  if (payload.perTargetStats) {
    lines.push("Per-target summary:");
    for (const t of payload.targets || []) {
      const s = payload.perTargetStats[t];
      if (!s) continue;
      lines.push(`  - ${t}: files matched ${s.filesMatched}, total matches ${s.totalMatches}`);
    }
    lines.push("");
  }

  lines.push("Top hits:");
  const top = (payload.results || []).slice(0, 20);

  if (top.length === 0) {
    lines.push("(none)");
  } else {
    for (const r of top) {
      // show which targets hit inside this file (union)
      const fileTargets = new Set();
      for (const m of r.matches || []) {
        for (const t of m.targets || []) fileTargets.add(t);
      }
      const tag = fileTargets.size ? ` [${Array.from(fileTargets).join(", ")}]` : "";
      lines.push(`- ${r.matchCount}  ${r.file}${tag}`);
    }
  }

  return lines.join("\n");
}

function escapeCsv(value) {
  const s = String(value ?? "");
  const escaped = s.replace(/"/g, '""');
  return `"${escaped}"`;
}

module.exports = { toTable, toJson, toCsv };
