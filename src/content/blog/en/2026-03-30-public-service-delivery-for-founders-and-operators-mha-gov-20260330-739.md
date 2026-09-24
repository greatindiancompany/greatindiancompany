---
id: "gic-20260330-739"
lang: "en"
translationOf: null
title: "How founders and operators should use the citizen service stack"
description: "Operating rules for UMANG, DigiLocker issued documents, state portals, one mapped DBT account, and a CPGRAMS number when the flow breaks."
slug: "public-service-delivery-for-founders-and-operators-mha-gov-20260330-739"
publishDate: "2026-03-30"
updatedDate: "2026-09-24"
tags:
  - "public-service-delivery"
  - "for-founders-and-operators"
  - "india-briefs"
sourceLinks:
  - "https://web.umang.gov.in/landing/"
  - "https://blog.digilocker.gov.in/digilocker-an-initiative-towards-paperless-governance/"
  - "https://img1.digitallocker.gov.in/assets/img/circulars/CC_33_2018.pdf"
  - "https://uidai.gov.in/en/308-faqs/direct-benefit-transfer-dbt.html"
  - "https://pgportal.gov.in/"
  - "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2266244"
summaryType: "india-brief"
draft: false
---

# How founders and operators should use the citizen service stack

A founder building on India's citizen services is a guest on public rails. The rails have owners, and the owners have already written the distinctions that break careless integrations. Use those distinctions as product requirements.

## Start from the system of record

[UMANG](https://web.umang.gov.in/landing/) is the mobile and web window: NeGD and MeitY, central and state services, documents pulled from DigiLocker, plus chatbot and voice channels. It is a reasonable place to send a user. It is a poor place to assume the application status lives. State portals issue many certificates and pensions. The 6 August 2026 Lok Sabha reply says so, and it gives Tamil Nadu's e-Sevai portal as an end-to-end example while listing only 17 Tamil Nadu services inside UMANG's catalogue of 2,575. If your user applies for a state certificate, test the state status page. Show that status in your interface. Do not invent a "submitted" state the department cannot see.

e-District, where the state has implemented it, is that workflow: application, digitally signed output, and verification. Tripura's IT department describes those steps, including SMS and a payment integration, under a district e-governance society. Ask the state agency which of those steps is actually on for the service you touch.

## Fetch issued documents, and say when you cannot

DigiLocker's [note](https://blog.digilocker.gov.in/digilocker-an-initiative-towards-paperless-governance/) is the product spec. Issued documents are fetched from the issuer. They are the files the note treats as at par with originals under Rule 9A of the 2016 Digital Locker Rules. Verification is a check back to the issuer after the citizen consents. Build the consent and the issuer call. If the issuer is not among the 2,822 the August 2026 reply records, the honest interface says the document is not available from DigiLocker.

Railway circular CC/33/2018, [on DigiLocker](https://img1.digitallocker.gov.in/assets/img/circulars/CC_33_2018.pdf), is the counter-test. Issued Aadhaar or driving licence can be identity for a train journey. The same file uploaded by the user cannot. If your camera flow stores a scan, label it as an upload. Operators who relabel uploads as issued documents will meet a clerk who has read a circular like that one.

## Pay the account the mapper knows

If you help a person receive a cash benefit, UIDAI's [DBT FAQ](https://uidai.gov.in/en/308-faqs/direct-benefit-transfer-dbt.html) is the flow: enrol with the scheme owner, and receive cash in the one account seeded to the NPCI mapper after the person gives the bank a mandate. Do not collect a second account in your app and promise the credit will follow. The DBT bridge procedure says a wrong map becomes a wrong credit, repaired by the bank at the bank's cost to the department. Your support script should tell the user to confirm the mapped account at the bank, and should tell them whether this scheme requires Aadhaar. The Mission says Aadhaar is not mandatory for DBT schemes as a class. The scheme guideline, under section 7 where it applies, may still require it.

## Design the counter and the complaint

Common Service Centres are how a large share of residents finish a service. The August 2026 reply counts 5.01 lakh functional centres as of May 2026. A flow that cannot be completed by a village-level entrepreneur, on a shared machine, with a printed or digitally signed output, is a city flow. Say so.

When the flow fails, send the person to [CPGRAMS](https://pgportal.gov.in/) and keep the registration number. The portal is inside UMANG. The government does not charge for the filing. A CSC may collect a charge that the portal says goes to the CSC. An appeal opens when the user rates the closure "Poor." Your help centre should know that sequence. A tweet is not a substitute.

NeSDA's parameters, listed in the [28 May 2026 release](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2266244), are a free product checklist: accessibility, end service delivery, integrated delivery, status tracking, and information security. Build to those even when you are not the nodal officer submitting the score.

## On the Great Indian Company desk

[Great Indian Company](https://greatindiancompany.com/) publishes this for people who will ship a flow, not only read a policy. The joins still open are in the [opportunity landscape](/blog/public-service-delivery-opportunity-landscape-mha-gov-20260330-659). The desk index is the [research blog](https://greatindiancompany.com/blog).
