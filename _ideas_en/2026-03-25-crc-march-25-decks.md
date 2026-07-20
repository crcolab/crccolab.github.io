---
title: "CRC March 2026 Share-back: Slide Deck Notes"
date: 2026-03-25
category: NOTE
summary: "A working note collecting the slide decks and follow-up reading from CRC's internal March 2026 share-back; source files live on GitHub."
author: CHENG PENG
author_slug: cheng
locale: en-US
---

This is an evolving working note; the content will keep expanding. The original slides and source material are public at <https://github.com/paulpengtw/crc-march-25-decks>; this page serves as the reading entry point and index on the CRC site.

## Overview

The core of CRC's March 2026 share-back was a reveal.js scenario-simulation deck titled "Taiwan cross-border internet traffic degradation simulation." The deck sets up a scenario where a subsea cable break instantly cuts Taiwan's outbound bandwidth by 50 percent, then walks through the failures that unfold over the following six hours in order — from dropped phone calls, to pages that hang, to accounts logging themselves out one by one — pairing each failure with its technical cause and the party responsible for fixing it. The summary below follows the deck's own section structure.

## Phase 1 (0-5 minutes): why did my call just drop

The deck explains BGP with a post-office analogy: the internet is thousands of post offices forwarding each other's mail, and a routing table is the street signs between them. A cable break is a street closure; routers start re-announcing and recomputing paths (BGP reconvergence), and during that convergence window users experience a total outage even though 50 percent of capacity is technically still there. The deck also distinguishes LINE voice calls from plain text messages — voice needs a live call-control server, and if that server sits overseas, voice dies first while text may still limp through. The pressure target here is LINE: deploy a call-control server hosted inside Taiwan.

## Phase 2 (5-30 minutes): zombie network

BGP has converged and routes are technically fixed — so why is everything still slow? The deck explains congestion collapse with a highway analogy: ten lanes drop to five but traffic volume doesn't change, so packet loss triggers retransmissions, which make things more congested, in a vicious circle — the nominal 50 percent capacity ends up delivering only 15-20 percent of usable throughput. A second mechanism is the "Trombone Effect," explained via a convenience-store analogy: a corner store you could normally reach in 30 seconds now requires your traffic to detour through Tokyo and back, because local ISPs never built direct peering with each other — the digital equivalent of flying thousands of kilometers round-trip to buy a bottle of water. This section echoes CRC's own g0v Summit 2026 panel talk, "[Digital Lifeline: Everything You Need to Know About Subsea Cables](/records/2026-05-24-g0v-summit-panel-slides/)" — the same presenter also shared a working note on the 50-percent-traffic-drop scenario at that session. The deck names three pressure targets here: ISPs (publish peering policy, fully interconnect at TPIX), NCC / the Ministry of Digital Affairs (audit routing topology instead of just counting cables), and legislators (mandate transparency around ISP peering).

## Phase 3 (30-60 minutes): it was just working, why did it break again

This phase explains "progressive collapse": CDN cache TTLs (Time To Live), login auth tokens, and DNS caches all expire on their own separate clocks, and those clocks run out one after another once a cable break happens. The result is that services fail one at a time rather than all at once — an irregular failure pattern that is arguably more confusing than a clean total outage, because users can't tell where the problem lies or whether to wait it out or find an alternative.

## Phase 4 onward: the control plane's overseas dependency

The deck's closing summary table chains the four phases into one causal thread: 0-5 minutes is BGP reconvergence plus an overseas call-control server; 5-30 minutes is congestion collapse plus the Trombone Effect; 30-60 minutes is cache, token, and DNS expiry cascading in sequence; and 1-6 hours is when the cloud control plane's dependency on overseas infrastructure surfaces — some services don't come back even after bandwidth is restored. The deck leaves the audience with two open questions: could gov.tw survive this scenario, and are the subsea cables okay right now?

## How this connects to CRC's other work

Subsea-cable and backbone fragility is only half of the outage picture; the other half is what to do when bandwidth drops to zero. CRC's biggest implementation focus over the past six months has been mesh networking via Meshtastic and Reticulum: see the [Kuma Academy write-up of the CRC mesh workshop](/records/2026-04-20-kuma-academy-mesh-workshop/) and [Rti's coverage of Meshtastic adoption in Taiwan](/records/2026-06-15-rti-meshtastic/). Between the two threads — policy pressure on backbone infrastructure and community-driven offline-communication practice — this March share-back roughly outlines the scope of CRC's ongoing work.

## Further reading

- Source slide repository: <https://github.com/paulpengtw/crc-march-25-decks>
- CRC's records: [/records/](/records/)
- CRC's news: [/news/](/news/)
