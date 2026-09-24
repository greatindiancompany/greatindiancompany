---
id: "gic-20260330-189"
lang: "en"
translationOf: null
title: "How to read the official signals from UPI and Account Aggregators"
description: "What NPCI's monthly UPI table and Sahamati's Account Aggregator dashboard do, and do not, say about activity on India's rails."
slug: "digital-public-infrastructure-market-signal-brief-dpiit-gov-20260330-189"
publishDate: "2026-03-30"
updatedDate: "2026-09-24"
tags:
  - "digital-public-infrastructure"
  - "market-signal-brief"
  - "india-briefs"
  - "diverse-sources"
sourceLinks:
  - "https://www.meity.gov.in/"
  - "https://www.digitalindia.gov.in/"
  - "https://www.npci.org.in/product/upi/product-statistics"
  - "https://sahamati.org.in/aa-dashboard/"
  - "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2291148"
summaryType: "india-brief"
draft: false
---

# How to read the official signals from UPI and Account Aggregators

A market signal is only as good as the series underneath it. On India's digital public rails, two series are published often enough to watch: NPCI's monthly UPI product statistics, and Sahamati's public Account Aggregator dashboard. Both are real. Neither is a price, a market share, or a demand forecast.

This brief says what a careful reader can take from the months that were on those pages in September 2026, and what would be an over-read.

## UPI: separate the three columns

NPCI publishes, for each month, the number of banks live on UPI, the volume in millions of transactions, and the value in crore rupees. From August 2018 the volume and value exclude transactions that debit and credit the same account. That exclusion matters if you compare a recent month with a month before the exclusion. It does not matter for comparisons inside 2026.

The 2026 rows that were visible on the product-statistics page:

| Month | Banks live | Volume (million) | Value (₹ crore) |
| --- | ---: | ---: | ---: |
| April | 713 | 22,346.80 | 29,02,988.05 |
| May | 720 | 23,201.93 | 29,90,424.21 |
| June | 731 | 22,716.07 | 28,92,138.67 |
| July | 741 | 23,658.35 | 29,87,880.49 |
| August | 752 | 24,508.96 | 29,82,355.95 |

The bank column is a participation signal. Thirty-nine more banks were live in August than in April. That is adoption of the rail by institutions, not adoption by people. A bank can be live and still originate very little traffic. The column does not say which banks those 39 are.

The volume column is a usage signal. August, at 24,508.96 million transactions, is the highest of these five months. June, at 22,716.07 million, is below both May and July. The series is not a straight line even in a period that newspapers later called a record. A one-month jump is not a new trend until the following row confirms it. September was not published at the time of this update.

The value column is a different signal. May is the peak in this window, at ₹29,90,424.21 crore. August is ₹29,82,355.95 crore, below both May and July, even though August has the most transactions. Arithmetic on NPCI's own cells says the average transaction in August was smaller than the average transaction in July. NPCI does not, in this table, say why. Smaller tickets can mean more everyday payments, more failed large payments, a change in person-to-person versus merchant mix, or a calendar effect. The table cannot distinguish those stories.

Do not turn the value column into rupees of consumption. UPI moves money between accounts. A transfer to a family member, a merchant payment, and a refund can all sit in the same total. The product-statistics page used here does not split person-to-person traffic from merchant traffic.

## What the July government snapshot adds, and what it does not

On 29 July 2026 the Press Information Bureau, reporting the government's account, said UPI serves more than 55.49 crore individuals and 6.5 crore merchants and connects 731 banks. The same passage says UPI powers 85 percent of India's digital payments and nearly 50 percent of global real-time digital payments. Those two percentages are the government's statement in that release. The release does not attach the table, the definition of "digital payments," or the international source behind the global share. Use 55.49 crore and 6.5 crore as a dated stock of users and merchants. Treat the 85 percent and 50 percent lines as claims that still need their worksheet.

The 731-bank figure in that release lines up with NPCI's June row. By August the product statistics showed 752. When a speech and a table disagree, keep the date on both.

## Account Aggregators: three definitions, then the numbers

Sahamati's dashboard is explicit about definitions, which is why it is usable.

- The account-linked column is the monthly count of accounts linked by customers.
- The consent column is the monthly count of consent requests against which data was successfully delivered at once. Sahamati says this does not mean all data-fetch requests.
- The data-delivered column is the monthly count of successful data pulls of accounts linked in the ecosystem.

| Month | Accounts linked (million) | Consents fulfilled (million) | Data delivered (million) |
| --- | ---: | ---: | ---: |
| February 2026 | 8.76 | 17.85 | 265.67 |
| March 2026 | 12.10 | 22.30 | 276.22 |
| April 2026 | 9.86 | 19.62 | 290.73 |
| May 2026 | 10.40 | 23.50 | 302.53 |
| June 2026 | 9.68 | 19.30 | 295.20 |
| July 2026 | 11.68 | 44.84 | 343.78 |

Cumulative accounts linked reached 326.30 million in July 2026. Cumulative consents fulfilled reached 538.32 million.

The signal in the flow is the gap between columns. Through June, fulfilled consents ran at roughly twice the monthly count of newly linked accounts, and data delivered ran an order of magnitude higher than either. That pattern fits a system in which one linked account is pulled many times, and in which many consent events are repeats rather than first-time joins. July breaks the consent pattern: fulfilled consents go from 19.30 million to 44.84 million, while new links go from 9.68 million to 11.68 million and data delivered goes from 295.20 million to 343.78 million. Consent activity accelerated more than linking and more than pulls.

A lender who reads "Account Aggregator adoption" as a single number will mix these up. New links are distribution. Fulfilled consents are successful handovers. Data delivered is usage of links that already exist. Loan disbursement is none of the three. The dashboard does not report credit extended.

## Signals that are stocks, not monthly tapes

Some official numbers are useful context and poor trading signals, because they are restated occasionally.

DigiLocker, as on 31 July 2026 in the Rajya Sabha statement carried by the Press Information Bureau on 12 August, had more than 72.43 crore registered users. The Lok Sabha answer of 29 July put the user figure at over 71.66 crore and the accessible documents at more than 936.03 crore. A two-day gap in the answers, plus a later "as on 31 July" cut, is enough to show that user counts are being updated. It is not enough to build a monthly growth rate. The documents were not given a matching pair of dates with the same definition.

ABHA creation, 94.87 crore as of 20 July 2026 in the health ministry's Lok Sabha reply, is a stock of health IDs. It does not say how many of those IDs were used in a clinical exchange that month.

ONDC's cumulative orders, over 500 million as of July 2026 in the Commerce Ministry's Lok Sabha reply, are a network total across retail, mobility, and other domains the answer lists. The answer also says the network was processing over 500 orders a minute. An order on a metro ticket and an order for groceries are both orders. There is no rupee value in that reply.

## A small discipline for the next print

When the next NPCI row and the next Sahamati row appear, write down four comparisons and stop:

1. UPI volume versus the previous month, and versus August 2026.
2. UPI value versus volume, so a record count is not mistaken for a record value.
3. Banks live, as a slow institutional series.
4. Account Aggregator consents versus new links versus data pulls, using Sahamati's definitions rather than a blended "AA growth" line.

If a commentary adds app-level market share, merchant share, or credit disbursed, ask which official table contains it. The pages cited here do not.
