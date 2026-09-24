---
id: "gic-20260330-429"
lang: "en"
translationOf: null
title: "The rules that bind India's digital rails"
description: "Account Aggregator prohibitions, the phased start of the data protection law, and the security duties already written down for health and e-governance."
slug: "digital-public-infrastructure-regulatory-outlook-dpiit-gov-20260330-429"
publishDate: "2026-03-30"
updatedDate: "2026-09-24"
tags:
  - "digital-public-infrastructure"
  - "regulatory-outlook"
  - "india-briefs"
  - "diverse-sources"
sourceLinks:
  - "https://www.meity.gov.in/"
  - "https://www.digitalindia.gov.in/"
  - "https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=12936"
  - "https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf"
  - "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2288848"
summaryType: "india-brief"
draft: false
---

# The rules that bind India's digital rails

The regulatory picture is not a single digital-economy bill. It is a set of role-based rules that already bind some rails, plus a data-protection statute that the government has switched on in slices. The outlook is the calendar of those slices, and the prohibitions that will not wait for it.

## Account Aggregators: a narrow licence with a long list of nos

On 28 November 2025 the Reserve Bank issued the Reserve Bank of India (Non-Banking Financial Companies – Account Aggregator) Directions, 2025. They came into force on the day they were placed on the Bank's website. They repealed the earlier directions on the same subject. They apply to every NBFC that does Account Aggregator business.

The business itself is defined as retrieving or collecting financial information the Reserve Bank specifies, and consolidating, organising, and presenting it to the customer or to another financial information user. The proviso is the core rule: that information is not the property of the Account Aggregator and must not be used in any other manner.

Financial information, in the directions, covers a stated list. It includes bank deposits, NBFC deposits, mutual fund units, equities, bonds, insurance policies, National Pension System balances, and GST returns in Form GSTR-1 and Form GSTR-3B, among other instruments. A financial information provider includes banks, NBFCs, asset managers, depositories, insurers, the pension recordkeeping agency, and GSTN. A financial information user must be registered with and regulated by a financial-sector regulator. The directions name the Reserve Bank, SEBI, IRDAI, the pension regulator, and the Department of Revenue for this purpose.

The operating prohibitions in the duties section are specific:

- Services only on the customer's explicit consent.
- No support for customer transactions. An aggregator is not a payment system and not a lender.
- No financial information accessed from providers may reside with the aggregator.
- No third-party service provider may be used to undertake the aggregation business.
- The aggregator must not access the customer's authentication credentials at the providers.
- No information acquired from or on behalf of a customer may be parted with without explicit consent.
- If the aggregator's statement and the provider's books disagree, the provider's records govern.

Consent has to be a standardised artefact. The directions require it to identify the customer, the nature of the information, the purpose, the recipients, a place to send notice when the artefact is used, the creation and expiry dates, and the aggregator's identity and signature. An electronic artefact is allowed.

Registration is a company-only gate. Net owned funds must be at least ₹2 crore unless the Reserve Bank sets a higher bar. The leverage ratio must not exceed seven. The aggregator remains in the base layer of the scale-based NBFC structure even where some governance paragraphs of the wider NBFC directions are applied to it. In-principle approval lasts twelve months, which is the window in which the technology platform and the legal documents have to be ready.

Pricing is not fixed by the directions. The board must approve a pricing policy. That is permission to charge, inside a business that may not do anything else and may not warehouse the data.

Entities regulated by another financial-sector regulator, if they aggregate only accounts in their own sector, are excluded from the Reserve Bank registration requirement. That carve-out is easy to miss and easy to over-read. It does not let an unregulated firm collect bank statements.

## Data protection: the Board exists, most duties are dated later

The Digital Personal Data Protection Act, 2023 (22 of 2023) is not a single commencement date. Ministry of Electronics and Information Technology notification G.S.R. 843(E), dated 13 November 2025, appoints three moments:

