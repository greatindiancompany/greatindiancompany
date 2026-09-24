---
id: "gic-20260330-309"
lang: "en"
translationOf: null
title: "Where Aadhaar coverage still depends on the state"
description: "UIDAI's 30 June 2026 saturation report, and the other digital rails that do not publish a comparable state cut."
slug: "digital-public-infrastructure-state-wise-patterns-dpiit-gov-20260330-309"
publishDate: "2026-03-30"
updatedDate: "2026-09-24"
tags:
  - "digital-public-infrastructure"
  - "state-wise-patterns"
  - "india-briefs"
  - "diverse-sources"
sourceLinks:
  - "https://www.meity.gov.in/"
  - "https://www.digitalindia.gov.in/"
  - "https://uidai.gov.in/images/AadhaarSaturationReport.pdf"
  - "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2288848"
  - "https://sansad.in/getFile/lsapps/loksabhaquestions/annex/188/AU2594_yXlrVE.pdf"
summaryType: "india-brief"
draft: false
---

# Where Aadhaar coverage still depends on the state

National totals hide the only digital-public-infrastructure pattern India publishes as a full state table. The Unique Identification Authority of India's saturation report as on 30 June 2026 is that table. Other rails either point to a live dashboard without a frozen state extract in the parliamentary record, or they say outright that a state count is not kept.

## How to read a percentage over 100

UIDAI's report gives, for each state and Union Territory, a population projected for 2026, the raw count of Aadhaar numbers assigned as of June 2026, an estimated live count adjusted for deaths, and live penetration.

Two notes on the report govern every comparison:

1. The count of holders follows the current address on the Aadhaar. The person may not be domiciled in that state.
2. The live estimate is adjusted for deaths using death rates from the Registrar General.

Nationally, the report's total projected population is 1,42,46,96,577. Raw Aadhaar assigned is 1,44,80,05,767. Estimated live Aadhaar is 1,34,76,52,046. Live penetration is 94.59 percent. The raw stock is larger than the live stock because the live column removes an estimate of deaths. Live penetration can exceed 100 percent where the address-based count, even after that adjustment, exceeds the projected population. That is a feature of the method. It is not evidence that enrolment has gone past every living resident.

## The low end is a cluster, not a single outlier

Live penetration on 30 June 2026, from the report:

| State or Union Territory | Projected population, 2026 | Estimated live Aadhaar | Live penetration |
| --- | ---: | ---: | ---: |
| Nagaland | 22,94,000 | 14,31,599 | 62.41% |
| Arunachal Pradesh | 16,04,000 | 12,47,388 | 77.77% |
| Manipur | 33,11,000 | 27,12,264 | 81.92% |
| Sikkim | 7,08,000 | 5,92,472 | 83.68% |
| Meghalaya | 34,40,000 | 28,89,448 | 84.00% |
| Ladakh | 3,05,000 | 2,57,004 | 84.26% |
| Jammu and Kashmir | 1,38,96,000 | 1,21,67,709 | 87.56% |
| Bihar | 13,22,65,000 | 11,67,82,847 | 88.29% |
| Chandigarh | 12,67,000 | 11,24,895 | 88.78% |
| Gujarat | 7,40,86,000 | 6,64,86,078 | 89.74% |
| Jharkhand | 4,09,58,000 | 3,67,47,635 | 89.72% |

Nagaland is not a rounding error. The report puts 14,31,599 live Aadhaar assignments against a projected population of 22,94,000. Arunachal Pradesh, Manipur, Meghalaya, and Sikkim are all below 85 percent. Jammu and Kashmir is 87.56 percent. These are the figures a service designer needs if a benefit, a SIM, or a bank account is gated on Aadhaar authentication. The national 94.59 percent will not describe Dimapur or a district in Meghalaya.

The gap is not only in the north-east. Bihar, a large state, is at 88.29 percent live penetration: 11,67,82,847 estimated live assignments against a projected population of 13,22,65,000. Gujarat is at 89.74 percent. Jharkhand is at 89.72 percent. A map that colours only the north-east will miss large absolute shortfalls in the big states.

## Large states around the national line

