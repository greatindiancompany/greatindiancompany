---
id: "gic-20260330-579"
lang: "en"
translationOf: null
title: "Where a live citizen service still fails"
description: "Failure cases already written into DigiLocker, the Aadhaar Payments Bridge, state portals, CPGRAMS, and NeSDA's end-service parameter."
slug: "public-service-delivery-risk-and-scenario-map-mha-gov-20260330-579"
publishDate: "2026-03-30"
updatedDate: "2026-09-24"
tags:
  - "public-service-delivery"
  - "risk-and-scenario-map"
  - "india-briefs"
sourceLinks:
  - "https://img1.digitallocker.gov.in/assets/img/circulars/CC_33_2018.pdf"
  - "https://dbtbharat.gov.in/data/dbt_payments/Standard-Operating-Procedure-of-Aadhaar-Payments-Bridge-(APB).pdf"
  - "https://uidai.gov.in/en/308-faqs/direct-benefit-transfer-dbt.html"
  - "https://pgportal.gov.in/"
  - "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2266244"
  - "https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=158902&id=158902&lang=1&reg=1"
summaryType: "india-brief"
draft: false
---

# Where a live citizen service still fails

The failure modes below are written into official documents. They are scenarios an operator can rehearse. They are not probabilities, and they are not a claim that most transactions fail.

## The document is in the wrong section

Railway circular CC/33/2018, [carried on DigiLocker](https://img1.digitallocker.gov.in/assets/img/circulars/CC_33_2018.pdf), tells staff to accept Aadhaar or a driving licence shown from Issued Documents, and to refuse the same labels when the file sits in Uploaded Documents. A citizen can hold a DigiLocker account, open it at a counter, and still be turned away. The account is live. The legal object is missing. The same split applies anywhere a requester is told to trust "a DigiLocker file" without checking that the issuer fetched it. DigiLocker's own note limits the at-par rule to issued documents under Rule 9A.

A second version of this failure is an issuer that never joined. The 6 August 2026 Lok Sabha reply records 2,822 issuers. A board, transport department, or hospital outside that set leaves the citizen with a paper original or a scan. The app cannot fetch what the issuer has not published.

## The cash hits the wrong account, or no account

The DBT site's [Aadhaar Payments Bridge procedure](https://dbtbharat.gov.in/data/dbt_payments/Standard-Operating-Procedure-of-Aadhaar-Payments-Bridge-(APB).pdf) says the bridge uses the Aadhaar number as the financial address, through a mapper that ties it to a bank. It tells banks to verify that the account is eligible to receive the credit before seeding. Incorrect mapping leads to wrong credits, and the bank is liable to make them good to the department that paid.

UIDAI's [FAQ](https://uidai.gov.in/en/308-faqs/direct-benefit-transfer-dbt.html) adds the citizen-side version: benefits for which the person is enrolled go to the one DBT-enabled account they chose, and only after the bank seeds it. A person with several accounts can watch the credit land in the mapped one, which may not be the account they currently use. Cash-out still depends on a branch, an ATM, a post office, or a business correspondent with a micro-ATM. A successful credit with no nearby cash-out is a last-mile failure the transfer total will not show.

Scheme rules can also exclude. The DBT Mission says Aadhaar is not mandatory for DBT schemes as a class. Section 7 of the Aadhaar Act allows a government to require it for a benefit from the Consolidated Fund. A resident who was told Aadhaar is optional, then blocked by a scheme guideline, is inside both texts.

## The national app and the state workflow disagree

UMANG can list a service while the state portal still owns status, payment, and the signed certificate. The August 2026 reply's figure of 17 Tamil Nadu services on UMANG, beside a separate e-Sevai portal that the reply calls end-to-end, is the structural version of this risk. NeSDA's [28 May 2026 parameters](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2266244) exist because DARPG expects to find portals that offer content without end service delivery, and services without status tracking. A citizen who applies on one site and cannot see status on the site that signs the document will file a grievance.

## The complaint closes badly

[CPGRAMS](https://pgportal.gov.in/) gives a registration number and an appeal only after a "Poor" rating on closure. A complainant who does not rate, or who rates and walks away, loses the appeal path the portal describes. A [15 June 2026 PIB note](https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=158902&id=158902&lang=1&reg=1) says approximately 6 lakh grievances were resolved between January 2025 and February 2026, with 69.8 percent rated satisfactory. The complement is part of the same sentence's world: a large minority of rated closures did not satisfy the complainant. That is a quality risk inside a system that is functioning well enough to close cases.

DARPG coordinates. The line department redresses. A grievance parked at the coordinating department, rather than at the office that issues the certificate or the credit, is a routing failure the portal's own FAQ warns about by sending the citizen onward to the ministry's director of public grievances.

## On the Great Indian Company desk

[Great Indian Company](https://greatindiancompany.com/) publishes this so a risk register uses the failure the rule already names. The operational bottlenecks are in the [execution review](/blog/public-service-delivery-execution-bottleneck-review-mha-gov-20260330-619). The desk index is the [research blog](https://greatindiancompany.com/blog).
