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
- Metadata retrieved locally in: force-app/main/default
  

---

## Installation

git clone https://github.com/salesforceethan/salesforce-impact-analyzer.git
cd salesforce-impact-analyzer/sf-impact
npm install

## Salesforce Setup & Usage

This tool scans your local Salesforce metadata (SFDX project) to find where fields are referenced.

1. Retrieve Metadata from Salesforce
From your SFDX project root, retrieve metadata so it exists locally: sfdx force:source:retrieve -m CustomObject,ApexClass,ApexTrigger,Flow,ValidationRule,SharingRules,PermissionSet
(You can also retrieve metadata using the VS Code Org Browser.)

2. Confirm files exist in: force-app/main/default

3. Run the Analyzer
   
From the sf-impact folder

Single field: 
-node ./bin/cli.js analyze "OwnerId" --project ..

Multiple fields:
-node ./bin/cli.js analyze "OwnerId,User.Title,FirstName" --project ..

## Example Output
Targets: OwnerId, User.Title

Per-target summary:
- OwnerId: files matched 1, total matches 1
- User.Title: files matched 1, total matches 1

Top hits:
- force-app/main/default/triggers/ClosedOpportunityTrigger.trigger [OwnerId]
- force-app/main/default/permissionsets/Sales_Representative.permissionset-meta.xml [User.Title]

Files scanned: 25 | Files matched: 2 | Total matches: 2

## Notes

Search by field name, not object.field (except for special cases like User.Title)
Results depend on what metadata you retrieve locally
No Salesforce API calls are made
Large projects may take a few seconds to scan


