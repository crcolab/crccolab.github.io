---
title: "CRC Digital Resilience Forum: Simulating a Drastic Drop in Taiwan's International Internet Traffic"
date: 2026-03-25
category: NOTE
summary: "Speakers and further reading from CRC's March 2026 Digital Resilience Forum."
author: Cheng Peng
author_slug: cheng
layout: idea-rich
deck_url: "https://paulpengtw.github.io/crc-march-25-decks/"
deck_label_navigate: "← → to switch slides"
deck_label_fullscreen: "View fullscreen"
deck_label_mobile: "View interactive deck"
deck_label_mobile_hint: "Best viewed on a desktop or tablet"
---

Original slides and materials published at <https://paulpengtw.github.io/crc-march-25-decks/>.

## Topic Outline

At the March 2026 Digital Resilience Forum, Cheng Peng presented a simulation titled "Degradation of Taiwan's International Internet Traffic." The scenario: submarine cables severed by an earthquake, causing Taiwan to instantly lose 50% of its international bandwidth (*note 1). The talk then walks through the cascade of failures likely to appear within the first six hours, VoIP calls (LINE voice, Messenger voice) dropping, web pages freezing, apps breaking one after another, accounts logging out, and the maddening experience of full Wi-Fi bars yet nothing loading.

This talk aims to explain the possible causes behind these network failures and what paths might mitigate their impact.

*Note 1: Losing half the submarine cables does not equal losing half the international internet traffic.

<div class="phase-header">
  <span class="phase-badge phase-badge--1">0–5 min</span>
  <h2>Phase 1: Why Did Voice Calls Suddenly Drop?</h2>
</div>

### What You Might Experience

- LINE voice call → robotic audio → disconnected ☎️❌
- Instagram → blank screen
- Google Drive → half-loaded, stuck
- Glance at the top-right corner

**Wi-Fi signal: full bars 📶**

### "Is It the Wi-Fi Router or the Internet?"

Full Wi-Fi bars ≠ working internet

<div style="margin-top: 1em; text-align: left;">
  <p>📱 → 📡 <strong>Wi-Fi</strong>: your phone to your home router</p>
  <p style="color: #aaa;">This part is perfectly fine ✓</p>
</div>

<div style="text-align: left;">
  <p>📡 → 🌏 <strong>Internet</strong>: your router to the rest of the world</p>
  <p style="color: #e74c3c;">This is where the problem lies ✗</p>
</div>

The problem isn't at home, it's on the **ocean floor**.

### What Is the Internet, Really?

Think of the internet as a system of **thousands of post offices**.

<div style="margin-top: 1em;">
  <p>🏣 Each post office = a network node (ISP, data center)</p>
</div>

<div>
  <p>✉️ Your data = individual letters (packets)</p>
</div>

<div>
  <p>🛣️ Post offices are connected by many routes for relaying letters</p>
</div>

Sending a letter from Taipei to Tokyo means it passes through several post offices, relayed from one to the next.

The internet isn't a single line, it's many nodes relaying data to each other. Each ISP and data center is like a post office. Your data is like letters, forwarded hop by hop to the destination.

### How Does a Post Office Know Where to Send a Letter?

Every post office has a **signboard** out front 🪧

<div style="margin-top: 0.5em; background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">"Going to Japan? → Hand it to the post office to the south"</p>
  <p style="text-align: left;">"Going to the US? → Hand it to the post office to the east"</p>
  <p style="text-align: left;">"Going to Kaohsiung? → Hand it to the one next door"</p>
</div>

This signboard, in networking, is called a **routing table**.

The way post offices keep each other's signboards up to date is called **BGP** (Border Gateway Protocol).

A routing table is each network node's "directional guide." BGP is the protocol the global internet uses to synchronize routing information. No need to memorize the jargon, just remember: BGP = the system through which post offices notify each other "how to get there."

### Cables Cut = Routes Cut

