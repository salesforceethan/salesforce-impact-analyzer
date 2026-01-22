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
