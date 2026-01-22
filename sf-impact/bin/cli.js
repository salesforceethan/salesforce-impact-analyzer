#!/usr/bin/env node
/* eslint-disable no-console */
const { Command } = require("commander");
const path = require("path");

const { analyze } = require("../src/analyzer");

const program = new Command();


program
  .name("sf-impact")
  .description("Salesforce metadata impact analyzer")
  .version("0.1.0");

program
  .command("analyze")
.argument(
  "<target>",
  "Target(s) to search. Pass one or comma-separated (e.g. 'OwnerId' or 'OwnerId,User.Title')")
  .option("-p, --project <path>", "Path to Salesforce project root (where force-app lives)", process.cwd())
  .option("-t, --targets <path>", "Path to targets.json (pattern expansions)", "")
  .option("-s, --scope <scope>", "Scan scope: all|changed", "all")
  .option("-f, --format <format>", "Output format: table|json|csv", "table")
  .option("-o, --out <path>", "Write output to file (json/csv). If omitted, prints to console", "")
  .option("--include <list>", "Comma-separated: apex,flows,lwc,objects,reports,dashboards,workflows,permissionsets", "")
  .option("--ignore <pattern>", "Ignore files containing this substring (repeatable)", collect, [])
  .option("--case-sensitive", "Case sensitive matching", false)
  .action(async (target, opts) => {
    try {
      const projectRoot = path.resolve(opts.project);

      const result = await analyze({
        target,
        projectRoot,
        targetsPath: opts.targets ? path.resolve(opts.targets) : "",
        scope: opts.scope,
        format: opts.format,
        outPath: opts.out ? path.resolve(opts.out) : "",
        include: opts.include ? opts.include.split(",").map((s) => s.trim()).filter(Boolean) : [],
        ignore: opts.ignore || [],
        caseSensitive: !!opts.caseSensitive,
      });

      // If analyze() already wrote output, just print a summary.
      if (result && result.summaryText) {
        console.log(result.summaryText);
      }
    } catch (err) {
      console.error("\n❌ sf-impact failed:\n");
      console.error(err?.message || err);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);

function collect(value, previous) {
  previous.push(value);
  return previous;
}