The light beams inside the fiber **vanish instantly** (they're severed, after all).

The post office nearest to the break is the first to notice: <span style="color: #e74c3c;">"This route is down!"</span>

It immediately broadcasts to its neighbors: "Attention everyone! The southbound route is broken! Stop sending letters this way!"

<p style="color: #f39c12;">The message starts spreading from one post office to the next…</p>

Submarine cables are fiber optic. When severed, the optical signal disappears instantly, not a gradual fade, but an immediate zero. The router (post office) connected to that cable detects the link failure and announces via BGP to its neighbors: this route is no longer valid. That announcement ripples outward across the global internet.

### The Chaos of Rerouting

<p style="color: #aaa;">BGP Reconvergence</p>

Thousands of post offices worldwide receive the news, but not **simultaneously**.

<div style="margin-top: 0.8em; background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">🏣 Post office A has already updated its signboard ✓</p>
  <p style="text-align: left;">🏣 Post office B doesn't know the route is down yet ✗</p>
  <p style="text-align: left;">🏣 Post office C got the message but is still computing new routes ⏳</p>
</div>

Your letters end up…

- Sent down a route that's already broken → **lost**
- Bouncing back and forth between two post offices → **looping**
- No post office willing to accept them → **returned**

<p style="color: #f39c12;">This chaotic period: 30 seconds to several minutes</p>

BGP reconvergence is the process by which the entire internet reaches a new consensus. The problem: information propagation has latency, and different nodes update at different speeds. During this transition, routing tables are in an inconsistent state, some routers think the old route still exists, others have already switched. This causes packets to be dropped, looped, or sent into dead ends. Duration depends on network topology complexity and BGP convergence speed.

### To You, It Probably Feels Like, Everything Is Down

<div style="margin-top: 1em; text-align: left;">
  <p>Packets dropped → web pages may not load</p>
  <p>Packets rerouted the long way → latency may jump from 20ms to 2000ms</p>
  <p>Packets looping → may never reach the destination</p>
</div>

50% of international traffic is technically still there, but until routing reconverges, for the average person it may feel like **total gridlock**.

50% of capacity remains, but during BGP convergence it's nearly unusable. It's like a major highway pileup, the next lane is still open, but because the signs are scrambled, every car is stuck at the interchange. Once BGP converges (all signboards are consistent again), the remaining 50% can actually be utilized, but then congestion becomes the next problem.

### LINE Voice May Drop, but Text Might Survive?

<div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap;">
  <div style="background: rgba(46,204,113,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p style="font-size: 1.2em;">💬 Text messages</p>
    <p>Tiny packets (maybe just a few KB)</p>
    <p>Can squeeze through gaps in the chaos</p>
    <p>A few seconds' delay doesn't matter</p>
  </div>
  <div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p style="font-size: 1.2em;">🎙️ Voice calls</p>
    <p>Continuous real-time streams</p>
    <p>Dropping a few packets = robotic voice</p>
    <p>Latency over 300ms = call drops</p>
  </div>
</div>

<div style="margin-top: 1.2em; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 0.8em;">
  <p>What we're not sure about:</p>
  <p style="color: #e74c3c;">
    LINE's call servers <strong>might be in Japan?</strong><br>
    Voice calls within Taiwan <strong>might have to cross the ocean</strong> to connect?
  </p>
</div>

<div class="phase-header">
  <span class="phase-badge phase-badge--2">5–30 min</span>
  <h2>Phase 2: Zombie Internet</h2>
</div>

Entering Phase 2. BGP has finished reconverging and routing has stabilized. But people will notice: the internet is "alive" yet almost unusable. This phase explains two things: congestion collapse and the Trombone Effect.

### What You Might Experience

- Web pages half-loaded… stuck
- Images half-rendered, the rest just gray
- YouTube possibly spinning forever
- LINE text barely sending, taking ages to deliver

Signal is full 📶, appears "connected," **but may be too slow to use**.

Unlike Phase 1 (complete disconnection during BGP convergence), this is "connected but extremely slow", which is actually more confusing. People keep refreshing and retrying, which only makes things worse.

### Wait, Wasn't the Route Fixed?

BGP reconvergence complete ✓, all post office signboards are consistent now.

The remaining 50% of international traffic works normally ✓, routes are open, letters can be delivered.

<p style="color: #f39c12;">So why is it still this slow?</p>

The routes aren't broken, they're just <strong style="color: #e74c3c;">too crowded</strong>.

The previous phase's problem was "scrambled signboards" (BGP convergence). This phase's problem is "too few lanes, too many cars" (congestion collapse). Two completely different failure mechanisms, but to users they feel about the same.

### Imagine a Highway

Taiwan's international traffic = a **10-lane** highway 🛣️

Normally, traffic fills about **7–8 lanes**, there's room to spare, everyone moves smoothly.

<p style="color: #e74c3c;">Losing 50% of capacity = suddenly only <strong>5 lanes</strong></p>

But traffic volume hasn't changed, **same number of cars, half the road**.

Highway analogy for congestion. Normally, submarine cable utilization is around 40–60%, so there's headroom. After losing half, the remaining capacity is instantly saturated. Traffic doesn't decrease just because there are fewer lanes.

### The Chain Reaction of Gridlock

<p style="color: #aaa;">Why isn't it "half as fast" but rather "barely moving"?</p>

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">🚗 Too many cars, some can't merge → <strong>packets dropped</strong></p>
  <p style="text-align: left;">🔄 Dropped cars say "Let me try again!" → <strong>back on the road</strong></p>
  <p style="text-align: left;">🚗🚗🚗 Everyone retrying → <strong>even more cars on the road</strong></p>
  <p style="text-align: left;">💥 More cars dropped → more retries → <strong>vicious cycle</strong></p>
</div>

<p style="color: #e74c3c;">This is called "congestion collapse"<br><span style="color: #aaa;">Congestion Collapse</span></p>

This is the core mechanism of congestion collapse. TCP retransmits when it detects packet loss. But when all connections retransmit simultaneously, they generate even more traffic, worsen the congestion, cause more packet loss, and trigger more retransmissions. This vicious cycle is congestion collapse.

### Understanding It Through Letters

<p style="color: #aaa;">(Continuing the post office analogy)</p>

You sent a letter to the US ✉️

Too much traffic on the route, the letter was lost → you never got a reply.

You think: "Probably got lost, let me send another!", your computer thinks the same way (TCP retransmission).

<p style="color: #f39c12;">Now imagine 23 million people in Taiwan, all with their phones "sending another" at the same time…</p>

<p style="color: #e74c3c;">🏔️ Letter avalanche</p>

TCP retransmission works great under normal conditions, occasionally drop a packet, just resend it. But under total congestion, everyone resending simultaneously becomes a disaster. It's like everyone honking and cutting lanes during a traffic jam, it only makes things worse.

50% physical capacity ≠ 50% usable bandwidth. Due to the nonlinear effects of congestion collapse, once link utilization exceeds a certain threshold, effective throughput drops sharply. Some studies show that under severe congestion, effective bandwidth utilization can drop to 15–20%.

### What Your Experience Might Look Like

<div style="text-align: left;">
  <p>📄 Web pages → text may load, but images spin forever</p>
  <p>🎬 Video → possibly 240p pixelated, constantly buffering</p>
  <p>📥 Downloads → speeds may drop from 100 Mbps to 2 Mbps</p>
  <p>📱 Apps → may open, but every action takes 10+ seconds</p>
</div>

Not disconnected, but **slow enough to make you cry** qq

This is the concrete impact of congestion collapse. "Too slow to use" is worse than "completely offline," because you keep retrying, keep waiting, wasting huge amounts of time. And you can't tell if it's your problem or the entire network.

### The Next Problem Is Even Stranger

Some websites have servers **physically in Taiwan**, theoretically don't need international routes, and shouldn't be affected.

<p style="color: #e74c3c;"><strong>But they may also be broken</strong> 🤯</p>

Why?

Congestion collapse explains "why international traffic is slow." But next we need to explain an even more bizarre phenomenon: why services whose servers are in Taiwan, requiring no submarine cables, are also broken. This is where the Trombone Effect comes in.

### 🏪 The Convenience Store Story

There's a 7-Eleven on your street corner. You want to buy a bottle of water.

Normally: 🏠 → 🚶 30-second walk → 🏪 Done!

It's like connecting to a **server in Taiwan** from Taiwan, data doesn't need to cross the ocean, it stays on the island.

The convenience store analogy explains the Trombone Effect. Server is in Taiwan, you're in Taiwan, data transfers directly within the island. As simple as walking to your corner 7-Eleven.

### But Some ISPs Say…

<div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px;">
  <p>"No! You can't just go to the one on your corner!"</p>
</div>

Some ISPs dictate this route:

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p>
    🏠 Your home<br>
    → ✈️ First, fly to <strong>Tokyo</strong><br>
    → 🏪 Check out at a Tokyo 7-Eleven<br>
    → ✈️ Fly back to Taiwan<br>
    → 🏠 Get your water
  </p>
</div>

<p style="color: #f39c12;">All for a bottle of water available on your street corner 🤦</p>

Your request is forced overseas and back. The server is right next to you, but your ISP's routing configuration sends the traffic to Japan or Hong Kong before looping it back, absurd indeed.

### Why Do Some ISPs Route This Way?

Because Taiwan's ISPs **don't "shake hands" locally**.

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px; text-align: left;">
  <p>🤝 <strong>Peering</strong>: two providers agree, "your users can directly reach my servers"</p>
  <p style="margin-top: 0.5em;">🏢 <strong>Internet Exchange</strong>: a place where everyone comes to shake hands</p>
</div>

<p style="color: #e74c3c;">Problem: some Taiwan ISPs aren't keen on shaking hands with others<br><span style="color: #aaa;">or they share very little traffic</span></p>

Explaining peering and Internet Exchange concepts. "Handshake" as an analogy for peering. TPIX is one of Taiwan's internet exchange points, in theory, ISPs can directly exchange traffic there without routing overseas. But in practice, many ISPs (especially large ones) refuse to peer at TPIX, believing their network is big enough not to need to "shake hands" with smaller ones, or they show up but only open minimal bandwidth.

### You Don't Notice Under Normal Conditions

The detour through Tokyo only adds **20–30 milliseconds**, you wouldn't notice the difference.

So some ISPs think: "Users won't notice anyway, why spend money on local peering?"

<p style="color: #e74c3c;">Until the cables go down: <strong>that overseas detour is now jammed</strong></p>

<p style="color: #f39c12;">Your bottle of water is stuck in a queue on the Tokyo airport runway</p>

### Result: Server Right Next to You, but You Can't Connect

<div style="display: flex; justify-content: center; gap: 1.5em; flex-wrap: wrap;">
  <div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px; min-width: 200px; text-align: center;">
    <p>📍 Server location</p>
    <p style="font-weight: bold;">Taipei, Neihu</p>
    <p style="color: #aaa;">10 km from you</p>
  </div>
  <div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px; min-width: 200px; text-align: center;">
    <p>📍 Actual route your data takes</p>
    <p style="font-weight: bold;">Taipei → Tokyo → Taipei</p>
    <p style="color: #aaa;">A 4,000 km detour</p>
  </div>
</div>

<p style="color: #e74c3c;">International congestion → detour jammed → you can't reach a server 10 km away</p>

This is **tromboning** 🎺, the "trombone effect": data loops around like the slide of a trombone.

### Two Main Bottlenecks of This Phase

<div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap;">
  <div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 380px;">
    <p style="color: #e74c3c;">❶ Massive Gridlock</p>
    <p>50% capacity ≠ 50% speed<br>Usable bandwidth may drop to just <strong>15–20%</strong></p>
  </div>
  <div style="background: rgba(243,156,18,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 380px;">
    <p style="color: #f39c12;">❷ Massive Detours</p>
    <p>Insufficient domestic peering<br>Domestic traffic forced overseas<br>Even <strong>local servers</strong> affected</p>
  </div>
</div>

These two problems combined: **"having internet" may not mean "usable internet."**

Summarizing the two core concepts of this phase. Congestion collapse: the nonlinear relationship between physical capacity and actual usable bandwidth. Trombone Effect: routing policies causing traffic that shouldn't cross the ocean to also suffer. Together, they create "zombie internet", looks alive, practically unusable.

### But It May Get Even Worse…

The services still working, maybe Google Search occasionally returns results, some web pages are still viewable, they're still alive possibly because of **"caching"**: copies previously stored in Taiwan that still work temporarily.

But caches have **expiration dates**…

<p style="color: #e74c3c;"><strong>When they expire, services may break one by one ⏳</strong></p>

Many services still functioning are relying on CDN caches. Caches have TTLs (time-to-live); once expired, they must fetch fresh data from overseas origin servers. But with submarine cable congestion, the fetch fails → cache expires → service goes down. This pattern of "gradual degradation" is explained in detail in the next phase.

<div class="phase-header">
  <span class="phase-badge phase-badge--3">30–60 min</span>
  <h2>Phase 3: It Was Just Working, Why Is It Broken Again?</h2>
</div>

Entering Phase 3. Congestion has stabilized, ISPs have started traffic management. But people notice a peculiar phenomenon: things that were working start breaking one by one. This phase explains three mechanisms: CDN cache expiry, Auth Token expiry, and DNS cache expiry. The "gradual degradation" caused by these three mechanisms is more dangerous than total disconnection, because it makes it impossible to pinpoint where the problem lies.

### What You Experience

- Google Drive was working a moment ago, now it's stuck
- News sites show text but all images are gone
- LINE may crash and you can't log back in
- Banking app asks you to re-enter your password, then spins forever

Not everything breaks at once, **they break one by one**, seemingly at random.

This kind of "gradual failure" is the most confusing. Total disconnection actually lets people know "the internet is down" and prompts them to find alternatives. But when things break one at a time, some still working, some not, people keep retrying, wasting time, and growing more anxious. Next we explain why things "break one by one." The answer: three different "expiration timers" are all counting down simultaneously.

### Back to the Convenience Store

Your neighborhood **7-Eleven** 🏪, the shelves have "copies" of drinks, bento boxes, and snacks.

Where do these products come from? **Overseas warehouses** 🚢, the 7-Eleven doesn't make anything; it stocks goods from warehouses and puts them on shelves for you.

The digital world works the same way. **CDN** is your neighborhood's digital convenience store (Content Delivery Network).

CDN = Content Delivery Network. Companies like Cloudflare, Akamai, and CloudFront have "edge nodes" in Taiwan. These nodes are like convenience stores: they copy content from overseas servers and store it locally in Taiwan, so users don't have to fetch from overseas every time. The web page images, CSS, and JavaScript files you browse often come from CDN nodes in Taiwan.

### Expiration Date: TTL

<p style="color: #aaa;">Time To Live</p>

Convenience store bento boxes have **expiration dates**, once expired, they can't be sold and must be restocked from the warehouse.

CDN caches have a similar expiration mechanism called **TTL** (Time To Live: how long this copy remains valid).

TTL might be **5 minutes** or **24 hours**, every website and every file has different settings.

<p style="color: #f39c12;">For the first 30 minutes, most caches haven't expired yet, so things "still work." Now, expiration dates are starting to hit one by one.</p>

TTL is set by the server, telling the CDN "how long this copy can be used." A news site's homepage images might have a TTL of just 5 minutes (needs real-time updates). A jQuery library might have a TTL of 1 year (rarely changes). In the first 30 minutes after the cable break, most caches are still within their validity period, so users feel things are "okay." But as time passes, various caches' TTLs expire one by one, and problems start appearing.

### The Convenience Store Can't Restock

Bento boxes on the shelf have expired → time to restock from the warehouse.

<p style="color: #e74c3c;">But the road to the warehouse is jammed 🚛💨</p>

(International traffic congestion = extremely slow international connections)

The restocking truck has departed… but is stuck in traffic and can't get back. The CDN requests fresh data from the overseas origin server → timeout → failure.

<p style="color: #e74c3c;"><strong>Expired cache + can't restock = empty shelves</strong></p>

When a CDN cache's TTL expires, the CDN node sends a revalidation request to the overseas "origin server." Normally this takes just milliseconds. But now international connections are congested, the request either times out or responds extremely slowly. The CDN can't get new data, so it can't continue serving content; users see a loading failure.

### Why Can Some Things Load but Not Others?

<div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap; margin-top: 0.8em;">
  <div style="background: rgba(46,204,113,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p>✅ Still viewable</p>
    <p style="color: #aaa;">Popular YouTube videos<br>Commonly used website CSS/JS<br>News images everyone's viewing</p>
    <p style="color: #2ecc71;">→ Cache recently refreshed, TTL not yet expired</p>
  </div>
  <div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p>❌ Can't view</p>
    <p style="color: #aaa;">Niche pages, old articles<br>Documents you haven't opened in a while<br>Real-time content with short TTLs</p>
    <p style="color: #e74c3c;">→ Cache expired, restock failed</p>
  </div>
</div>

This is why **some parts of the same website work while others don't**, leading people to think the site is broken, when really it's just different cache expiration times.

This explains why users feel the failures are "random." On the same website, HTML text might have a 24-hour cache TTL (still valid), but images might have just a 1-hour TTL (already expired). So you see text appearing but all images blank, a bizarre sight. Content accessed by more people stays "fresher" because restocking is constantly triggered. Niche content is the opposite, the cache has likely expired long ago.

### What Is an Auth Token?

Imagine going to an **amusement park** 🎢

At the entrance, you **buy a ticket and verify your identity**, then a staff member stamps your hand with a **stamp**.

Using the amusement park analogy to explain Auth Tokens. This concept is unfamiliar to non-technical audiences, but it's key to understanding "why apps log you out one by one."

### The Stamp on Your Hand = Auth Token

With the stamp, you can:

- Ride the roller coaster 🎢, show the staff your stamp ✓
- Ride the carousel 🎠, show stamp ✓
- Buy park food 🍔, show stamp ✓

No need to re-queue, re-purchase tickets, or re-verify your identity each time. The stamp represents "this person has already been verified."

**An Auth Token is that stamp on your hand.** After logging into Google, your browser receives a "stamp", then opening Gmail, Drive, or YouTube doesn't require logging in again.

Auth Token is this "stamp." You log into Google once, and your browser gets a token. Every subsequent request to Gmail, Google Drive, or YouTube includes this token. The server sees the token and knows "this is an authenticated user" without asking for your password each time.

### But the Stamp Fades

The amusement park's stamp uses <strong style="color: #f39c12;">special ink</strong>, after 15 minutes to 1 hour, the stamp fades and becomes invisible.

Why not use permanent ink?

<div style="background: rgba(231,76,60,0.1); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">🔒 If someone <strong>copies your stamp</strong> (token stolen)</p>
  <p style="text-align: left; color: #aaa;">Fading ink → the thief can use it for 15 minutes at most</p>
  <p style="text-align: left; color: #aaa;">Permanent ink → the thief can <strong>impersonate you forever</strong></p>
</div>

So tokens are intentionally designed to expire: it's a security mechanism.

Tokens being short-lived is a deliberate security decision. If a token were valid forever, once stolen (e.g., via XSS attack, man-in-the-middle attack), the attacker could impersonate you permanently. Short-lived tokens limit the damage of theft: even if stolen, it expires in 15 minutes. It's like a credit card expiration date, not for your convenience, but to limit the risk of fraud.

### Stamp Faded? Go Back to the Ticket Booth

Stamp faded → walk back to the entrance ticket booth 🎫, show your season pass, staff re-stamps your hand. The whole process takes seconds; you barely notice.

Normally, this is a total non-issue, the app automatically "re-stamps" you in the background without you ever noticing.

<p style="color: #e74c3c;">But… what if the ticket booth is on the <strong>other side of the ocean</strong>?</p>

Under normal conditions, the "re-authentication" after token expiry happens automatically in the background. The browser or app uses a refresh token (like a season pass) to request a new access token from the authentication server. The entire process takes a few hundred milliseconds, users are completely unaware. But the critical question is: where is the authentication server?

### The Ticket Booth Is Across the Ocean

- Google's authentication server is likely in 🇺🇸 the US
- LINE's authentication server is likely in 🇯🇵 Japan
- Microsoft's authentication server is likely in 🇺🇸 the US

Your stamp faded → you may need to cross the ocean to get re-stamped.

<p style="color: #e74c3c;">But international traffic is congested = that route is jammed 🚗🚗🚗</p>

The re-stamp request was **sent… but the reply can't get back**, waited 30 seconds → timeout → failed.

<p style="color: #e74c3c;"><strong>You've been logged out. And you can't log back in.</strong></p>

This is the core Auth Token problem during a submarine cable event. Google's OAuth authentication servers are primarily in the US (accounts.google.com resolves to US IPs). LINE's authentication goes through Japanese servers. Microsoft's Azure AD is also in the US. When tokens expire and the app tries to re-authenticate with these overseas servers, the international connection is congested, requests time out, and you get logged out. And the login page itself also needs to connect to overseas servers, so even "logging back in" is impossible.

### Everyone Gets Logged Out at Different Times

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">
    ⏱️ 20 min after cable break: <span style="color: #e74c3c;">Google Drive</span> stamp may have faded → possibly logged out<br>
    ⏱️ 35 min after: <span style="color: #e74c3c;">LINE</span> stamp may have faded → may crash and can't log back in<br>
    ⏱️ 45 min after: <span style="color: #e74c3c;">Online banking</span> stamp has faded → asks to re-login → fails<br>
    ⏱️ 50 min after: <span style="color: #e74c3c;">Company Slack</span> stamp may have faded → possibly disconnected entirely
  </p>
</div>

<p style="color: #f39c12;">This is why it seems "completely random", because each app's stamp fades at a different time.</p>

Each service has a different token validity period: Google is typically 1 hour, some banking apps 15 minutes. And each user logged in at a different time, so tokens expire at different times. This creates the chaotic "gradual failure" scenario: your colleague's Google Drive still works (they just logged in), yours doesn't (your token just expired). Everyone asks each other "is yours working?" and gets different answers, even more confusing.

### The True Face of a Token

Technically, a token looks like this:

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px; font-family: monospace; font-size: 0.7em; word-break: break-all; text-align: left;">
  eyJhbGciOiJSUzI1NiJ9.<span style="color: #3498db;">eyJ1c2VyIjoi5bCP5piOIiwic2NvcGUiOiJkcml2ZSIsImV4cCI6MTcxMTEyMzQ1Nn0</span>.SflKxwRJSMeKKF2QT4fw
</div>

This is called a **JWT** (JSON Web Token), containing:

<div style="display: flex; justify-content: center; gap: 1.5em; flex-wrap: wrap; margin-top: 0.5em;">
  <div style="background: rgba(52,152,219,0.1); padding: 0.6em 1em; border-radius: 8px;">
    <p style="margin: 0;">👤 Who you are</p>
    <p style="margin: 0; color: #aaa; font-size: 0.8em;">user: Xiao-Ming</p>
  </div>
  <div style="background: rgba(52,152,219,0.1); padding: 0.6em 1em; border-radius: 8px;">
    <p style="margin: 0;">🔑 What you can do</p>
    <p style="margin: 0; color: #aaa; font-size: 0.8em;">scope: drive</p>
  </div>
  <div style="background: rgba(52,152,219,0.1); padding: 0.6em 1em; border-radius: 8px;">
    <p style="margin: 0;">⏰ When it expires</p>
    <p style="margin: 0; color: #aaa; font-size: 0.8em;">exp: 1 hr</p>
  </div>
</div>

The last segment is a **digital signature**: prevents forgery, only the server can generate it.

JWT is the most common token format today. It has three parts (separated by `.`): header (algorithm), payload (content), signature. The middle payload section is base64-encoded, containing JSON data. The key part is the final signature: it's signed with the server's private key, so nobody can forge it. When the server receives a token, verifying the signature confirms whether it issued the token.

### The Life of a Token

<div style="max-width: 90%;">
  <div style="background: rgba(46,204,113,0.1); padding: 0.6em 1em; border-radius: 8px; margin-bottom: 0.5em;">
    <p style="text-align: left; margin: 0;">1️⃣ <strong>Login</strong>: enter username & password → server gives you two things</p>
    <p style="text-align: left; margin: 0; color: #aaa; font-size: 0.9em;">　　Access Token (entry stamp) valid for 15 min–1 hour</p>
    <p style="text-align: left; margin: 0; color: #aaa; font-size: 0.9em;">　　Refresh Token (season pass) valid for days–weeks</p>
  </div>
  <div style="background: rgba(52,152,219,0.1); padding: 0.6em 1em; border-radius: 8px; margin-bottom: 0.5em;">
    <p style="text-align: left; margin: 0;">2️⃣ <strong>In use</strong>: every action carries the Access Token</p>
    <p style="text-align: left; margin: 0; color: #aaa; font-size: 0.9em;">　　Server sees the stamp and lets you through, no need to verify password each time</p>
  </div>
  <div style="background: rgba(243,156,18,0.1); padding: 0.6em 1em; border-radius: 8px; margin-bottom: 0.5em;">
    <p style="text-align: left; margin: 0;">3️⃣ <strong>Stamp fades</strong>: Access Token expires → automatically renewed using Refresh Token</p>
    <p style="text-align: left; margin: 0; color: #aaa; font-size: 0.9em;">　　Done automatically in the background, you never notice</p>
  </div>
  <div style="background: rgba(231,76,60,0.1); padding: 0.6em 1em; border-radius: 8px;">
    <p style="text-align: left; margin: 0;">4️⃣ <strong>Season pass also expires</strong>: Refresh Token expires too → must re-enter username & password</p>
    <p style="text-align: left; margin: 0; color: #aaa; font-size: 0.9em;">　　This is why you occasionally get asked to "log in again"</p>
  </div>
</div>

The standard OAuth 2.0 flow. Access Token is short-lived (like the stamp on your hand), Refresh Token is long-lived (like a season pass). Normally, when the Access Token expires, the app automatically uses the Refresh Token to get a new Access Token from the server. This entire process happens in the background, users notice nothing. Only when the Refresh Token also expires (typically days to weeks) are you asked to re-enter your credentials.

### Why Not Issue a Permanent Pass?

<div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap;">
  <div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p>🔓 If tokens were permanent</p>
    <p style="color: #aaa;">Stolen → attacker impersonates you forever</p>
    <p style="color: #aaa;">Permissions changed → old token still has old permissions</p>
    <p style="color: #aaa;">Left the company → token still works</p>
  </div>
  <div style="background: rgba(46,204,113,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p>🔒 Tokens expire periodically</p>
    <p style="color: #aaa;">Stolen → invalid in 15 minutes at most</p>
    <p style="color: #aaa;">Permissions changed → updated at next renewal</p>
    <p style="color: #aaa;">Left the company → token naturally expires</p>
  </div>
</div>

Token expiration isn't a design flaw, it's a <strong style="color: #2ecc71;">security mechanism</strong>, like periodically changing door lock codes: inconvenient, but more secure.

This is the fundamental trade-off between security and convenience. A permanent token is like a key that never gets changed, convenient, but once copied, you're done. Short-lived tokens are like periodically changed passcodes, annoying, but damage from a breach is limited. Under normal network conditions, the trade-off makes sense: re-authentication takes just a few hundred milliseconds, invisible to users. But during a submarine cable event, the "re-authentication" step suddenly becomes a fatal weakness.

### The Chain Reaction During a Cable Break

<div style="max-width: 90%;">
  <div style="border-left: 3px solid #3498db; padding-left: 1em; margin-bottom: 0.5em;">
    <p style="margin: 0;">Access Token expires</p>
    <p style="margin: 0; color: #aaa; font-size: 0.9em;">App may attempt to use Refresh Token in the background for a new one</p>
  </div>
  <div style="border-left: 3px solid #f39c12; padding-left: 1em; margin-bottom: 0.5em;">
    <p style="margin: 0;">Refresh request possibly sent to overseas auth server</p>
    <p style="margin: 0; color: #aaa; font-size: 0.9em;">But international connection is congested… waiting 10 sec, 20 sec…</p>
  </div>
  <div style="border-left: 3px solid #e74c3c; padding-left: 1em; margin-bottom: 0.5em;">
    <p style="margin: 0; color: #e74c3c;">Timeout failure ✗</p>
    <p style="margin: 0; color: #aaa; font-size: 0.9em;">App determines "authentication invalid" → possibly forces logout</p>
  </div>
  <div style="border-left: 3px solid #e74c3c; padding-left: 1em; margin-bottom: 0.5em;">
    <p style="margin: 0;">Login page appears → you enter your credentials</p>
    <p style="margin: 0; color: #e74c3c; font-size: 0.9em;">But the login page itself may need to connect to overseas servers → also times out ✗</p>
  </div>
</div>

<p style="color: #e74c3c;"><strong>Logged out, and possibly can't log back in.</strong></p>

This is a cascading failure:
1. Access Token expires (normal mechanism)
2. Refresh request times out due to congestion (abnormal)
3. App determines authentication is invalid, forces logout (normal response)
4. User tries to log back in, but the login flow itself also requires international connectivity (fatal weakness)

Especially for OAuth login flows, the "Sign in with Google" button connects to accounts.google.com, and that server is in the US. So you can't even open the login page.

### Your Apps May Be Logging Out One by One

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">
    <span style="color: #2ecc71;">t+0 min</span>　International traffic drops: all Token timers start counting down<br>
    <span style="color: #2ecc71;">t+15 min</span>　<span style="color: #aaa;">Banking token expires → logged out</span><br>
    <span style="color: #f39c12;">t+25 min</span>　<span style="color: #aaa;">Slack token expires → possibly offline</span><br>
    <span style="color: #f39c12;">t+35 min</span>　<span style="color: #aaa;">LINE needs re-verification → possibly fails</span><br>
    <span style="color: #e74c3c;">t+45 min</span>　<span style="color: #aaa;">Google Drive token expires → possibly can't access files</span><br>
    <span style="color: #e74c3c;">t+60 min</span>　<span style="color: #aaa;">Possibly almost all authenticated services have failed</span>
  </p>
</div>

A "single disconnection" is unlikely to happen, <strong style="color: #e74c3c;">it's more like a slow-motion mass logout</strong>. Different people, different apps, different times: it looks completely random.

This is a timeline summary of the entire auth token story. The key takeaway: it's not as simple as "the internet went down." There's an invisible countdown timer running inside every app, and the moment it hits zero, that app "dies." And because every service has a different token validity period and every person logged in at a different time, the whole process looks completely random and without pattern.

### Next Up: DNS

CDN cache expires → content disappears. Auth Token expires → logged out.

<p style="color: #f39c12;">There's a third thing also counting down…</p>

And if this one breaks, **you can't even find where the website is**.

The previous two problems were "can't get content" and "can't authenticate identity." The third is even more fundamental: "can't even look up the address." So we need to explain from the very basics.

### What Is DNS? The Internet's Phone Book

You type **google.com** into your browser, but your computer doesn't understand "google.com."

Computers only understand **numeric addresses**: <span style="color: #3498db;">142.250.185.46</span>, this is called an IP address, like a phone number, every server has one.

**DNS** = a phone book 📒, translating "names" to "phone numbers" (google.com → 142.250.185.46).

<p style="color: #f39c12;">Without this phone book, even knowing someone's name doesn't let you call them.</p>

DNS = Domain Name System. We use domain names to browse the internet, but computers communicate using IP addresses. DNS is the translation layer in between, converting human-readable names into computer-readable numbers. Without DNS, you'd have to memorize every website's IP address to go online, like having to memorize everyone's phone number without a contact list.

### How Does DNS Lookup Work? Like Calling Directory Assistance

Your phone wants to find **google.com**'s phone number:

<div style="max-width: 90%;">
  <div style="border-left: 3px solid #3498db; padding-left: 1em; margin-bottom: 0.4em;">
    <p style="margin: 0;">1️⃣ First, check your own contacts (local cache)</p>
    <p style="margin: 0; color: #aaa; font-size: 0.85em;">If you've looked it up before, use it directly, no need to ask anyone</p>
  </div>
  <div style="border-left: 3px solid #3498db; padding-left: 1em; margin-bottom: 0.4em;">
    <p style="margin: 0;">2️⃣ Not there → call your ISP's directory service (DNS resolver)</p>
    <p style="margin: 0; color: #aaa; font-size: 0.85em;">Your ISP has a server dedicated to looking up numbers for you</p>
  </div>
  <div style="border-left: 3px solid #3498db; padding-left: 1em; margin-bottom: 0.4em;">
    <p style="margin: 0;">3️⃣ ISP doesn't have it either → ask all the way up to "headquarters"</p>
    <p style="margin: 0; color: #aaa; font-size: 0.85em;">Root Server → .com administrator → google.com's authoritative server</p>
  </div>
  <div style="border-left: 3px solid #2ecc71; padding-left: 1em;">
    <p style="margin: 0; color: #2ecc71;">4️⃣ Found it! Save the result in your contacts for next time</p>
    <p style="margin: 0; color: #aaa; font-size: 0.85em;">This is "DNS caching": remember the result to avoid calling every time</p>
  </div>
</div>

DNS lookup hierarchy:
1. Local cache (your device remembers previous lookups)
2. ISP's DNS resolver (like 8.8.8.8 or your ISP's DNS)
3. Root servers → TLD servers (managing .com) → authoritative servers (google.com's administrator)

Normally, this entire process takes just tens of milliseconds. And results are cached at each level, so next time you don't have to start from scratch. But caches also have expiration dates.

### DNS Cache Also Has an Expiration Date

The phone numbers in your contacts also "expire", google.com's TTL might be set to 300 seconds (5 minutes), some .tw websites might be set to 3600 seconds (1 hour).

Why not remember permanently? Because servers might move (change IP), do load balancing, or perform failover. If you always use the old number, you might be calling a disconnected line.

<p style="color: #f39c12;">So DNS caches also have TTL: once expired, you must <strong>look up the number again</strong>, normally takes tens of milliseconds, completely unnoticeable.</p>

DNS record TTLs are set by website administrators. Large websites typically have short TTLs (minutes) because they need to frequently adjust traffic distribution. Small websites may have longer TTLs (hours to a day). Under normal conditions, DNS re-lookup is very fast, but during a submarine cable event, many websites' authoritative DNS servers are overseas, making re-lookups travel through congested international connections.

### DNS Cache Expires = Can't Find the Address

Imagine a website **service.gov.tw** with its server right in Taipei 🏢.

Your device looked it up before, your contacts have its IP → connection works, fast ✓

But the DNS cache has expired: time to look up the number again. Where's the authoritative DNS server? <span style="color: #e74c3c;">Possibly in the US (e.g., AWS Route 53)</span>

<p style="color: #e74c3c;">The lookup call can't get through → you <strong>can't find the address</strong>, the server is just 10 km away, but you can't find it.</p>

The server isn't down, the internet isn't cut, <strong style="color: #f39c12;">you've just forgotten the address, and you can't ask anyone</strong>.

This is the most ironic DNS cache scenario: a .tw website, server physically in Taiwan, data in Taiwan, no international connection needed at all. But its authoritative DNS server uses AWS Route 53 (in the US). When your DNS cache expires and you need to re-query, the query request has to reach the US, through congested submarine cables, and then times out. Result: a completely domestic service, unreachable because the DNS can't be resolved. This is the concept of "dependency chains", on the surface it's a domestic service, but it hides overseas dependencies.

<div class="phase-header">
  <span class="phase-badge phase-badge--4">1–6 hr</span>
  <h2>Phase 4 and Beyond: Control Plane Depends on Overseas</h2>
</div>

Entering Phase 4. The cable break happened over an hour ago. BGP reconverged long ago, congestion has stabilized, and the "gradual degradation" from various cache and token expirations has mostly run its course. But people notice a new phenomenon: some things are starting to recover, while others are completely dead. This phase explains two things: (1) ISPs begin manual traffic management, (2) cloud "control planes" depend on overseas infrastructure. Together, they create a new dividing line: purely domestic services come back to life; services with an overseas "brain" stay dead.

### What You Experience

- LINE text messages: possibly working again! ✅
- Some previously visited web pages: possibly viewable
- YouTube: possibly watchable, but maybe only at 144p pixelated quality
- Instagram: possibly text only, all images are gray boxes 🖼️❌
- Logging into any SaaS tool: possibly spinning, failing
- AWS / GCP admin console: possibly completely inaccessible

A **new dividing line** emerges, what works vs. what doesn't depends on where the service's "brain" is located.

The key feeling at this phase is "unfairness": why are some things recovering while others are getting worse? LINE text recovers because ISPs start traffic management, giving messages high priority. SaaS and cloud admin consoles are completely dead because their "control planes" are overseas. Next, we explain in two parts: (1) what ISPs are doing, (2) the "brain overseas" problem of cloud services.

### What Are ISPs Doing Behind the Scenes?

Imagine an **emergency room** 🏥

During a major disaster, **a surge of patients floods the ER**, doctors are limited, can't treat everyone at once, so the ER uses **triage**.

Using the ER analogy to explain ISP traffic engineering. After the cable break, international bandwidth is halved, but traffic demand hasn't decreased, like a surge of patients but not enough doctors. ISP network engineers must manually intervene to decide which traffic gets priority. This is the internet's version of "triage."

### Triage: Who Gets Treated First?

<div style="display: flex; justify-content: center; gap: 1em; flex-wrap: wrap;">
  <div style="background: rgba(231,76,60,0.15); padding: 0.8em; border-radius: 8px; flex: 1; min-width: 180px; max-width: 250px; border-left: 4px solid #e74c3c;">
    <p style="color: #e74c3c;">🔴 Likely highest priority</p>
    <p style="color: #aaa; font-size: 0.85em;">DNS queries<br>Government websites<br>Instant messaging (LINE text)<br>Financial transactions</p>
  </div>
  <div style="background: rgba(243,156,18,0.15); padding: 0.8em; border-radius: 8px; flex: 1; min-width: 180px; max-width: 250px; border-left: 4px solid #f39c12;">
    <p style="color: #f39c12;">🟡 Likely secondary priority</p>
    <p style="color: #aaa; font-size: 0.85em;">General web browsing<br>Email<br>Low-resolution streaming</p>
  </div>
  <div style="background: rgba(46,204,113,0.15); padding: 0.8em; border-radius: 8px; flex: 1; min-width: 180px; max-width: 250px; border-left: 4px solid #2ecc71;">
    <p style="color: #2ecc71;">🟢 Likely deferrable</p>
    <p style="color: #aaa; font-size: 0.85em;">YouTube HD<br>Instagram images/video<br>Software updates<br>Cloud backups</p>
  </div>
</div>

ISP engineers **may manually intervene**, deciding whose packets get priority, this is why some things "recover" while others get even slower.

ISP traffic management (traffic engineering) is mostly automated under normal conditions. But during a submarine cable event, engineers manually intervene to set QoS (Quality of Service) rules. DNS and government websites get the highest priority because DNS is the foundation of all internet services. Instant messaging (LINE text) has small traffic volume but high public impact, so it also gets priority. YouTube and Instagram images/video have massive traffic volumes (high percentage of total traffic) and get deprioritized. This is why you see YouTube quality plummet and Instagram show only text without images.

### Why Might LINE Text Be Working Again?

1️⃣ LINE text messages = **relatively small packets**, one text message is about 1 KB, one Instagram photo is about 2,000 KB, a **2,000x** difference.

2️⃣ ISPs may have listed messaging as **high priority**, small packets + local routing + high priority = can possibly squeeze through ✅

<p style="color: #f39c12;">Instagram images? Large packets + overseas source + possibly deprioritized = possibly spinning 🖼️</p>

LINE text recovery is due to three compounding factors: (1) Extremely small packets, text messages use negligible data; even under extreme congestion they can squeeze through. (2) LINE has peering connections at TPIX (Taiwan Internet Exchange), meaning much of LINE's text messaging actually routes domestically, not even needing submarine cables. (3) ISP traffic management lists instant messaging as high priority, ranked first in triage. All three factors combined, LINE text messages recover. By contrast, Instagram photos are often several MB, sourced overseas, and deprioritized, hence only gray boxes.

### Your Internet May Not Be Broken, It May Be "Managed"

🚦 ISP engineers = **traffic officers at an intersection**

Normal times: green light, all cars pass, you don't even notice the traffic officer.

Crisis times: officer steps out to direct 🖐️, "Ambulance goes first! Bus can pass! Private cars wait!"

Your YouTube may not be "broken", it might have been **asked to yield** to more important traffic.

The key point here is understanding: the "partial recovery" you're experiencing isn't random, it's the deliberate result of ISP engineer decisions. ISPs have the ability to differentiate types of traffic and set priorities. You never notice normally because there's enough bandwidth for everyone to pass. But when bandwidth tightens, ISPs' "choices" directly determine what you can and can't use.

### What Does This Mean? Something You Should Know

<div style="background: rgba(52,152,219,0.1); padding: 1em; border-radius: 8px; text-align: left;">
  <p>ISPs <strong>have the capability</strong> to classify and manage traffic, they know which packets go where and what type they are</p>
</div>

<div style="background: rgba(243,156,18,0.1); padding: 1em; border-radius: 8px; margin-top: 0.8em; text-align: left;">
  <p>This means ISPs' <strong>everyday routing decisions</strong> are also "choices", choosing to route your traffic overseas and back instead of peering locally</p>
</div>

<p style="color: #e74c3c;"><strong>If ISPs can choose who to save in a crisis, it means ISPs are also choosing who to sacrifice in normal times</strong></p>

This is the core insight of the ISP traffic management section. Everyone just saw that ISPs have the ability to classify and prioritize traffic during a crisis, which means ISPs also have this ability during normal times. The Trombone Effect from Phase 2, where ISPs route local traffic to Tokyo and back, isn't a technical limitation, it's a cost-driven choice. Not peering locally at TPIX is also a choice. This section connects Phase 2's critique with Phase 4's observation: ISPs aren't passive pipes, they're actors with capability, choices, and accountability.

### Next: The Cloud Problem

LINE text may be back, some web pages may be viewable, but SaaS tools and cloud services may be **completely dead**.

To understand why, we first need to understand one thing: **what exactly is "the cloud"?** ☁️🤔

Transitioning to the cloud control plane section. Many people's understanding of "the cloud" stays at a vague level, "data is stored on the cloud." We need to explain "the cloud" clearly before we can explain why "cloud in Taiwan" ≠ safe.

### "The Cloud" Is Actually… Someone Else's Computer

You've heard "data is stored in the cloud" ☁️, sounds light, abstract, floating in the sky.

The truth: **your data is stored on someone else's computer.** That computer sits in a massive building with air conditioning, security, and backup generators. That building is called a **"data center."**

Taiwan has such buildings 🏢, both AWS and GCP have data centers in Taiwan. Your data **does** physically reside on Taiwan's soil ✓

First, breaking the abstraction of "the cloud." Many people hear "cloud" and think data floats in some ethereal space. But the cloud is someone else's computer, housed in large data centers. AWS launched a Taiwan region in 2022 (with data center in Banqiao, New Taipei). GCP also has a data center in Changhua. So "data is in Taiwan" is physically true, but what follows explains why that's not enough.

### The Factory and Headquarters

Imagine a **multinational corporation** that built a **factory** in Taiwan:

<div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap;">
  <div style="background: rgba(46,204,113,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 240px; max-width: 320px;">
    <p>🏭 Taiwan factory</p>
    <p style="color: #aaa;">Produces goods (stores your files)</p>
    <p style="color: #aaa;">Ships to customers (responds to your requests)</p>
    <p style="color: #aaa;">Warehouse has raw materials (your data)</p>
    <p style="color: #2ecc71;">→ This is the "Data Plane"</p>
  </div>
  <div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 240px; max-width: 320px;">
    <p>🏢 US headquarters</p>
    <p style="color: #aaa;">Issues employee badges (identity auth, IAM)</p>
    <p style="color: #aaa;">Approves budgets (resource provisioning)</p>
    <p style="color: #aaa;">Signs contracts (SSL certificates)</p>
    <p style="color: #e74c3c;">→ This is the "Control Plane"</p>
  </div>
</div>

<p style="color: #f39c12;">Factory is in Taiwan ✓　But every important decision requires <strong>calling headquarters</strong></p>

Cloud services split into two layers: (1) Data Plane: where data is actually stored and processed, this is in Taiwan. (2) Control Plane: management, authentication, authorization, provisioning, this is usually in the US. Many of AWS's control plane core functions are concentrated in us-east-1 (Virginia). GCP's global control plane has a similar centralized design. The factory can produce goods, but without headquarters' authorization, the factory can't open its doors, can't ship, can't do anything.

### Factory in Taiwan, but the Key May Be in the US

🔑 **Employee needs to enter the factory** (you need to log into AWS) → may need to verify identity with US headquarters (IAM authentication) → request travels via submarine cable to Virginia → <span style="color: #e74c3c;">timeout</span>

📋 **Factory needs to ship** (website needs to renew security certificate) → may need US headquarters to sign the contract (SSL certificate validation) → request travels via submarine cable → <span style="color: #e74c3c;">timeout</span> → HTTPS connection fails

📞 **Customer wants the factory's address** (DNS resolution) → address book may be in the US (Route 53 is in us-east-1) → query travels via submarine cable → <span style="color: #e74c3c;">timeout</span> → can't find the factory

<p style="color: #e74c3c;"><strong>Factory intact, materials stocked, machines running, but the doors just won't open</strong></p>

Three concrete scenarios illustrating control plane dependency impacts: (1) IAM (Identity and Access Management), AWS's identity verification system. Logging into the AWS Console or API calls all require IAM verification. IAM's core service is in us-east-1. During submarine cable congestion, verification requests time out, and you can't log in. (2) SSL/TLS certificates, HTTPS connections require valid security certificates. Certificate verification and renewal need to connect to overseas CAs (Certificate Authorities) or AWS Certificate Manager (also in us-east-1). Certificate expires and can't renew → HTTPS connection can't be established. (3) Route 53, AWS's DNS service. If your website uses Route 53 for DNS, your "address book" is in the US. DNS query timeout → can't find your website. The common conclusion across all three scenarios: your data and servers are in Taiwan, but "the key to open the door" is in the US.

### Your Data Is Right Here, but You Don't Have "Authorization" to Open It

<div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px;">
  <p>🔐</p>
  <p>Your Google Drive files may physically reside in GCP's Changhua data center</p>
  <p style="color: #e74c3c;"><strong>But you just can't open them</strong></p>
  <p style="color: #aaa;">Because you may need a US server to confirm authorization</p>
</div>

It's like putting a **safe in your house** but leaving the key at a **bank overseas** 🏦, the bank is operating normally, but you can't make an international call anymore.

The safe/key analogy is very intuitive: if the key isn't at home but overseas, you wouldn't think "the safe is at home so it's secure." But this is exactly the current state of most Taiwanese enterprises' cloud architecture, data in Taiwan, but authorization mechanisms overseas. The December 2021 AWS us-east-1 outage was a precedent: other physically healthy AWS regions were also affected because IAM, Route 53, and other control plane services are concentrated in us-east-1. That incident wasn't a submarine cable issue, it was us-east-1 itself having problems, but the effect was identical: your region is fine, but the control plane is down, so you go down too.

### "Cloud in Taiwan" ≠ Safe

<div style="display: flex; justify-content: center; gap: 1.5em; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 140px; max-width: 200px; text-align: center;">
    <p style="font-size: 2.5em; margin: 0;">🏭</p>
    <p>Factory in Taiwan</p>
    <p style="color: #2ecc71;">✓</p>
  </div>
  <div style="flex: 1; min-width: 140px; max-width: 200px; text-align: center;">
    <p style="font-size: 2.5em; margin: 0;">🔑</p>
    <p>Key in the US</p>
    <p style="color: #e74c3c;">✗</p>
  </div>
  <div style="flex: 1; min-width: 140px; max-width: 200px; text-align: center;">
    <p style="font-size: 2.5em; margin: 0;">📞</p>
    <p>Phone line jammed</p>
    <p style="color: #e74c3c;">✗</p>
  </div>
</div>

**"We use Taiwan's AWS/GCP" may ≠ "our services will still work when international traffic drops significantly"**

This is the core conclusion of the cloud control plane section. Many enterprises and government agencies, when answering "is your service resilient?", say "we use the Taiwan AWS region" or "our GCP data center is in Changhua." But that only means "the factory is in Taiwan", not "the key is also in Taiwan." If the control plane depends on overseas infrastructure, then when submarine cables are severed, your service goes down with them. "Taiwan cloud" creates a false sense of security, this is the most critical misconception that needs to be shattered.

### Winners: Truly Domestic-Only Services

In this simulation, some services may be completely unaffected.

<div style="background: rgba(46,204,113,0.12); padding: 1em; border-radius: 8px; text-align: left; border: 1px solid rgba(46,204,113,0.3);">
  <p style="color: #2ecc71;"><strong>✅ Services that survive look like this:</strong></p>
  <p>Server in Taiwan</p>
  <p>Authentication (Auth) in Taiwan</p>
  <p>Authoritative DNS server in Taiwan</p>
  <p>CDN origin in Taiwan</p>
</div>

**The entire dependency chain stays on the island → submarine cable status is irrelevant**

The emphasis here: surviving a submarine cable event isn't just about "having a server in Taiwan." Your entire dependency chain, server, authentication, DNS, CDN origin, must all be in Taiwan. Any single link depending on overseas infrastructure is a weak point. Services completely unaffected in this simulation are those that "chose" to make every layer domestically self-sufficient. That's not coincidence, it's a deliberate architectural decision.

### What's the Difference? One Table

| | Server | Auth | DNS | CDN Origin | During Cable Break |
|---|:---:|:---:|:---:|:---:|---|
| **Fully domestic stack** | 🟢 Taiwan | 🟢 Taiwan | 🟢 Taiwan | 🟢 Taiwan | ✅ Normal operation |
| **Taiwan cloud** | 🟢 Taiwan | 🔴 US | 🔴 US | 🟢 Taiwan | ⚠️ Runs but can't log in |
| **Fully overseas** | 🔴 Overseas | 🔴 Overseas | 🔴 Overseas | 🔴 Overseas | ❌ Completely down |

Most Taiwanese enterprise services fall in **the middle row**, appears to be in Taiwan, but dependencies are overseas.

This table makes the differences across three architectures immediately clear. The focus is the middle row, "Taiwan cloud." Most Taiwanese enterprise and government services fall here: server indeed in Taiwan (AWS Taiwan region, GCP Changhua), but authentication, DNS, and even some CDN logic depend on overseas control planes. This gives the illusion of "being in Taiwan," but during a submarine cable event, it still breaks. This is also the most dangerous state, because until something goes wrong, nobody examines these hidden dependencies.

### Is It a Technical Limitation?

Those services that survived didn't get lucky, someone **chose** to spend extra time, extra money, and make every layer domestically self-sufficient.

**"If the submarine cables broke, would our services still work?"**

This is the most important message of this section: resilience is a choice, not fate. The default configuration of AWS and GCP naturally depends on overseas control planes, because these are global services, that's a reasonable default. But if you operate critical services in Taiwan, you need to proactively change that default. Most enterprises haven't done so, not because they can't, but because nobody asked the question. This is also why we need policy and regulations to drive change, because relying on corporate self-awareness alone isn't enough.

## Simulation Recap

<table class="phase-table">
<thead>
<tr><th>Phase</th><th>Your Experience</th><th>Possible Cause</th></tr>
</thead>
<tbody>
<tr><td>0–5 min</td><td>VoIP calls drop</td><td>BGP reconvergence + call control server in Japan</td></tr>
<tr><td>5–30 min</td><td>Everything slows, freezes</td><td>Congestion collapse + Trombone Effect</td></tr>
<tr><td>30–60 min</td><td>Services drop one by one, logouts</td><td>Cache TTL expiry, Token expiry, DNS failure</td></tr>
<tr><td>1–6 hr</td><td>Cloud admin consoles all down</td><td>Control plane depends on overseas</td></tr>
</tbody>
</table>

Building the complete causal chain: experience → technical cause → decision-makers. The point is to show that no failure is a "natural phenomenon", every one is the result of some organization's engineering or policy choices.

### Simulation Complete

All stakeholders need to conduct a **network outage drill**.

### 🤔 Questions for Everyone

In the scenario we just walked through, would **government websites (gov.tw)** hold up?<br>
<http://poslab.info/slide/20260325>

How are the **submarine cables** doing right now?<br>
<https://drive.google.com/file/d/1n9mbFNVeukMt3g_ywP8ne9366JWWhnT5/view>

## Further Reading

Submarine cable and backbone network fragility are only half the story of a disconnection scenario; the other half is offline communication when bandwidth drops to zero. Over the past six months, one direction the Taiwanese open-source community has been working on is mesh networking with Meshtastic and Reticulum: see the [Mesh Workshop Record](/records/2026-04-20-kuma-academy-mesh-workshop/) and [Rti's Coverage of Taiwan's Civilian Meshtastic Efforts](/records/2026-06-15-rti-meshtastic/).

- Original slide deck: <https://paulpengtw.github.io/crc-march-25-decks/>
- CRC past records: [/records/](/records/)
- CRC news & announcements: [/news/](/news/)
