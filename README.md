# Salesforce Impact Analyzer (CLI)

A lightweight CLI tool to analyze Salesforce metadata dependencies and field usage across your org.

Quickly find where a field is referenced in Apex, Flows, Permission Sets, Validation Rules, Sharing Rules, reports, and more — all locally from your SFDX project.

Built for Salesforce Admins and Developers who want fast impact analysis before making changes.

---

## Features

- Search by field name (example: `OwnerId`, `FirstName`, `User.Title`)
- Supports multiple targets in one command
- Scans local Salesforce metadata (no API calls)
- Shows per-field summary and top matching files
- Pattern expansion for Flow, Apex, and metadata formats
- Fast and dependency-free scanning

---

## Requirements

- Node.js 18+
- Salesforce project using SFDX format
- Metadata retrieved locally in `force-app/main/default`

---

## Installation

```bash
git clone https://github.com/salesforceethan/salesforce-impact-analyzer.git
cd salesforce-impact-analyzer/sf-impact
npm install


## Salesforce Setup

Make sure your metadata exists locally:

```bash
sfdx force:source:retrieve -m CustomObject,ApexClass,ApexTrigger,Flow,ValidationRule,SharingRules,PermissionSet
Or retrieve using VS Code Org Browser.

Usage

From the sf-impact folder:

Single field
node ./bin/cli.js analyze "OwnerId" --project ..

Multiple fields
node ./bin/cli.js analyze "OwnerId,User.Title,FirstName" --project ..


Example Output
Targets: OwnerId, User.Title

Per-target summary:
- OwnerId: files matched 1, total matches 1
- User.Title: files matched 1, total matches 1

Top hits:
- force-app/main/default/triggers/ClosedOpportunityTrigger.trigger
- force-app/main/default/permissionsets/Sales_Representative.permissionset-meta.xml

How It Works

The tool scans your local Salesforce metadata files, expands known reference patterns (Flow XML, Apex getters, metadata formats), and reports where each field appears — grouped by file and target.

Pattern mappings can be customized in:

sf-impact/src/targets.js
