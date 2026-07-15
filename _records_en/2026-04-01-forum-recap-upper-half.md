---
title: "Event Recap: Digital Resilience Forum, First Session"
date: 2026-04-01
category: RECAP
source: CRC
summary: "Highlights from the speakers in Section 1, Subsea Cable Topics and Technical Reports, at the March 25 Digital Resilience Forum. Three speakers and two projects addressed structural risks in Taiwan’s domestic internet—including routing and peering, the transparency of subsea cable information, and the inadequate inventory of essential digital services—as well as constraints imposed by governance beyond Taiwan on subsea cable issues and a disaster-prevention approach to managing them."
locale: en-US
---

As a child, I thought that when a subsea cable broke, the internet broke: I was on this side, and the world was on the other.
As an adult, I thought that full signal bars meant service, never realizing that the homepage was on this side while the data was on the other.
Only after the first subsea cable forum did I understand that a real disconnection does not mean having no signal. It means everything appears connected, yet everything you can use is on the other side of the sea.

Highlights from the speakers in “Section 1: Subsea Cable Topics and Technical Reports”—to understand subsea cables and internet risks, let us look at this side, here at home, before looking at the other side overseas.

## Three Speakers and Two Projects on the Structural Risks in Taiwan’s Domestic Internet

The complexity of “internet services” comes from connections both within Taiwan and across borders, as well as an intricate layered structure. Even if only some subsea cables are severed and outbound internet traffic falls by 50%, users may still experience internet services failing layer by layer under conditions of “congestion collapse” and as authentication and authorization credentials expire one after another. Identifying which layer fails, what it affects, and how it can be reinforced is the key to an effective response.

**Risk 1: Domestic internet routing and peering are matters of business models.**
If local telecom providers do not peer with one another, or if they “cannot agree on transit fees,” services that could have interconnected within Taiwan may instead be routed through overseas paths such as the United States or Japan before returning. Ordinarily, this adds only 20–30 milliseconds, but the risk rises rapidly once traffic is throttled or subsea cables malfunction.

**Risk 2: Subsea cable information is opaque, making problems difficult to see.**
The composition and segmented functions of domestic and international subsea cables are complex. Before a dynamic subsea cable map existed, telecom companies often shifted responsibility for slower internet speeds to upstream or downstream vendors, digital service providers, or other outside parties, making it difficult for ordinary people to pinpoint the problem accurately. Once open-source intelligence (OSINT) and other public geospatial data are consolidated into visualized information, subsea cable status becomes trackable. This can help everyone recognize that slower internet and failed services are not necessarily problems with a single provider or website.

**Risk 3: Taiwan has not sufficiently inventoried essential digital infrastructure services.**
The “Digital Service Resilience Testing” project surveyed the homepages of the 2,000 most commonly used website services and found that **89% of websites are at risk** when subsea cables are severed. Any involvement of layered infrastructure such as domestic and international data centers, nodes, cloud services, hosts, and servers can expose a service to disruption; cloud services, for example, are highly concentrated among providers such as Google, Amazon, and Cloudflare. At the same time, the 11% that passed the test are not necessarily truly safe: their databases, apps, third-party resource services, and other pages may not be hosted in Taiwan. Taiwan’s real problem is not simply whether subsea cables will break, but which services matter most, where their chains of dependency lie, and how many are already bound to infrastructure overseas.

## What Taiwan Should Do Next

- Make subsea cable information and measures more open and transparent, including abnormal conditions, repair progress, and risk explanations. Taiwan should also promote routine testing and disclosure so that vulnerabilities in essential digital services can be seen before an incident occurs.
- Expand domestic peering channels and encourage cooperative interconnection among telecom providers. This would reduce the amount of traffic that could be routed domestically but is instead forced overseas, lowering risks when subsea cable capacity is constrained.
- Inventory the dependency chains of public infrastructure and essential digital services as soon as possible, and establish backup plans inside and outside Taiwan, including data centers, cloud services, authentication mechanisms, and critical systems that support people’s basic needs.
- Much—more—public education, so that society understands the relationships among subsea cables, the internet, and digital services.

## Constraints Imposed by Governance beyond Taiwan on Subsea Cable Issues

**Constraint 1: National borders.**
Under the United Nations system, the 1982 United Nations Convention on the Law of the Sea established boundaries for maritime jurisdiction: territorial seas may extend no more than 12 nautical miles, while contiguous zones may extend to 24 nautical miles. Thus, although subsea cables may appear to be borderless infrastructure, a nearby government cannot simply send a ship to repair a break wherever it occurs. Maritime jurisdiction, vessel authority, and international coordination are also involved. These constraints greatly limit subsea cable tracking, protection, and repair, make it difficult to grasp conditions promptly, and often require catching perpetrators in the act before they can be held accountable.

**Constraint 2: Financial realities.**
Public authorities cannot simply send government vessels into another country’s waters to address subsea cable problems. Could the private sector solve the problem through commercial ports? Once commerce is involved, funding comes first. Large work vessels truly capable of repairing subsea cables have a basic construction cost of approximately US$100–300 million, while specialized work vessels cost approximately US$15 million per year to operate. Moreover, telecom companies earn most of their revenue from laying new subsea cables, not repairing them, which makes maintenance itself less likely to become an area the market naturally prioritizes.

## Managing Digital Infrastructure with a “Disaster Prevention” Mindset

Because the governance constraints described above make rebuilding and maintaining subsea cables extremely difficult, risk management should follow a linear before, during, and after-disaster framework.

- **Before a disaster**: Reduce the likelihood that subsea cables will be damaged—raise the cost of sabotage through fines, confiscation of tools, deeper burial, physical protection, and early-warning systems. At the same time, minimize impacts by continuing to add backup cables, maintain systems, and back up data. International cooperation should also be encouraged, matching resources so that operators can build more subsea cables and maintenance systems.
- **During a disaster**: Once a subsea cable is interrupted, the priority is to switch traffic to backup cables or systems as quickly as possible, while tracking the situation through the subsea cable information section, operator reports, and interagency collaboration.
- **After a disaster**: Taiwan still relies on foreign repair vessels for support. Beyond accelerating repairs, the more important work afterward is to review the cause of the interruption, press the industry to strengthen security protections, and continue promoting interagency collaboration.

## Community Perspectives and Lessons from Other Countries

From the community’s perspective, the concern behind the subsea cable issue is how society can continue to function when the internet goes down or slows dramatically. Rather than discussing only the worst-case scenario, it is more important to turn risks involving different degrees of interruption and different causes into scenarios; identify the most probable, highest-risk situations requiring priority response; and then use community collaboration and practical exercises to turn responses from ideas into practice. Conditions along the First Island Chain are relatively similar, so Taiwan can refer to the disaster-preparedness exercise strategies and cooperative repair and defense measures used in countries such as Japan and the Philippines.

The Ukrainian case suggests that Taiwan should learn to think in terms of “combined attacks” and “whole-of-society resilience.” Ukraine has faced not only cyberattacks, but simultaneous pressure on government digital services, power systems, and physical infrastructure. Ukraine can locate off-site backups in European Union countries—but what can Taiwan do? Comparing these real-world cases further underscores the need for Taiwan to think ahead about cross-domain collaboration: whether data center control layers can operate within Taiwan, how essential traffic should be allocated, and how central and local governments can coordinate with one another during outages of different scales.