| State | Estimated live Aadhaar | Live penetration |
| --- | ---: | ---: |
| Uttar Pradesh | 22,64,15,488 | 93.23% |
| Maharashtra | 12,12,19,672 | 93.74% |
| Madhya Pradesh | 8,18,21,328 | 91.24% |
| Rajasthan | 7,85,96,227 | 93.97% |
| West Bengal | 10,03,99,328 | 99.88% |
| Karnataka | 6,70,27,107 | 97.19% |
| Tamil Nadu | 7,56,80,274 | 97.59% |
| Andhra Pradesh | 5,30,90,124 | 98.85% |
| Kerala | 3,80,24,123 | 105.02% |
| Telangana | 3,99,81,317 | 103.48% |

Uttar Pradesh's 93.23 percent is close to the national rate and still leaves a large absolute gap because the base is 24,28,59,000 projected people. Kerala's 105.02 percent and Telangana's 103.48 percent should be quoted with UIDAI's address-and-death notes, not as a claim that enrolment exceeded the living population in a literal headcount. Delhi is 102.09 percent on the same report, Himachal Pradesh 103.79 percent, Punjab 101.14 percent, Lakshadweep 108.48 percent.

Assam, which is sometimes grouped with the north-east gap, is at 91.64 percent in this report (3,36,49,210 live assignments). It is below the national rate and well above Nagaland. State clusters are not uniform.

## What other rails will not give you at state level

The health ministry has a state cut and has chosen not to paste it into the parliamentary answer. On 24 July 2026 the Minister of State said that as of 20 July 2026 there were 94.87 crore ABHA IDs nationally, including 2.57 crore in Tamil Nadu, and gave a constituency illustration for Arani. The answer then says the state-wise and district-wise distribution is on the real-time dashboard at dashboard.abdm.gov.in. A real-time page is the right operational tool and a poor citation, because it moves. This brief does not copy a live screen. Anyone comparing states on health identity should download or note the dashboard on a stated day, and should keep the 20 July parliamentary totals as the frozen national anchor.

Commerce is more limiting. The Lok Sabha asked for sellers, traders, and MSMEs on the Open Network for Digital Commerce, state by state. The reply of 4 August 2026 says ONDC does not maintain a network-wide, individually attributed count of every seller, MSME, and small retailer, because sellers transact through seller-network participants and can move between them. The published aggregate, as of July 2026, is approximately 2 lakh or more active retail merchants and approximately 10 lakh or more mobility and logistics service providers. An earlier government account, carried by the Press Information Bureau, said that as of 9 December 2025 there were 1.16 lakh or more retail sellers live, from over 630 cities and towns, and that metropolitan-business-district classifications were not maintained. City counts and state counts are not the same, and the later answer explains why a clean state league table is not available.

DigiLocker is in between. The 29 July 2026 Lok Sabha material and the 29 July PIB release refer to state annexures, including a Maharashtra figure of more than 4.46 crore Aadhaar-enabled registrations in one of those accounts, and a Tamil Nadu figure of more than 2.18 crore in another. Those are illustrations in state-specific answers, not a 36-row table reproduced here. The national figures that are safe to pair with them are the ones in the main answers: over 71.66 crore users in the 29 July Lok Sabha text, and more than 72.43 crore users as on 31 July in the Rajya Sabha statement.

UPI's product statistics, as published in the national monthly table, are not a state table. The 29 July PIB account points to an NPCI ecosystem-statistics page for state and Union Territory figures. Until that extract is read on its own, this brief does not invent a state ranking of payments.

## What a state government can do with the table it does have

If a scheme uses Aadhaar authentication, UIDAI's 30 June 2026 report is the coverage prior. Nagaland, Arunachal Pradesh, Manipur, Meghalaya, Sikkim, and Ladakh are the places where a digital-only door excludes the largest share of the projected population. Bihar and Gujarat are the places where the share looks moderate and the absolute number of people outside the live estimate is large.

If a scheme uses ONDC to claim inclusion of small sellers, the parliamentary record will not support a state ranking. The honest public line is the national aggregate, plus the ministry's own statement that seller-level identity is held by network participants rather than by the network. If a scheme uses ABHA, quote the 20 July 2026 national total and then cite the dashboard with the day you opened it.

State pattern, on the public record, is currently an identity pattern. Treating it as a pattern for every rail overclaims what the publishers have released.
