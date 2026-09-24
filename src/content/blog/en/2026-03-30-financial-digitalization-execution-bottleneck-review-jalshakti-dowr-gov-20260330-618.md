---
id: "gic-20260330-618"
lang: "en"
translationOf: null
title: "Where India's digital credit and payments stack actually stalls"
description: "Execution bottlenecks written into the rules: fair multi-lender display, consent that cannot be outsourced, credit lines that stay at the bank, and closed authorisation windows."
slug: "financial-digitalization-execution-bottleneck-review-jalshakti-dowr-gov-20260330-618"
publishDate: "2026-03-30"
updatedDate: "2026-09-24"
tags:
  - "financial-digitalization"
  - "execution-bottlenecks"
  - "credit"
  - "payments"
sourceLinks:
  - "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12848"
  - "https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=10598"
  - "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12532"
  - "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896"
  - "https://www.pib.gov.in/FactsheetDetails.aspx?id=150962&lang=1"
  - "https://www.digitalindia.gov.in/initiative/unified-payment-interface-upi/"
summaryType: "india-brief"
draft: false
---

# Where India's digital credit and payments stack actually stalls

UPI's scale shows that India can run a national payments system. The Press Information Bureau's [August 2026 factsheet](https://www.pib.gov.in/FactsheetDetails.aspx?id=150962&lang=1) puts July 2026 at 2,365.8 crore transactions. The stalls that still matter sit beside that rail: in the credit screen, in the consent pipe, and in the authorisation status of anyone holding merchant money. They are execution problems because the text is already in force and the hard part is the handoff between firms.

## The offer screen is a product bottleneck

From 1 November 2025, paragraph 6 of the [Digital Lending Directions, 2025](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12848) requires a lending service provider with several lenders to show a digital view of every matching offer. The view includes the lender's name, amount, tenor, annual percentage rate, monthly repayment, and penal charges, and a link to the key fact statement. Lenders who do not match are still named. The matching method has to be consistent for similarly placed borrowers, and it has to be documented. Ranking is allowed on a metric that was disclosed in public. Dark patterns are not.

This stalls marketplaces that grew by preferring the lender with the best commercial term and disclosing a single "best" offer. Rebuilding the screen is not a copy change. Each lender has to pass a comparable term sheet into the same view, in time for the borrower to choose, without the service provider controlling the later movement of funds. Disbursement still goes to the borrower and repayment still goes to the lender. A beautiful comparison screen that then routes money through the platform fails a different paragraph.

## Consent stalls when the bank or the insurer is slow, and the aggregator cannot paper over it

An account aggregator does not hold the financial information and cannot hire a third party to do the aggregation, under the [2016 directions](https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=10598). The financial information provider shares data only after it checks that the consent artefact is valid, including dates and use. If providers are uneven in what they can emit, from deposits to GSTR-1 and GSTR-3B, the aggregator cannot fill the gap by scraping or by storing a private copy. The customer's revocation has to propagate as a fresh artefact. That round trip is the bottleneck: a consent system is only as live as the slowest provider, and the rules forbid the usual workaround of a vendor in the middle.

There is a second stall inside lending apps that use the data. The lender must still assess creditworthiness and keep age, occupation, and income on file. A default loss guarantee capped at five per cent of disbursed amount does not let the credit team skip that file. Teams that planned to "launch now and underwrite with the guarantee" are stuck on purpose.

## Credit on UPI stalls at the bank's policy, not at the app

MeitY's [UPI page](https://www.digitalindia.gov.in/initiative/unified-payment-interface-upi/) explains the interface. The [credit-line circular](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12532) explains the limit. A scheduled commercial bank, including a small finance bank after the 12 February 2025 update, may let a customer pay from a pre-sanctioned line, with prior consent. Payment banks and regional rural banks are outside that circular. The bank's board sets limit, tenor, and interest. An app that wants to show a credit limit to a user who has no such line at a participating bank has nothing to attach. That is a distribution bottleneck, not a missing API slogan.

## Authorisation windows that have already shut

Non-bank payment aggregators need a certificate under the [15 September 2025 directions](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896). An entity that only did physical aggregation and did not apply by 31 December 2025 had to wind up by 28 February 2026. A firm still settling merchant funds in that category without authorisation is not in a grey zone the directions left open. Net worth of ₹15 crore at application and ₹25 crore by the end of the third year is a stall of a different kind: the business can be operationally ready and still be ineligible.

The pattern across these stalls is the same. The interface layer moves faster than the licensed layer, and the directions refuse to let the interface absorb the licence. Great Indian Company writes the stall down so a roadmap can name the firm that has to move. The library is at [greatindiancompany.com/blog](https://greatindiancompany.com/blog). Roles that remain open despite the stalls are in the [opportunity note](https://greatindiancompany.com/blog/financial-digitalization-opportunity-landscape-jalshakti-dowr-gov-20260330-658).
