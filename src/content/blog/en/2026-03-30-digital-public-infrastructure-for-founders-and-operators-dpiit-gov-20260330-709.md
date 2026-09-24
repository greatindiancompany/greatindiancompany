---
id: "gic-20260330-709"
lang: "en"
translationOf: null
title: "A founder's map of India's public digital rails"
description: "Which role a company can actually take on UPI, Account Aggregators, DigiLocker, ONDC, ABDM, and DIKSHA, and which roles are closed."
slug: "digital-public-infrastructure-for-founders-and-operators-dpiit-gov-20260330-709"
publishDate: "2026-03-30"
updatedDate: "2026-09-24"
tags:
  - "digital-public-infrastructure"
  - "for-founders-and-operators"
  - "india-briefs"
  - "diverse-sources"
sourceLinks:
  - "https://www.meity.gov.in/"
  - "https://www.digitalindia.gov.in/"
  - "https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=12936"
  - "https://abdm.gov.in/"
  - "https://diksha.gov.in/about-us/"
summaryType: "india-brief"
draft: false
---

# A founder's map of India's public digital rails

Founders waste time when they treat India's digital public infrastructure as a kit of APIs with no licence attached. Each rail has a seat. Some seats are open to a startup. Some are open only to a regulated financial firm or a government issuer. One seat, the Account Aggregator itself, is a regulated utility with a list of things it must not do. This is a map of those seats, written from the operating rules and the latest official counts, not from a pitch narrative.

## Start by naming the job

Write the customer action in one line before choosing a rail.

- The customer pays a business or a person. That is UPI, operated through a bank or a payment provider that is already allowed on the system. NPCI's August 2026 statistics show 752 banks live and 24,508.96 million transactions. You are joining a system of that size. You are not launching a parallel national switch.
- The customer proves who they are. That is Aadhaar authentication through a channel UIDAI allows, not a private copy of the identity database. UIDAI's report as on 30 June 2026 puts live penetration at 94.59 percent and Nagaland at 62.41 percent. If your users are in a low-saturation state, plan an assisted path. The national average will not save the flow.
- The customer pulls an official document. That is DigiLocker. As on 31 July 2026 it had more than 72.43 crore users and 5,437 document types. Your move is to become an issuer, if you are a department or an authorised institution, or to accept an issued document. It is not to build a second national locker.
- The customer shares a bank statement or a GST return with a lender. That is the Account Aggregator framework. Read the seat rules below before you write the word "aggregator" into a company name.
- The customer discovers a seller who uses a different app. That is ONDC. The Commerce Ministry says it is not a marketplace. You join as a network participant.
- The customer links a health record between a clinic and another provider. That is the Ayushman Bharat Digital Mission. You enter through a sandbox and a security audit.
- The learner or teacher needs curriculum material. That is DIKSHA. States decide how to use it.

If the job does not match one of these, a public rail may be the wrong tool. A private workflow can still be the product.

## If you are looking at Account Aggregators, pick a seat on purpose

The Reserve Bank's directions of 28 November 2025 are the operating manual.

You may become an Account Aggregator only as a company with a certificate of registration. Net owned funds must be at least ₹2 crore. You stay in the base layer of NBFC regulation. Your board approves the price. You retrieve or present financial information the Bank has listed, which includes deposits, mutual funds, insurance, pension balances, and GSTR-1 and GSTR-3B, among other items. You do this on explicit consent, recorded in a standardised artefact that states purpose, recipient, and expiry.

You may not support the customer's transactions. You may not keep the financial information. You may not outsource the aggregation business to a vendor. You may not see the customer's bank login. You may not do any other business. If your statement and the bank's books disagree, the bank is right.

Most founders do not want this seat. They want to be a financial information user. That seat requires you to be registered with and regulated by a financial-sector regulator. The directions name the Reserve Bank, SEBI, IRDAI, the pension regulator, and the Department of Revenue. An unregulated app cannot appoint itself as the recipient of a customer's deposits data. If you are not in that perimeter, the honest product is something else: a tool that helps a regulated lender manage the pull, sold to that lender, without your company becoming the place the data is delivered.

