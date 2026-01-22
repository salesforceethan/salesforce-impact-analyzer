const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");

const { loadTargets } = require("./targets");
const { toTable, toJson, toCsv } = require("./output");
const { getChangedFiles } = require("./git");

const DEFAULT_GLOBS = [
  "force-app/main/default/classes/**/*.cls",
  "force-app/main/default/triggers/**/*.trigger",
  "force-app/main/default/flows/**/*.flow-meta.xml",
  "force-app/main/default/lwc/**/*.{js,ts,html,css,xml}",
  "force-app/main/default/objects/**/*.object-meta.xml",
  "force-app/main/default/reports/**/*.report-meta.xml",
  "force-app/main/default/dashboards/**/*.dashboard-meta.xml",
  "force-app/main/default/workflows/**/*.workflow-meta.xml",
  "force-app/main/default/objects/**/validationRules/*.validationRule-meta.xml",
  "force-app/main/default/objects/**/sharingRules/*.sharingRules-meta.xml",

  "force-app/main/default/permissionsets/**/*.permissionset-meta.xml"
];

async function analyze(opts) {
  const {
    target,
    projectRoot,
    targetsPath,
    scope,
    format,
    outPath,
    include,
    ignore,
    caseSensitive
  } = opts;

  assertProjectRoot(projectRoot);

  const targets = parseTargets(target);
  const { patternsByTarget, allPatterns, patternToTargets } = buildPatternPlan(
    targets,
    projectRoot,
    targetsPath
  );

  const globs = filterGlobs(DEFAULT_GLOBS, include);

  let files = await fg(globs, { cwd: projectRoot, absolute: true });

  if (scope === "changed") {
    const changed = await getChangedFiles(projectRoot);
    const changedSet = new Set(changed.map((f) => path.resolve(projectRoot, f)));
    files = files.filter((f) => changedSet.has(f));
  }

  const ignoreList = Array.isArray(ignore) ? ignore : [];
  files = files.filter((f) => !ignoreList.some((i) => f.includes(i)));

  const results = scanFiles(files, allPatterns, patternToTargets, caseSensitive, projectRoot);

  const perTargetStats = computePerTargetStats(results, targets);

  const payload = {
    targets,
    patternsByTarget,
    patterns: allPatterns,
    perTargetStats,
    stats: {
      filesScanned: files.length,
      filesMatched: results.length,
      totalMatches: results.reduce((a, b) => a + b.matchCount, 0)
    },
    results
  };

  let output = "";
  if (format === "json") output = toJson(payload);
  else if (format === "csv") output = toCsv(payload);
  else output = toTable(payload);

  if (outPath) {
    fs.writeFileSync(outPath, output, "utf8");
    return { summaryText: summary(payload, `Saved to ${outPath}`) };
  }

  console.log(output);
  console.log(summary(payload));
  return { summaryText: "" };
}

function parseTargets(input) {
  return String(input || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildPatternPlan(targets, projectRoot, targetsPath) {
  const fallback1 = path.join(projectRoot, "tools", "targets.json");
  const fallback2 = path.join(projectRoot, "sf-impact.targets.json");

  const resolvedPath =
    targetsPath ||
    (fs.existsSync(fallback1) ? fallback1 : fs.existsSync(fallback2) ? fallback2 : "");

  const map = loadTargets(resolvedPath);

  const patternsByTarget = {};
  const all = [];
  const patternToTargets = new Map(); // pattern -> Set(targets)

  for (const t of targets) {
    const patterns = Array.isArray(map[t]) ? map[t] : [t];
    patternsByTarget[t] = patterns;

    for (const p of patterns) {
      all.push(p);
      if (!patternToTargets.has(p)) patternToTargets.set(p, new Set());
      patternToTargets.get(p).add(t);
    }
  }

  // Deduplicate patterns but keep stable ordering
  const seen = new Set();
  const allPatterns = [];
  for (const p of all) {
    if (!seen.has(p)) {
      seen.add(p);
      allPatterns.push(p);
    }
  }

  return { patternsByTarget, allPatterns, patternToTargets };
}

function scanFiles(files, patterns, patternToTargets, caseSensitive, projectRoot) {
  const results = [];

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);
    const matches = [];

    for (let i = 0; i < lines.length; i++) {
      const hay = caseSensitive ? lines[i] : lines[i].toLowerCase();

      for (const p of patterns) {
        const needle = caseSensitive ? p : p.toLowerCase();

        if (hay.includes(needle)) {
          const targetsForPattern = patternToTargets.get(p)
            ? Array.from(patternToTargets.get(p))
            : [];

          matches.push({
            pattern: p,
            targets: targetsForPattern,
            line: i + 1,
            snippet: lines[i].trim().slice(0, 200)
          });
        }
      }
    }

    if (matches.length) {
      results.push({
        file: path.relative(projectRoot, file),
        matchCount: matches.length,
        matches
      });
    }
  }

  results.sort((a, b) => b.matchCount - a.matchCount);
  return results;
}

function computePerTargetStats(results, targets) {
  const stats = {};
  for (const t of targets) {
    stats[t] = {
      filesMatched: 0,
      totalMatches: 0
    };
  }

  for (const fileResult of results) {
    const fileHitTargets = new Set();

    for (const m of fileResult.matches) {
      for (const t of m.targets || []) {
        if (stats[t]) {
          stats[t].totalMatches += 1;
          fileHitTargets.add(t);
        }
      }
    }

    for (const t of fileHitTargets) {
      stats[t].filesMatched += 1;
    }
  }

  return stats;
}

function filterGlobs(globs, include) {
  if (!include || include.length === 0) return globs;

  const mapping = {
    apex: "classes",
    triggers: "triggers",
    flows: "flows",
    lwc: "lwc",
    objects: "objects",
    reports: "reports",
    dashboards: "dashboards",
    workflows: "workflows",
    permissionsets: "permissionsets"
  };

  const allowed = new Set(include.map((i) => i.toLowerCase()));

  return globs.filter((g) => {
    for (const [key, folder] of Object.entries(mapping)) {
      if (allowed.has(key) && g.includes(`/${folder}/`)) return true;
    }
    return false;
  });
}

function summary(payload, extra = "") {
  const s = payload.stats;
  const line1 = `Targets: ${payload.targets.join(", ")}`;
  const line2 = `Files scanned: ${s.filesScanned} | Files matched: ${s.filesMatched} | Total matches: ${s.totalMatches}`;
  return extra ? `${line1}\n${line2}\n${extra}\n` : `${line1}\n${line2}\n`;
}

function assertProjectRoot(projectRoot) {
  const sfdx = path.join(projectRoot, "sfdx-project.json");
  const forceApp = path.join(projectRoot, "force-app");

  if (!fs.existsSync(sfdx) || !fs.existsSync(forceApp)) {
    throw new Error(
      `Not a Salesforce project root: ${projectRoot}\nExpected force-app/ and sfdx-project.json`
    );
  }
}

module.exports = { analyze };
