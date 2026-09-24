---
id: "gic-20260330-551"
lang: "en"
translationOf: null
title: "A risk map from the incidents CERT-In actually counts"
description: "Scenarios weighted by CERT-In's 2023 table, plus the separate ledgers for critical infrastructure and financial fraud."
slug: "cybersecurity-resilience-risk-and-scenario-map-dot-gov-20260330-551"
publishDate: "2026-03-30"
updatedDate: "2026-09-24"
tags:
  - "cybersecurity-resilience"
  - "risk-and-scenario-map"
  - "india-briefs"
  - "diverse-sources"
sourceLinks:
  - "https://www.cert-in.org.in/Downloader?fileName=ANUAL-2024-0001.pdf&pageid=22&type=2"
  - "https://nciipc.gov.in/"
  - "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2244504"
summaryType: "india-brief"
draft: false
---

# A risk map from the incidents CERT-In actually counts

A scenario map should start from the counts an agency published, and it should say when a serious scenario has no count. CERT-In's Annual Report 2023 is the last full-year breakup this brief relies on. Later Lok Sabha figures give only annual totals, not the mix.

## The weight in the 2023 table

Of 15,92,917 incidents handled in 2023:

- Vulnerable services: 9,41,592. The modal scenario is an exposed service, not a novel attack. The matching controls in CERT-In's later MSME baseline are asset inventory, patching, secure configuration, and a vulnerability assessment at least yearly.
- Unauthorized scanning or probing: 4,47,720. This is reconnaissance at scale. Logging and monitoring exist in the baseline so that probing is visible. The count alone does not say how many scans were followed by an intrusion.
- Virus or malicious code: 1,84,131. Cyber Swachhta Kendra is the public response described in the report: detection of compromised devices, notification through ISPs, and free removal tools. Endpoint protection and CSK onboarding are the baseline's answer.
- Website defacements: 10,665, of which the report's figure breaks down as 8,724 on .com, 1,862 on .in, 48 on .net, 11 on .org and 20 others. Defacement is tracked as its own series, with hardening advice sent to the organisations concerned.
- Website intrusion and malware propagation: 1,045.
- Phishing: 869 in this table.
- Others: 6,895.

The narrative names ransomware, distributed denial of service and data breach as types handled in 2023. The count table does not give them separate rows. A scenario workshop can include them as recognised types. It cannot weight them with a 2023 CERT-In number from this report.

The same year CERT-In issued 657 security alerts, 52 advisories and 397 vulnerability notes, and shared 634 threat-intelligence alerts. Those are the early-warning outputs sitting beside the incident table.

## A low-frequency scenario with a different legal test

NCIIPC's mandate is critical information infrastructure: a computer resource whose incapacitation or destruction would have a debilitating impact on national security, economy, public health or safety. Its site organises work by banking and financial services, power and energy, government, telecom, health, transport, and strategic and public enterprises. Guidelines version 2.0, released 16 January 2015, cover identification, protection, and controls from planning through disaster recovery.

This scenario is not "the largest row in the CERT-In table." A vulnerable service on an ordinary website and a failure of a notified protected system are different events, owed to different bodies. Section 70 notification is what makes a system a protected system. Sector membership alone, as NCIIPC's identification guidance frames the task, is the start of an identification process, not the notification.

## Financial fraud is a third ledger

The Home Ministry's Indian Cyber Crime Coordination Centre runs the National Cyber Crime Reporting Portal and the 1930 helpline, and the Citizen Financial Cyber Fraud Reporting and Management System launched in 2021. Up to 31 January 2026 that system had saved more than ₹8,690 crore across more than 24.65 lakh complaints. A Suspect Registry launched on 10 September 2024 had, by the same cutoff, taken more than 23.05 lakh suspect identifiers from banks and shared 27.37 lakh layer-1 mule accounts, with declined transactions worth ₹9,518.91 crore.

Those numbers are not CERT-In incident counts. A fraud that moves money through mule accounts can also be a phishing incident or a personal-data breach. The scenario map should keep three paths: technical incident to CERT-In, crime complaint to the state police through the portal, and, when the data-protection rules have commenced, intimation to the person and the Data Protection Board.

NCRB's Crime in India figures, as quoted in the 24 March 2026 reply, are a fourth series again: 86,420 cyber-crime cases registered in 2023, against 1,104 persons convicted that year. The reply does not present the conviction column as a disposal rate of the same year's cases.

Build exercises for exposed services, malicious code, and website integrity because those are counted. Build a separate exercise for a protected system and for a payment fraud, and do not pretend the 2023 table sized them.