If you already hold accounts, you are a provider. The work is to answer consent requests and to treat your own books as the system of record. Sahamati's July 2026 dashboard shows why the work is repetitive: 343.78 million data deliveries in the month, against 11.68 million new accounts linked. The load is ongoing fetches, not a one-time integration.

## ONDC: ship a participant, not a store listing

The Lok Sabha reply of 4 August 2026 is the briefing a founder should keep. ONDC is a section 8 company. Buyers and sellers on different applications transact across the network. As of July 2026 the network had handled over 500 million cumulative orders and was processing over 500 orders a minute. About 2 lakh or more retail merchants were active, about 60 percent of them small sellers, with about 10 lakh or more mobility and logistics service providers.

Your product is a buyer app, a seller app, a logistics service, or a tool those participants use. "List my brand on ONDC" is not a product, because there is no single ONDC shopfront in the ministry's description. DigiDukaan, the kirana onboarding programme named in the reply, was operating in Hyderabad and Jaipur, with field staff. If your customer is a small shop, budget for cataloguing, packaging, and training. The public support for that, the TEAM outlay of ₹277.35 crore, runs through 2026-27 and targets 50 percent women-owned enterprises. It is assistance for those enterprises. It is not your revenue.

Do not promise investors a state-wise seller count. The ministry says the network does not keep an individually attributed census, because sellers can move between participants.

## Health and education have gates, not open uploads

For health software, the ministry's 24 July 2026 reply is the gate list. Validate in the ABDM sandbox. Pass a web application security audit. Exchange data only with consent. Do not design a central copy of clinical records; the reply says the mission has no centralised repository. As of 20 July 2026 there were 94.87 crore ABHA IDs and only 5.36 lakh registered facilities. A practical company helps facilities and existing programmes join. The reply names PM-JAY, Nikshay, and several state systems as already integrated. Copying that pattern is the job. Collecting a private national health archive is the opposite of the stated design.

For education, DIKSHA's about page says states, boards, and other organisations can use a common platform, in 36 languages, built on Sunbird. NCERT textbooks are under a non-commercial no-derivatives licence, and other resources under a non-commercial share-alike licence. Read those licences before you scrape textbooks into a product. NISHTHA is the teacher-training programme on the platform. A founder can build state-level programmes and tools around the platform. A founder cannot assume a single national procurement.

## Documents and sign-on are usually a feature, not the company

If your users are Indian residents, DigiLocker's user count is large enough that "we store your official PDFs" is a weak company. The stronger feature is to fetch or accept the issuer's document, and to let the user sign with eSign where the flow needs a signature. The 29 July 2026 government account puts eSign issuance at 155.56 crore across providers. API Setu, with 8,904 published APIs in that account, is where you look for a department interface before you negotiate a one-off feed. Meri Pehchaan is the single sign-on the same account describes for government applications. UMANG, with 2,575 services, is the government's own mobile front. Integrate with these where your user is trying to finish a government service. Do not clone them.

## Operators: what to instrument

Once the seat is chosen, instrument the failure the public data says is likely.

- Authentication failures and drop-offs by state, because Aadhaar coverage is not flat.
- For Account Aggregator flows, separate link creation, consent fulfilled, and data delivered. Sahamati does. If you blend them, you will not know whether you have a distribution problem or a fetch problem. July 2026 fulfilled 44.84 million consents against 11.68 million new links. Those are different operating numbers.
- For UPI, reconcile count and value. August 2026 was the volume high in the April-to-August window and not the value high. Your average ticket can fall while your count rises.
- For ONDC, track orders that complete, not only catalogues uploaded. The participant agreement defines the error codes that matter. A catalogue that never confirms is not the order total the Commerce Ministry publishes.
- For DigiLocker, track fetches that return a document against document types you thought were live. A type on the list of 5,437 can still fail for your users.

## What to tell your board in one paragraph

We use a public rail for one named action. We are not the rail. Our seat is allowed by a specific rule: a regulated information user, a network participant, a health app that has passed the audit, or a client of those. We do not store Account Aggregator payloads, we do not run a private Aadhaar, and we do not describe ONDC as our marketplace. The public counts tell us the rails are already used at population scale. They do not tell us our margin. That still has to come from our own price and our own cost of the seat.
