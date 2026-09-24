---
id: "gic-20260330-710"
lang: "en"
translationOf: null
title: "What founders already owe on payments data, before the DPDP duties begin"
description: "Payment-system storage, CERT-In's six-hour report, and the MeitY labelling advisory are current. Most DPDP fiduciary duties wait until 13 May 2027."
slug: "ai-and-data-governance-for-founders-and-operators-meity-gov-20260330-710"
publishDate: "2026-03-30"
updatedDate: "2026-09-24"
tags:
  - "ai-and-data-governance"
  - "for-founders-and-operators"
  - "india-briefs"
  - "diverse-sources"
sourceLinks:
  - "https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf"
  - "https://www.meity.gov.in/static/uploads/2024/02/9f6e99572739a3024c9cdaec53a0a0ef.pdf"
  - "https://rbi.org.in/scripts/FS_Notification.aspx?Id=11244&Mode=0&fn=9"
  - "https://www.rbi.org.in/Scripts/FAQDisplay.aspx?Id=130"
  - "https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf"
summaryType: "india-brief"
draft: false
---

Operators do not need a single "AI law." They need to know which hat the company is wearing. Four hats are already in the Indian instruments. A fifth, the general Data Fiduciary, is written and not yet in force.

## If you run a payment system

The Reserve Bank's circular of 6 April 2018 requires the entire data of the payment systems you operate to be stored only in India. End-to-end transaction details are included. The foreign leg may also be stored abroad if required. The FAQ allows processing abroad, then requires the data to be deleted abroad and brought back not later than one business day or 24 hours, whichever is earlier. This applies to system providers. It does not apply to every app that mentions a wallet. If you are the provider, the storage design is a present obligation. The DPDP Act will not repeal it: section 16(2) keeps a stricter Indian transfer law in place, once section 16 itself is in force on 13 May 2027.

## If you are a service provider, intermediary, data centre, or body corporate

CERT-In's directions of 28 April 2022 already apply. Report the Annexure I incidents within six hours. The list includes data breach, data leak, incidents on digital payments, and incidents affecting AI and machine-learning systems. Keep ICT logs for a rolling 180 days inside India. Name a point of contact. Synchronise clocks to NIC or NPL, or to a source that does not deviate from them. Data centres, VPS, cloud, and VPN providers have a separate five-year subscriber-information duty. The directions took effect 60 days after 28 April 2022, with a 27 June 2022 extension for MSMEs and for part of the subscriber-validation mechanism. Read that extension before you assume your class had no extra time. The penalty talk in these directions is section 70B of the IT Act, not the DPDP Schedule.

## If you are an intermediary putting a model in front of users

MeitY's advisory that supersedes the 1 March 2024 note says use of an AI model or generative system on your computer resource should not permit content that rule 3(1)(b) of the IT Rules, 2021 forbids. Under-tested or unreliable models should reach users in India only after you label the possible fallibility of the output. A consent popup, or something equivalent, may be used. The advisory is in addition to the 26 December 2023 advisory. It is aimed at intermediaries and platforms. It is not a startup licence, and it is not a requirement, in the revised text, to seek prior government permission.

If you are regulated by SEBI and you offer an AI or machine-learning system to investors, the 2019 reporting circulars for brokers, market infrastructure institutions, and mutual funds are already on the books. They are summarised in the [regulatory note](/blog/ai-and-data-governance-regulatory-outlook-meity-gov-20260330-430). A November 2024 proposal to make you solely responsible for third-party AI output is, in SEBI's own December 2024 memorandum, still a proposal awaiting notification. Do not build the control deck as if that amendment has been notified, and do not ignore it if a later circular has appeared since this reading.

## If you will be a Data Fiduciary

You probably will be, if you decide why and how personal data is processed. That definition is already in force, in section 2. The duties that attach to it are not. Notice, consent, security safeguards, breach intimation, children's verifiable consent, erasure, and the Schedule wait until 13 May 2027. You can draft the notice now. Rule 3 says it must stand on its own, itemise the personal data, state the purpose, and tell the person how to withdraw consent as easily as she gave it, how to use her rights, and how to complain to the Board. Doing that in a product in 2026 is preparation. It is not yet the rule's commencement.

You are not a Significant Data Fiduciary because you are large. The Central Government notifies that class under section 10, which is on the same May 2027 date. The Data Protection Officer based in India is a duty of that notified class, not of every startup.

If you want to be a Consent Manager, the company must be incorporated in India, with net worth not less than ₹2 crore, and registration under Rule 4 starts on 13 November 2026. See the [ninety-day checklist](/blog/ai-and-data-governance-next-90-days-checklist-meity-gov-20260330-470).

## What to ignore while you do this

Ignore a template that says "track state-level adoption" without a State table. MeitY has not published one. Ignore a ₹250 crore figure as a fine due this quarter. Ignore a private market-size slide as if PIB had printed it. The public capacity you can actually buy, if you qualify, is the compute portal, covered in the [opportunity note](/blog/ai-and-data-governance-opportunity-landscape-meity-gov-20260330-630).

Great Indian Company builds applied AI and publishes these notes so an operator can see the live duty first. The library is at [greatindiancompany.com/blog](https://greatindiancompany.com/blog).

## Documents

- Payment-data circular and FAQ: [RBI circular](https://rbi.org.in/scripts/FS_Notification.aspx?Id=11244&Mode=0&fn=9), [FAQ](https://www.rbi.org.in/Scripts/FAQDisplay.aspx?Id=130)
- Incident directions: [CERT-In](https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf)
- Labelling advisory: [MeitY PDF](https://www.meity.gov.in/static/uploads/2024/02/9f6e99572739a3024c9cdaec53a0a0ef.pdf)
- Duties and their date: [Act](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf), [G.S.R. 843(E)](https://egazette.gov.in/WriteReadData/2025/267647.pdf)