- From the date of publication in the gazette: section 1(2), section 2, sections 18 to 26, sections 35 and 38 to 43, and section 44(1) and 44(3).
- One year from that publication: section 6(9) and section 27(1)(d).
- Eighteen months from that publication: sections 3 to 5, subsections (1) to (8) and (10) of section 6, sections 7 to 17, section 27 except clause (d) of subsection (1), sections 28 to 34, sections 36 and 37, and section 44(2).

A companion notification, G.S.R. 844(E), also dated 13 November 2025, establishes the Data Protection Board of India with effect from publication, with its head office in the National Capital Region. The Digital Personal Data Protection Rules, 2025 were published on 14 November 2025, with a corrigendum dated 16 December 2025, on MeitY's site.

From the gazette date, one year falls in November 2026 and eighteen months falls in May 2027. This brief does not paraphrase what section 6(9) or section 27(1)(d) require. Those clauses should be read in the Act. The structural point is enough for an outlook: institutional machinery, including the Board, was started in November 2025, while the bulk of the duties in sections 3 to 17 were appointed for eighteen months later.

Anyone building on Aadhaar authentication, DigiLocker sharing, or Account Aggregator pulls should keep two regimes in view. The Account Aggregator consent rules are already in force under the Reserve Bank directions. The wider personal-data duties in the 2023 Act follow the gazette calendar, not the Reserve Bank's calendar.

## Health: consent and a ban on a central store

The health ministry's Lok Sabha reply of 24 July 2026 states the Ayushman Bharat Digital Mission's privacy position in operational language. Privacy by design is a guiding principle. There is no centralised repository of health data. Exchange is between the intended parties after the patient's consent. Before a digital health application integrates, it is validated in a sandbox and undergoes a web application security audit.

Interoperability, in that reply, comes from common health-data standards and from registries of people, facilities, and professionals, not from pooling clinical records in one government database. The reply names public systems already integrated, including PM-JAY, Nikshay, and named state platforms. As of 20 July 2026 it reported 94.87 crore ABHA IDs, 5.36 lakh facilities, and 10.09 lakh professionals. Those stocks show reach. The legal design is the absence of a central clinical store, plus the audit before joining.

A third-party evaluation conducted between June and August 2025 is summarised in the reply without quantified findings. The outlook should not treat "reduced waiting times" as a regulatory standard. It is an evaluative sentence. The standards a builder can actually follow are consent, the sandbox, and the security audit.

## E-governance security, as MeitY listed it

The 29 July 2026 Lok Sabha reply on UMANG, DigiLocker, and related platforms lists controls the ministry says are already in use: hosting in government data centres, SSL, authentication by Aadhaar, OTP, biometrics, or time-based OTP, Parichay access control, encryption of sensitive data, secured APIs, periodic security audits, vulnerability assessment and penetration testing, continuous monitoring, and compliance with CERT-In, NIC-CERT, and other government cybersecurity guidelines. The reply also says cyber drills are conducted and that accessibility work follows the Guidelines for Indian Government Websites and the Web Content Accessibility Guidelines, with assisted delivery through Common Service Centres.

That list is a compliance menu for a government platform. It is not a certification that every private app on UPI meets the same menu. UPI participants answer to the payments rulebook and to NPCI's operating circulars. This brief does not restate circulars it has not quoted. The public monthly statistics page is a volume series, not a conduct rule.

## What the outlook is, as of September 2026

Three clocks are visible.

The Account Aggregator clock has already struck. The 2025 directions are in force, the 2016 directions stand repealed, and the business is fenced: consent, no transactions, no retained financial information, no outsourcing of the aggregation itself, users who are themselves regulated.

The data-protection clock has struck for the Board and the provisions listed in the first limb of G.S.R. 843(E). The next appointed date, one year on, covers two specified clauses. The large body of operative sections is appointed for eighteen months after 13 November 2025.

The health and e-governance clocks are ongoing duties rather than a future commencement: sandbox plus security audit on one side, the audit and encryption list on the other.

Nothing in these documents sets a new cap on UPI market share, a new price for DigiLocker, or a date by which every state must close its Aadhaar saturation gap. Those are separate policy choices. They are not implied by the directions and the gazette notices above.
