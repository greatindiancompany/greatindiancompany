---
id: "gic-20260330-578"
lang: "en"
translationOf: null
title: "A risk map for India's digital credit and payments stack"
description: "Failure modes already named in Reserve Bank directions: mis-selling, data retention, pass-through accounts, weak authentication, and treating the Digital Rupee like a deposit."
slug: "financial-digitalization-risk-and-scenario-map-jalshakti-dowr-gov-20260330-578"
publishDate: "2026-03-30"
updatedDate: "2026-09-24"
tags:
  - "financial-digitalization"
  - "risk-and-scenarios"
  - "credit"
  - "payments"
sourceLinks:
  - "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12848"
  - "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12898"
  - "https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=10598"
  - "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=54773"
  - "https://www.npci.org.in/product/upi/product-statistics"
  - "https://www.digitalindia.gov.in/initiative/unified-payment-interface-upi/"
summaryType: "india-brief"
draft: false
---

# A risk map for India's digital credit and payments stack

The Reserve Bank already wrote the risk list for digital credit. The preamble to the [Digital Lending Directions, 2025](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12848) names unbridled third parties, mis-selling, data privacy, unfair conduct, exorbitant rates, and unethical recovery. A scenario map is useful when each of those words is tied to a control that either holds or fails. This note does that. It does not assign probabilities the directions do not publish.

## Mis-selling and the multi-lender screen

Since 1 November 2025, a lending service provider that works with more than one regulated entity must show every matching offer, name the lenders who do not match, and avoid dark patterns that push one product. A failure scenario is a screen that buries the annual percentage rate, ranks offers on an undisclosed commercial deal, or omits the key fact statement link. The harm is a borrower who cannot compare. The control is the content rule in paragraph 6 of the directions, plus the key fact statement itself. Penal charges follow the Reserve Bank's separate fair-lending circular of 18 August 2023, which the directions point to. A "zero cost" presentation that hides a fee inside the service provider's collection is the failure mode the fee rule was written against: fees to the service provider are paid by the lender, not taken from the borrower on the side.

## Data that stays, or leaves the country

The directions ban ongoing access to contacts, call logs, files, and media, and they require in-India storage. Processing outside India has a 24-hour deletion and return rule. A failure scenario is a lending app that still ships the contact list to a recovery vendor, or a processor that keeps an offshore copy after the day. The aggregator failure is different and stricter. Under the [Account Aggregator Directions](https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=10598), financial information must not reside with the aggregator at all, and the aggregator must not take the customer's login credentials. A firm that "temporarily" stores bank statements to train a model is outside that direction. Revocation has to work, including for part of the information, and a fresh artefact then goes to the provider.

## Money in the wrong account

Disbursement to a lending service provider, or repayment through a pool account the provider controls, is the balance-sheet scenario. The borrower thinks the app lent the money. The regulated entity's books and the bank trail say otherwise, or they do not match the app. Co-lending between regulated entities is an allowed exception. A third party in the flow of funds is not. For payments, the parallel scenario is a firm that handles merchant money without payment-aggregator authorisation, or that calls itself a gateway while settling funds. The [2025 aggregator directions](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896) put customer funds in escrow and define a gateway as technology that does not handle funds.

## Authentication and cash that is not a deposit

The [authentication directions](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12898) make the issuer pay the customer's loss in full if the transaction did not comply. The scenario is a domestic payment that used one factor when two were required, followed by a dispute the issuer hoped the app would absorb. Cross-border card-not-present traffic is a second scenario with its own date, 1 October 2026, and it is not solved by pointing at UPI. UPI's own operational risk is visible on NPCI's [statistics section](https://www.npci.org.in/product/upi/product-statistics), which publishes uptime and incidents. A national retail rail with 741 banks live in July 2026, on the PIB factsheet, concentrates operational attention even though the user's interface is competitive. MeitY's [description of UPI](https://www.digitalindia.gov.in/initiative/unified-payment-interface-upi/) is an interoperability design, not a claim that the switch cannot have an incident.

The Digital Rupee scenario is a category error. The [retail pilot release](https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=54773) says e₹-R does not earn interest and can be converted into deposits. Treating a wallet balance as a deposit, or marketing it as a yield product, misstates the liability. A default loss guarantee has its own category error: using a five per cent cover as if the lender had transferred the credit risk. The directions say asset classification stays with the lender, loan by loan, and the borrower's debt is unchanged when the guarantee is invoked.

Great Indian Company keeps this map next to the operating notes at [greatindiancompany.com/blog](https://greatindiancompany.com/blog). The jobs those controls require are in the [skills note](https://greatindiancompany.com/blog/financial-digitalization-jobs-and-skills-impact-jalshakti-dowr-gov-20260330-418).
