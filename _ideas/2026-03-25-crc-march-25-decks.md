---
title: "CRC 數位韌性論壇：台灣對外網路流量劇減模擬"
date: 2026-03-25
category: NOTE
summary: "整理 CRC 於 2026 年三月數位韌性論壇的講者與延伸閱讀。"
author: 彭宬
author_slug: cheng
layout: idea-rich
deck_url: "https://paulpengtw.github.io/crc-march-25-decks/"
deck_label_navigate: "← → 鍵切換投影片"
deck_label_fullscreen: "全螢幕觀看"
deck_label_mobile: "觀看互動講者"
deck_label_mobile_hint: "建議於電腦或平板觀看以獲得最佳體驗"
---

原始講者與素材公開於 <https://paulpengtw.github.io/crc-march-25-decks/> 。

## 主題大綱

2026 年三月數位韌性論壇，彭宬當時進行了「台灣對外網路流量 degrade 模擬」。模擬情境為海纜因地震導致斷裂、台灣對外頻寬瞬間損失 50%（*註一），接著逐段拆解對外頻寬銳減後 6 小時內可能會依序出現的故障，從打網路電話（如 LINE 語音或 Messenger 語音） 斷線、網頁卡住、App 可能會一個接一個壞掉、帳號一個一個登出、甚至是明明 Wi-Fi 訊號滿格，但可能什麼都連不上。

這個演講就是想針對這些網路障礙背後的可能成因，以及這些網路障礙有哪些可能減緩影響的路徑？

*註一：一半的海底電纜斷掉不等於失去一半的對外網路流量。

<div class="phase-header">
  <span class="phase-badge phase-badge--1">0–5 min</span>
  <h2>第一階段：為什麼「網路電話」突然斷了</h2>
</div>

### 你可能會感受到的

- LINE 語音通話 → 機器人聲音 → 斷線 ☎️❌
- Instagram → 白畫面
- Google Drive → 載入一半，卡住不動
- 看一眼右上角

**Wi-Fi 訊號滿格 📶**

### 「是 WiFi 機的問題，還是網路的問題？」

Wi-Fi 訊號滿格 ≠ 網路正常

<div style="margin-top: 1em; text-align: left;">
  <p>📱 → 📡 <strong>Wi-Fi</strong>：你的手機到你家路由器</p>
  <p style="color: #aaa;">這段完全正常 ✓</p>
</div>

<div style="text-align: left;">
  <p>📡 → 🌏 <strong>網路</strong>：你家路由器到全世界</p>
  <p style="color: #e74c3c;">這段出事了 ✗</p>
</div>

問題不在你家，在**海底**。

### 當代的網路到底是什麼？

想像網路是一個由**幾千間郵局**組成的系統。

<div style="margin-top: 1em;">
  <p>🏣 每間郵局 = 一個網路機房（ISP、資料中心）</p>
</div>

<div>
  <p>✉️ 你的資料 = 一封封信件（封包）</p>
</div>

<div>
  <p>🛣️ 郵局之間有很多條路可以互相送信</p>
</div>

你在台北寄信到東京，信會經過好幾間郵局，一站一站轉送過去。

網路結構可以簡要的以郵局之間的關係來比喻。網路不是一條線，是很多節點互相轉送資料。每個 ISP、每個機房就像一間郵局。你的資料像信件，會被一站一站轉送到目的地。

### 郵局怎麼知道信要往哪送？

每間郵局門口都有一塊**路牌** 🪧

<div style="margin-top: 0.5em; background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">「要去日本？→ 交給南邊那間郵局」</p>
  <p style="text-align: left;">「要去美國？→ 交給東邊那間郵局」</p>
  <p style="text-align: left;">「要去高雄？→ 交給隔壁那間郵局」</p>
</div>

這塊路牌，在網路世界叫做**路由表**。

郵局之間互相更新路牌的方法，就叫 **BGP**（Border Gateway Protocol 邊界閘道協定）。

路由表就是每個網路節點的「方向指引」。BGP 是全球網路用來同步這些路由資訊的協定。不需要記術語，只要記住：BGP = 郵局之間互相通知「路怎麼走」的系統。

### 海纜斷了 = 路斷了

光纖裡的光束**直接消失**（畢竟斷了）。

離斷點最近的郵局第一個發現：<span style="color: #e74c3c;">「這條路不通了！」</span>

它立刻向鄰居廣播：「大家注意！往南的路斷了！不要再把信往這邊送了！」

<p style="color: #f39c12;">這則消息開始一間接一間傳開⋯⋯</p>

海纜是光纖，斷裂時光訊號直接消失，不是慢慢變弱，是瞬間歸零。連接在該纜線上的路由器（郵局）偵測到鏈路中斷，透過 BGP 向鄰居宣告：這條路已經失效。這個宣告會像漣漪一樣擴散到全球網路。

### 重新算路的混亂期

<p style="color: #aaa;">BGP Reconvergence</p>

全球幾千間郵局同時收到消息——但不是**同時**收到。

<div style="margin-top: 0.8em; background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">🏣 A 郵局已經改路牌了 ✓</p>
  <p style="text-align: left;">🏣 B 郵局還不知道路斷了 ✗</p>
  <p style="text-align: left;">🏣 C 郵局收到了，但還在算新路線 ⏳</p>
</div>

你的信被⋯⋯

- 送到已經斷掉的路 → **丟失**
- 在兩間郵局之間來回彈 → **繞圈**
- 沒有郵局願意收 → **退回**

<p style="color: #f39c12;">這段混亂期：30 秒 ~ 數分鐘</p>

BGP reconvergence 是整個網路重新達成共識的過程。問題在於：資訊傳播有延遲，各節點更新速度不同。在這段過渡期，路由表處於不一致狀態，有些路由器認為舊路還在，有些已經切換新路。這導致封包被丟棄、迴圈、或送進死胡同。時間長短取決於網路拓撲複雜度和 BGP 收斂速度。

### 對你來說，可能就是——全部斷了

<div style="margin-top: 1em; text-align: left;">
  <p>封包被丟掉 → 網頁可能載不出來</p>
  <p>封包繞遠路 → 延遲可能從 20ms 變 2000ms</p>
  <p>封包來回彈 → 可能根本到不了目的地</p>
</div>

實際上 50% 的對外網路流量還在，但在路由重算完成之前，對一般人來說可能就是**卡爆**。

50% 容量還在，但 BGP 收斂期間幾乎無法使用。這就像高速公路出了大車禍，雖然隔壁車道還通，但因為指示牌混亂，所有車都卡在交流道上動不了。一旦 BGP 收斂完成（所有郵局路牌更新一致），剩餘 50% 容量才能真正被利用，不過接下來會面臨壅塞問題。

### 假設 LINE 語音掛了，但文字可能還活著？

<div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap;">
  <div style="background: rgba(46,204,113,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p style="font-size: 1.2em;">💬 文字訊息</p>
    <p>很小的封包（可能僅幾 KB）</p>
    <p>能鑽過混亂的空隙</p>
    <p>晚幾秒到也沒差</p>
  </div>
  <div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p style="font-size: 1.2em;">🎙️ 語音通話</p>
    <p>持續的即時串流</p>
    <p>掉幾個封包 = 機器人聲</p>
    <p>延遲超過 300ms = 斷線</p>
  </div>
</div>

<div style="margin-top: 1.2em; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 0.8em;">
  <p>我們還不確定的是：</p>
  <p style="color: #e74c3c;">
    LINE 的通話伺服器<strong>可能在日本？</strong><br>
    台灣的語音通話<strong>可能必須出海</strong>才能接通？
  </p>
</div>

<div class="phase-header">
  <span class="phase-badge phase-badge--2">5–30 min</span>
  <h2>第二階段：殭屍網路</h2>
</div>

進入第二階段。BGP 已經收斂完成，路由穩定了。但民眾會發現：網路「活著」但幾乎不能用。這個階段要解釋兩件事：壅塞崩潰和 Trombone Effect。

### 你可能感受到的

- 網頁載入一半⋯⋯卡住不動
- 圖片只出現一半，下面是灰色空白
- 可能 YouTube 轉圈圈轉到天荒地老
- 可能 LINE 文字勉強能傳，但要等很久才送達

訊號滿格 📶 看似「有通」，**但可能慢到幾乎不能用**。

跟第一階段不同，前面是是完全斷線（BGP 收斂期間）。現在是「有連線但極度緩慢」，這其實更讓人困惑。民眾會不斷重新整理、重試，反而讓情況更糟。

### 等欸，路不是已經修好了嗎？

BGP reconvergence 完成 ✓——所有郵局的路牌已經更新一致。

剩餘 50% 的對外網路流量正常運作 ✓——路是通的，信可以送。

<p style="color: #f39c12;">那為什麼還是這麼慢？</p>

路沒斷，但<strong style="color: #e74c3c;">路太擠了</strong>。

前一個部分的問題是「路牌混亂」（BGP 收斂）。這一階段的問題是「路太少車太多」（壅塞崩潰）。兩個完全不同的故障機制，但對使用者來說感覺差不多。

### 想像一條高速公路

台灣的對外網路流量 = 一條 **10 線道**的高速公路 🛣️

假設平常車流量大約用了 **7–8 線道**——還有空間，大家都能順暢通行。

<p style="color: #e74c3c;">但失去 50% 對外流量 = 突然只剩 <strong>5 線道</strong></p>

但車流量沒有變——**一樣多的車，一半的路**。

用高速公路來解釋壅塞。平常海纜利用率大約 40-60%，所以有餘裕。斷掉一半之後，剩餘容量立刻被塞滿，車流量不會因為路變少就自動減少。

### 塞車的連鎖反應

<p style="color: #aaa;">為什麼不是「慢一半」而是「幾乎不能動」？</p>

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">🚗 車太多，有些車擠不進去 → <strong>被丟包</strong></p>
  <p style="text-align: left;">🔄 被丟包的車說：「我再試一次！」 → <strong>重新上路</strong></p>
  <p style="text-align: left;">🚗🚗🚗 大家都在重試 → 路上的車<strong>反而更多了</strong></p>
  <p style="text-align: left;">💥 更多車被丟包 → 更多重試 → <strong>惡性循環</strong></p>
</div>

<p style="color: #e74c3c;">這就叫「壅塞崩潰」<br><span style="color: #aaa;">Congestion Collapse</span></p>

這是壅塞崩潰的核心機制。TCP 協定在偵測到封包遺失時會重傳。但當所有連線同時重傳，反而製造更多流量，讓壅塞更嚴重，導致更多封包遺失，再觸發更多重傳。這個惡性循環就是 congestion collapse。

### 用寄信來理解

<p style="color: #aaa;">（延續上一階段的郵局比喻）</p>

你寄了一封信到美國 ✉️

路上太擠，信被丟了 → 你沒收到回信。

你想：「大概寄丟了，再寄一次吧！」——你的電腦也是這樣想的（TCP 重傳）。

<p style="color: #f39c12;">假如全台灣 2,300 萬人的手機都在同一時間「再寄一次」⋯⋯</p>

<p style="color: #e74c3c;">🏔️ 信件雪崩</p>

TCP 重傳機制在正常情況下很好用，偶爾掉一個封包就重送。但在全面壅塞時，所有人同時重送變成災難。這就像塞車時大家都猛按喇叭、硬切換車道，只會讓交通更癱瘓。

物理容量 50% 不等於可用頻寬 50%，因為壅塞崩潰的非線性效應，當連結利用率超過某個臨界點，有效吞吐量急遽下降。部分研究顯示，在嚴重壅塞下，頻寬有效利用率可能降到 15-20%。

### 你可能會碰到的體驗

<div style="text-align: left;">
  <p>📄 網頁 → 可能文字出來了，圖片永遠在轉圈</p>
  <p>🎬 影片 → 可能 240p 馬賽克畫質，還一直暫停緩衝</p>
  <p>📥 下載 → 可能速度從 100 Mbps 掉到 2 Mbps</p>
  <p>📱 App → 可能開得起來，但操作什麼都要等 10 秒以上</p>
</div>

可能不是斷線，但會**卡到哭出來** qq

這邊可以具體感受壅塞崩潰的影響。「慢到不能用」比「完全斷線」更痛苦，因為你會一直重試、一直等待，浪費大量時間。而且你無法判斷是自己的問題還是整個網路所造成的問題。

### 接下來的問題更奇怪

有些網站明明伺服器**就在台灣**，理論上不需要走對外流量，不應該受影響。

<p style="color: #e74c3c;"><strong>但它們可能也壞了</strong> 🤯</p>

為什麼？

壅塞崩潰解釋了「國際流量為什麼慢」。但接下來要解釋一個更詭異的現象：明明伺服器在台灣、不需要走海纜的服務，為什麼也壞了？這就要引入 Trombone Effect。

### 🏪 便利商店的故事

你家巷口有一間 7-11，你想買一瓶水。

正常情況：🏠 → 🚶 走路 30 秒 → 🏪 買到了！

這就像你在台灣連一個**台灣的伺服器**，資料不用出海，直接在島內傳。

便利商店比喻來解釋 Trombone Effect。伺服器在台灣，你也在台灣，資料直接在島內傳遞。像走路去巷口 7-11 買東西一樣簡單直接。

### 但有些電信商說⋯⋯

<div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px;">
  <p>「不行！你不能直接去巷口那間！」</p>
</div>

有些電信商規定的路線：

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p>
    🏠 你家<br>
    → ✈️ 先搭飛機去<strong>東京</strong><br>
    → 🏪 在東京的 7-11 結帳<br>
    → ✈️ 飛回台灣<br>
    → 🏠 拿到你的水
  </p>
</div>

<p style="color: #f39c12;">就為了一瓶巷口就有的水 🤦</p>

你的請求被迫出海繞一圈再回來。明明伺服器就在旁邊，但你的 ISP 的路由設定把流量送到日本或香港再繞回來，這確實很荒謬。

### 為什麼某些電信商要這樣繞？

因為台灣的電信商之間**沒有在本地「牽手」**。

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px; text-align: left;">
  <p>🤝 <strong>對等互連（Peering）</strong>：兩家廠商說好「你的使用者可以直接連我的伺服器」</p>
  <p style="margin-top: 0.5em;">🏢 <strong>網路交換中心</strong>：一個讓大家來牽手的地方</p>
</div>

<p style="color: #e74c3c;">問題：有些台灣 ISP 不是很喜歡跟別人牽手<br><span style="color: #aaa;">或者分享很少的流量</span></p>

解釋 peering 和 Internet Exchange 的概念。用「牽手」比喻對等互連。TPIX 是台灣的網路交換中心之一，理論上 ISP 可以在這裡直接交換流量，不需要繞到海外。但現實是：很多 ISP（尤其大的）不願意在 TPIX 對等互連，因為它們覺得自己的網路比較大，不需要跟小的「牽手」，或者來了但只開放很小的頻寬。

### 平常你感覺不到

繞去東京再回來只多 **20–30 毫秒**——你根本感覺不到差別。

所以有些 ISP 覺得：「反正使用者不會發現，何必花錢在本地牽手？」

<p style="color: #e74c3c;">直到海纜出事：<strong>那條繞去台灣以外的路塞爆了</strong></p>

<p style="color: #f39c12;">你的水瓶在東京的機場跑道上排隊</p>

### 結果：伺服器在你旁邊，你卻連不上

<div style="display: flex; justify-content: center; gap: 1.5em; flex-wrap: wrap;">
  <div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px; min-width: 200px; text-align: center;">
    <p>📍 伺服器位置</p>
    <p style="font-weight: bold;">台北內湖</p>
    <p style="color: #aaa;">離你 10 公里</p>
  </div>
  <div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px; min-width: 200px; text-align: center;">
    <p>📍 你的資料實際走的路</p>
    <p style="font-weight: bold;">台北 → 東京 → 台北</p>
    <p style="color: #aaa;">繞了 4,000 公里</p>
  </div>
</div>

<p style="color: #e74c3c;">對外網路流量壅塞 → 這段繞路卡死 → 你連 10 公里外的伺服器都連不上</p>

這就是 **tromboning** 🎺——「長號效應」：資料像長號的管子一樣繞一大圈。

### 這個階段的兩個可能主要瓶頸

<div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap;">
  <div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 380px;">
    <p style="color: #e74c3c;">❶ 大塞車</p>
    <p>50% 對外流量 ≠ 50% 速度<br>可能的可用頻寬只剩 <strong>15–20%</strong></p>
  </div>
  <div style="background: rgba(243,156,18,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 380px;">
    <p style="color: #f39c12;">❷ 大繞路</p>
    <p>國內 peering 不夠好<br>本土流量被迫繞路<br>連<strong>本土伺服器</strong>都影響</p>
  </div>
</div>

這兩個問題加在一起：**「有網路」可能不等於「能用」**。

總結本階段的兩個核心概念。壅塞崩潰：物理容量和實際可用頻寬的非線性關係。Trombone Effect：路由政策讓不需要出海的流量也受害。兩者疊加造成「殭屍網路」：看起來活著，實際上幾乎不能用。

### 但更糟的可能還在後面⋯⋯

現在你能用的那些服務——Google 搜尋可能偶爾能出結果、一些網頁可能還看得到——它們之所以還活著，可能是因為**「快取」**：之前存在台灣的副本，可能暫時還能用。

但快取有**保存期限**⋯⋯

<p style="color: #e74c3c;"><strong>時間一到，它們可能也會一個接一個壞掉 ⏳</strong></p>

目前還能用的服務，很多是靠 CDN 快取在撐。快取有 TTL（存活時間），一旦過期就要向海外原始伺服器要新的。但海纜壅塞，要不到 → 快取過期 → 服務掛掉。這個「逐步崩壞」的模式會在下一階段詳細解釋。

<div class="phase-header">
  <span class="phase-badge phase-badge--3">30–60 min</span>
  <h2>第三階段：剛剛還好好的怎麼又壞了</h2>
</div>

進入第三階段。壅塞已經穩定下來，ISP 開始做流量管理。但人們會發現一個詭異的現象：之前還能用的東西，開始一個一個壞掉。這個階段要解釋三個機制：CDN 快取過期、Auth Token 過期、DNS 快取過期。這三個機制造成的「漸進式崩壞」比完全斷線更危險，因為它讓人無法判斷問題在哪。

### 你感受到的

- Google Drive 剛剛可能還能開，現在卡住了
- 新聞網站可能文字有、圖片全消失
- LINE 可能閃退後重開，可能登不回去了
- 網銀 app 可能要你重新輸入密碼，然後愛的魔力轉圈圈

一次不會全壞——**可能是一個一個壞掉**，且看起來毫無規律。

這種「漸進式故障」是最讓人困惑的。完全斷線大家反而知道「網路斷了」，會去找替代方案。但東西一個一個壞、有些還能用、有些不行，會讓人反覆嘗試、浪費時間、更焦慮。接下來我們要解釋為什麼會「一個一個壞」。答案是三種「保存期限」同時在倒數。

### 回到便利商店

你家旁邊的 **7-11** 🏪——架上有飲料、便當、零食的「複製品」。

這些商品從哪來？**海外的倉庫** 🚢——7-11 不生產東西，它從倉庫進貨、放在架上給你拿。

網路世界也一樣，**CDN** 就是你家旁邊的數位便利商店（Content Delivery Network）。

CDN = Content Delivery Network，內容傳遞網路。Cloudflare、Akamai、CloudFront 等公司在台灣設有「邊緣節點」（edge node）。這些節點就像便利商店：把海外伺服器的內容複製一份放在台灣，讓使用者不用每次都跑到海外去拿。你瀏覽的網頁圖片、CSS、JavaScript 檔案，很多都是從台灣的 CDN 節點送到你手上的。

### 保存期限：TTL

<p style="color: #aaa;">Time To Live</p>

便利商店的便當有**保存期限**——過期了就不能賣，要從倉庫補新的。

CDN 快取也有類似保存期限，叫做 **TTL**（Time To Live：這份複製品可以用多久）。

TTL 可能是 **5 分鐘**，也可能是 **24 小時**——每個網站、每個檔案的設定都不同。

<p style="color: #f39c12;">前 30 分鐘大部分快取還沒到期，所以東西「還能用」。現在，保存期限開始一個一個到了。</p>

TTL 是伺服器設定的，告訴 CDN「這份複製品可以用多久」。新聞網站的首頁圖片可能 TTL 只有 5 分鐘（因為要即時更新）。jQuery 函式庫可能 TTL 有 1 年（因為幾乎不會變）。海纜剛斷的前 30 分鐘，大部分快取還在有效期內，所以使用者感覺「還行」。但隨著時間推移，各種快取的 TTL 陸續到期，問題就開始浮現。

### 便利商店補不到貨了

架上的便當過期了 → 要從倉庫補貨。

<p style="color: #e74c3c;">但通往倉庫的路塞爆了 🚛💨</p>

（對外流量壅塞 = 國際連線極度緩慢）

補貨卡車出發了⋯⋯但塞在路上回不來。CDN 向海外原始伺服器要新資料 → 逾時 → 失敗。

<p style="color: #e74c3c;"><strong>快取過期 + 補不到貨 = 架上空了</strong></p>

當 CDN 快取的 TTL 到期，CDN 節點會向海外的「原始伺服器」（origin server）發出 revalidation 請求。正常情況下這只需要幾十毫秒。但現在國際連線壅塞，這個請求要嘛超時、要嘛回應極慢。CDN 拿不到新資料，就不能繼續提供內容，使用者看到的就是載入失敗。

### 為什麼有些能看、有些不行？

<div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap; margin-top: 0.8em;">
  <div style="background: rgba(46,204,113,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p>✅ 還能看</p>
    <p style="color: #aaa;">熱門 YouTube 影片<br>常用網站的 CSS/JS<br>大家都在看的新聞圖片</p>
    <p style="color: #2ecc71;">→ 快取剛補過、TTL 還沒到</p>
  </div>
  <div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p>❌ 看不到了</p>
    <p style="color: #aaa;">冷門頁面、舊文章<br>你很久沒開的文件<br>TTL 短的即時內容</p>
    <p style="color: #e74c3c;">→ 快取已過期、補貨失敗</p>
  </div>
</div>

這就是為什麼**同一個網站有些部分能看、有些不行**——結果以為是網站壞了，其實是快取到期的時間不同。

這解釋了為什麼使用者會覺得故障「很隨機」。同一個網站，HTML 文字可能快取 TTL 24 小時（還有效），但圖片 TTL 只有 1 小時（已過期）。所以你會看到文字出現、但圖片全空白的詭異畫面。越多人同時存取的內容，快取越「新鮮」，因為一直有人觸發補貨。冷門內容則相反，快取很可能已經過期很久了。

### 什麼是 Auth Token？

假設我們去**遊樂園** 🎢

去遊樂園，在入口**買了票、驗了身分**，然後工作人員在你手上蓋了一個**章**。

我們用遊樂園的比喻來解釋 Auth Token。這個概念對非技術背景的讀者來說很陌生，但它是理解「為什麼 app 會一個一個登出」的關鍵。

### 手上的章 = Auth Token

蓋了章之後，你可以：

- 玩雲霄飛車 🎢 — 給工作人員看手上的章 ✓
- 玩旋轉木馬 🎠 — 看章 ✓
- 買園區餐點 🍔 — 看章 ✓

每次不用重新排隊買票、重新驗身分。手上的章就代表「這個人已經驗證過了」。

**Auth Token 就是你手上的那個章。** 你登入 Google 之後，瀏覽器拿到一個「章」，之後開 Gmail、Drive、YouTube 都不用重新登入。

Auth Token 就是這個「章」。你在 Google 登入一次，瀏覽器就拿到一個 token。之後你開 Gmail、Google Drive、YouTube，每次請求都帶著這個 token。伺服器看到 token 就知道「這是已經登入的使用者」，不用每次都問你帳號密碼。

### 但印章會褪色

遊樂園的章用的是<strong style="color: #f39c12;">特殊墨水</strong>——15 分鐘到 1 小時後，章就會褪色、看不到了。

為什麼不用永久的墨水？

<div style="background: rgba(231,76,60,0.1); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">🔒 如果有人<strong>偷印了你的章</strong>（token 被盜）</p>
  <p style="text-align: left; color: #aaa;">用褪色墨水 → 小偷最多用 15 分鐘</p>
  <p style="text-align: left; color: #aaa;">用永久墨水 → 小偷可以<strong>永遠冒充你</strong></p>
</div>

所以 token 故意設計成會過期：安全機制。

Token 設計成短期有效是一個安全決策。如果 token 永遠有效，一旦被竊取（例如透過 XSS 攻擊、中間人攻擊），攻擊者就能永遠冒充你。短期 token 限制了被盜後的損害範圍：就算被偷，15 分鐘後就失效了。這就像信用卡的到期日，不是為了方便你，是為了限制被盜用的風險。

### 章褪色了，回售票口重蓋

章褪色了 → 走回入口售票處 🎫——出示你的年票卡，工作人員重新蓋章，整個過程只要幾秒鐘，你幾乎不會注意到。

平常這完全不是問題——app 在背景自動幫你「重蓋章」，你根本感覺不到。

<p style="color: #e74c3c;">但是⋯⋯如果售票處在<strong>海的另一邊</strong>呢？</p>

正常情況下，token 過期後的「重新認證」是背景自動完成的。瀏覽器或 app 會自動用 refresh token（像年票卡）去跟認證伺服器要新的 access token。整個過程幾百毫秒，使用者完全無感。但關鍵問題來了：認證伺服器在哪裡？

### 售票處在海的另一邊

- Google 的認證伺服器 可能在 🇺🇸 美國
- LINE 的認證伺服器 可能在 🇯🇵 日本
- Microsoft 的認證伺服器 可能在 🇺🇸 美國

你的章褪色了 → 可能要跨海去重新蓋章。

<p style="color: #e74c3c;">但對外流量雍塞 = 那條路大塞車 🚗🚗🚗</p>

重新蓋章的請求**送出去了⋯⋯但回不來**——等了 30 秒 → 逾時 → 失敗。

<p style="color: #e74c3c;"><strong>你被登出了。而且登不回去。</strong></p>

這是 Auth Token 在海纜事件中的核心問題。Google 的 OAuth 認證伺服器主要在美國（accounts.google.com 解析到美國 IP）。LINE 的認證走日本的伺服器。Microsoft 的 Azure AD 也在美國。Token 過期後，app 嘗試跟這些海外伺服器重新認證。但國際連線壅塞，請求逾時，你就被登出了。而且登入頁面本身也需要連到海外伺服器，所以連「重新登入」都做不到。

### 每個人在不同時間被登出

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">
    ⏱️ 斷纜後 20 分鐘：<span style="color: #e74c3c;">Google Drive</span> 的章可能褪色了 → 可能被登出<br>
    ⏱️ 斷纜後 35 分鐘：<span style="color: #e74c3c;">LINE</span> 的章可能褪色了 → 可能閃退後登不回去<br>
    ⏱️ 斷纜後 45 分鐘：<span style="color: #e74c3c;">網路銀行</span> 的章褪色了 → 要求重新登入 → 失敗<br>
    ⏱️ 斷纜後 50 分鐘：<span style="color: #e74c3c;">公司 Slack</span> 的章可能褪色了 → 可能完全斷線
  </p>
</div>

<p style="color: #f39c12;">這就是為什麼看起來「毫無規律」——因為每個 app 的章在不同時間褪色。</p>

每個服務的 token 有效期不同：Google 通常 1 小時，有些銀行 app 15 分鐘。而且每個使用者上次登入的時間不同，所以 token 到期的時間也不同。這就造成了「漸進式故障」的混亂局面：你隔壁同事的 Google Drive 還能用（因為他剛登入），你的已經不行了（因為你的 token 剛好到期）。大家互相詢問「你的能不能用？」得到不同答案，更加困惑。

### Token 的真面目

技術上，Token 長這樣：

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px; font-family: monospace; font-size: 0.7em; word-break: break-all; text-align: left;">
  eyJhbGciOiJSUzI1NiJ9.<span style="color: #3498db;">eyJ1c2VyIjoi5bCP5piOIiwic2NvcGUiOiJkcml2ZSIsImV4cCI6MTcxMTEyMzQ1Nn0</span>.SflKxwRJSMeKKF2QT4fw
</div>

這叫 **JWT**（JSON Web Token），裡面包含：

<div style="display: flex; justify-content: center; gap: 1.5em; flex-wrap: wrap; margin-top: 0.5em;">
  <div style="background: rgba(52,152,219,0.1); padding: 0.6em 1em; border-radius: 8px;">
    <p style="margin: 0;">👤 你是誰</p>
    <p style="margin: 0; color: #aaa; font-size: 0.8em;">user: 小明</p>
  </div>
  <div style="background: rgba(52,152,219,0.1); padding: 0.6em 1em; border-radius: 8px;">
    <p style="margin: 0;">🔑 能做什麼</p>
    <p style="margin: 0; color: #aaa; font-size: 0.8em;">scope: drive</p>
  </div>
  <div style="background: rgba(52,152,219,0.1); padding: 0.6em 1em; border-radius: 8px;">
    <p style="margin: 0;">⏰ 何時到期</p>
    <p style="margin: 0; color: #aaa; font-size: 0.8em;">exp: 1 hr</p>
  </div>
</div>

最後一段是**數位簽章**：防止偽造，只有伺服器能產生。

JWT 是目前最常見的 token 格式。它分為三段（用 . 分隔）：header（演算法）、payload（內容）、signature（簽章）。中間的 payload 段用 base64 編碼，裡面就是 JSON 資料。重點是最後的 signature：它是用伺服器的私鑰簽的，所以沒人能偽造。伺服器收到 token 時，驗證簽章就知道這是不是自己發的。

### Token 的一生

<div style="max-width: 90%;">
  <div style="background: rgba(46,204,113,0.1); padding: 0.6em 1em; border-radius: 8px; margin-bottom: 0.5em;">
    <p style="text-align: left; margin: 0;">1️⃣ <strong>登入</strong>：輸入帳號密碼 → 伺服器給你兩個東西</p>
    <p style="text-align: left; margin: 0; color: #aaa; font-size: 0.9em;">　　Access Token（通行章）有效 15 分鐘～1 小時</p>
    <p style="text-align: left; margin: 0; color: #aaa; font-size: 0.9em;">　　Refresh Token（年票卡）有效數天～數週</p>
  </div>
  <div style="background: rgba(52,152,219,0.1); padding: 0.6em 1em; border-radius: 8px; margin-bottom: 0.5em;">
    <p style="text-align: left; margin: 0;">2️⃣ <strong>使用中</strong>：每次操作都帶著 Access Token</p>
    <p style="text-align: left; margin: 0; color: #aaa; font-size: 0.9em;">　　伺服器看章就放行，不用每次都驗密碼</p>
  </div>
  <div style="background: rgba(243,156,18,0.1); padding: 0.6em 1em; border-radius: 8px; margin-bottom: 0.5em;">
    <p style="text-align: left; margin: 0;">3️⃣ <strong>章褪色</strong>：Access Token 到期 → 用 Refresh Token 自動換新章</p>
    <p style="text-align: left; margin: 0; color: #aaa; font-size: 0.9em;">　　背景自動完成，你完全不會發現</p>
  </div>
  <div style="background: rgba(231,76,60,0.1); padding: 0.6em 1em; border-radius: 8px;">
    <p style="text-align: left; margin: 0;">4️⃣ <strong>年票也到期</strong>：Refresh Token 也失效 → 必須重新輸入帳號密碼</p>
    <p style="text-align: left; margin: 0; color: #aaa; font-size: 0.9em;">　　這就是為什麼你偶爾會被要求「重新登入」</p>
  </div>
</div>

OAuth 2.0 的標準流程。Access Token 是短期的（像蓋在手上的章），Refresh Token 是長期的（像年票卡）。正常情況下，Access Token 到期時，app 會自動用 Refresh Token 去跟伺服器換新的 Access Token。這整個流程在背景發生，使用者毫無感覺。只有當 Refresh Token 也到期（通常幾天到幾週），才會要求使用者重新輸入帳號密碼。

### 為什麼不能給永久通行證？

<div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap;">
  <div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p>🔓 如果 Token 永久有效</p>
    <p style="color: #aaa;">被偷了 → 攻擊者永遠能冒充你</p>
    <p style="color: #aaa;">權限變了 → 舊 token 還有舊權限</p>
    <p style="color: #aaa;">離職了 → token 還能用</p>
  </div>
  <div style="background: rgba(46,204,113,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 250px; max-width: 350px;">
    <p>🔒 Token 定期過期</p>
    <p style="color: #aaa;">被偷了 → 最多 15 分鐘就失效</p>
    <p style="color: #aaa;">權限變了 → 下次換發會更新</p>
    <p style="color: #aaa;">離職了 → token 自然失效</p>
  </div>
</div>

Token 過期不是設計缺陷，是<strong style="color: #2ecc71;">安全機制</strong>——就像門鎖密碼定期更換：不方便，但更安全。

這是安全與便利的根本取捨。永久 token 就像一把永遠不換的鑰匙，方便，但一旦被複製就完蛋。短期 token 就像定期更換的密碼鎖，麻煩，但被破解的損害有限。在正常網路環境下，這個取捨很合理：重新認證只要幾百毫秒，使用者無感。但在海纜事件中，「重新認證」這個步驟突然變成了致命弱點。

### 海纜斷裂時可能的連鎖反應

<div style="max-width: 90%;">
  <div style="border-left: 3px solid #3498db; padding-left: 1em; margin-bottom: 0.5em;">
    <p style="margin: 0;">Access Token 到期</p>
    <p style="margin: 0; color: #aaa; font-size: 0.9em;">app 可能在背景嘗試用 Refresh Token 換新的</p>
  </div>
  <div style="border-left: 3px solid #f39c12; padding-left: 1em; margin-bottom: 0.5em;">
    <p style="margin: 0;">Refresh 可能請求送往海外認證伺服器</p>
    <p style="margin: 0; color: #aaa; font-size: 0.9em;">但國際連線壅塞⋯⋯等 10 秒、20 秒⋯⋯</p>
  </div>
  <div style="border-left: 3px solid #e74c3c; padding-left: 1em; margin-bottom: 0.5em;">
    <p style="margin: 0; color: #e74c3c;">逾時失敗 ✗</p>
    <p style="margin: 0; color: #aaa; font-size: 0.9em;">app 判定「認證失效」→ 可能強制登出</p>
  </div>
  <div style="border-left: 3px solid #e74c3c; padding-left: 1em; margin-bottom: 0.5em;">
    <p style="margin: 0;">跳出登入頁面 → 你輸入帳號密碼</p>
    <p style="margin: 0; color: #e74c3c; font-size: 0.9em;">但登入頁面本身可能也要連到海外伺服器 → 也逾時 ✗</p>
  </div>
</div>

<p style="color: #e74c3c;"><strong>登出了，而且可能登不回去。</strong></p>

這是一個連鎖失敗：
1. Access Token 過期（正常機制）
2. Refresh 請求因為壅塞而逾時（不正常）
3. App 判定認證失效，強制登出（正常反應）
4. 使用者嘗試重新登入，但登入流程本身也需要國際連線（致命弱點）

特別是 OAuth 登入流程，「用 Google 登入」按鈕要連到 accounts.google.com，而那個伺服器在美國。所以連登入頁面都打不開。

### 你的 App 可能正在一個一個登出

<div style="background: rgba(255,255,255,0.05); padding: 0.8em; border-radius: 8px;">
  <p style="text-align: left;">
    <span style="color: #2ecc71;">t+0 min</span>　對外流量驟降：所有 Token 開始倒數<br>
    <span style="color: #2ecc71;">t+15 min</span>　<span style="color: #aaa;">網銀 token 到期 → 被登出</span><br>
    <span style="color: #f39c12;">t+25 min</span>　<span style="color: #aaa;">Slack token 到期 → 可能離線</span><br>
    <span style="color: #f39c12;">t+35 min</span>　<span style="color: #aaa;">LINE 需要重新驗證 → 可能失敗</span><br>
    <span style="color: #e74c3c;">t+45 min</span>　<span style="color: #aaa;">Google Drive token 到期 → 可能無法存取文件</span><br>
    <span style="color: #e74c3c;">t+60 min</span>　<span style="color: #aaa;">可能幾乎所有需要認證的服務都已失效</span>
  </p>
</div>

「一次斷線」不太可能發生——<strong style="color: #e74c3c;">比較像慢動作的大規模登出</strong>。每個人、每個 app、不同時間：看起來完全隨機。

這邊把整個 auth token 故事做一個時間軸總結。重點是讓大家理解：這不是「網路斷了」這麼簡單。而是一個看不見的倒數計時器在每個 app 裡面跑著，到期的那一刻，那個 app 就「死」了。而且因為每個服務的 token 有效期不同、每個人登入的時間不同，所以整個過程看起來完全隨機、毫無規律。

### 接下來：DNS

CDN 快取到期 → 內容消失。Auth Token 到期 → 被登出。

<p style="color: #f39c12;">還有第三個東西也在倒數⋯⋯</p>

而且這個東西壞掉的話，**連網站在哪都找不到**。

前面兩個問題是「內容拿不到」和「身分認不了」。第三個問題更根本：「地址都查不到」。所以我們需要從最基礎開始解釋。

### 什麼是 DNS？網路的電話簿

你在瀏覽器打 **google.com**，但電腦不懂「google.com」是什麼。

電腦只懂**數字地址**：<span style="color: #3498db;">142.250.185.46</span>——這叫 IP 位址：像電話號碼一樣，每台伺服器都有一組。

**DNS** = 一本電話簿 📒——把「名字」翻譯成「電話號碼」（google.com → 142.250.185.46）。

<p style="color: #f39c12;">沒有這本電話簿，你就算知道對方的名字也打不了電話。</p>

DNS = Domain Name System（網域名稱系統）。我們用網址（domain name）上網，但電腦之間溝通用的是 IP 位址。DNS 就是中間的翻譯層，把人看得懂的名字轉成電腦看得懂的數字。沒有 DNS，你就必須記住每個網站的 IP 位址才能上網，就像沒有通訊錄就要背所有人的電話號碼。

### DNS 怎麼查？像打 104 查號台

你的手機想找 **google.com** 的電話號碼：

<div style="max-width: 90%;">
  <div style="border-left: 3px solid #3498db; padding-left: 1em; margin-bottom: 0.4em;">
    <p style="margin: 0;">1️⃣ 先翻自己的通訊錄（本機快取）</p>
    <p style="margin: 0; color: #aaa; font-size: 0.85em;">之前查過就直接用，不用再問別人</p>
  </div>
  <div style="border-left: 3px solid #3498db; padding-left: 1em; margin-bottom: 0.4em;">
    <p style="margin: 0;">2️⃣ 沒有 → 打給 ISP 的查號台（DNS 解析器）</p>
    <p style="margin: 0; color: #aaa; font-size: 0.85em;">你的中華電信 / 台灣大 有一台專門幫你查號碼的伺服器</p>
  </div>
  <div style="border-left: 3px solid #3498db; padding-left: 1em; margin-bottom: 0.4em;">
    <p style="margin: 0;">3️⃣ ISP 也沒有 → 一路往上問到「總機」</p>
    <p style="margin: 0; color: #aaa; font-size: 0.85em;">Root Server → .com 管理者 → google.com 的權威伺服器</p>
  </div>
  <div style="border-left: 3px solid #2ecc71; padding-left: 1em;">
    <p style="margin: 0; color: #2ecc71;">4️⃣ 查到了！把結果記在通訊錄裡下次用</p>
    <p style="margin: 0; color: #aaa; font-size: 0.85em;">這就是「DNS 快取」：記住查到的結果，省得每次都打電話問</p>
  </div>
</div>

DNS 查詢的層級：
1. 本機快取（你的裝置記住之前查過的結果）
2. ISP 的 DNS 解析器（像 8.8.8.8 或中華電信的 DNS）
3. 根伺服器（Root Server）→ TLD 伺服器（管 .com 的）→ 權威伺服器（google.com 的管理者）

正常這整個流程只要幾十毫秒。而且查到的結果會被快取在各個層級，下次再查就不用從頭問。但快取也有保存期限。

### DNS 快取也有保存期限

通訊錄裡的電話號碼也會「過期」——google.com 的 TTL 可能設 300 秒（5 分鐘），某些 .tw 網站可能設 3600 秒（1 小時）。

為什麼不永久記住？因為伺服器可能搬家（換 IP）、做負載平衡、或做故障切換。如果永遠用舊號碼，可能打到空號。

<p style="color: #f39c12;">所以 DNS 快取也有 TTL：過期就要<strong>重新查號</strong>——平常幾十毫秒搞定，你完全不會發現。</p>

DNS 記錄的 TTL 由網站管理者設定。大型網站通常 TTL 很短（幾分鐘），因為需要經常調整流量分配。小網站可能 TTL 較長（幾小時到一天）。正常情況下 DNS 重新查詢很快，但在海纜事件中，很多網站的權威 DNS 伺服器在海外，重新查詢就要走壅塞的國際連線。

### DNS 快取過期 = 找不到門牌號碼

假設有一個網站 **service.gov.tw**，伺服器就在台北市內 🏢。

你的裝置之前查過，通訊錄裡有它的 IP → 連線正常、速度快 ✓

但 DNS 快取到期了：需要重新查號。權威 DNS 伺服器在哪？<span style="color: #e74c3c;">可能在美國（e.g. AWS Route 53）</span>

<p style="color: #e74c3c;">查號的電話打不通 → 你<strong>查不到門牌號碼</strong>——伺服器就在 10 公里外：但你找不到它。</p>

不是伺服器掛了，不是網路斷了——<strong style="color: #f39c12;">是你忘了地址，而且問不到</strong>。

這是 DNS 快取過期最諷刺的場景：一個 .tw 網站，伺服器實體在台灣，資料在台灣，完全不需要國際連線。但它的 DNS 權威伺服器用的是 AWS Route 53（在美國）。當你的 DNS 快取過期，需要重新查詢時，查詢請求要送到美國，經過壅塞的海纜，然後逾時。結果：一個完全在台灣的服務，因為 DNS 查不到而無法連線。這就是「依賴鏈」的概念，表面上是本土服務，實際上隱藏了海外依賴。

<div class="phase-header">
  <span class="phase-badge phase-badge--4">1–6 hr</span>
  <h2>第四階段以後：控制平面依賴海外</h2>
</div>

進入第四階段。海纜斷裂已經超過一小時了。BGP 早就重新收斂完成，壅塞也穩定下來，各種快取和 token 過期的「漸進式崩壞」也差不多走完了。但大家會發現一個新的現象：有些東西開始恢復了，但另一些東西卻完全死掉。這個階段要解釋兩件事：(1) ISP 開始手動做流量管理，(2) 雲端的「控制平面」依賴海外。這兩個機制共同造成了一條新的分水嶺：純國內的服務活了，有海外大腦的服務死了。

### 你感受到的

- LINE 文字訊息：可能又通了！ ✅
- 一些之前看過的網頁：可能可以開
- YouTube：可能能看，但畫質可能剩 144p 馬賽克
- Instagram：可能文字有，圖片全是灰框 🖼️❌
- 要登入任何 SaaS 工具：可能轉圈圈、失敗
- AWS / GCP 管理後台：可能完全打不開

出現了一條**新的分水嶺**——能用 vs 不能用，取決於服務的「大腦」在哪裡。

這個階段的關鍵感受是「不公平」：為什麼有些東西恢復了，有些反而更慘？LINE 文字恢復是因為 ISP 開始做流量管理，把訊息列為高優先。SaaS 和雲端後台完全掛掉，是因為它們的「控制平面」在海外。接下來我們分兩部分解釋：(1) ISP 在做什麼，(2) 雲端的「大腦在海外」問題。

### ISP 在幕後做了什麼？

假設在**急診室** 🏥

如果有重大災難，**大量傷患湧入急診室**——醫生人力有限，不可能同時救所有人，所以急診室有**檢傷分類**。

這裡用急診室的比喻來解釋 ISP 的流量工程（traffic engineering）。海纜斷裂後，國際頻寬只剩一半，但流量需求沒有減少，就像大量傷患湧入但醫生不夠。ISP 的網路工程師這時候必須手動介入，決定哪些流量優先通過。這就是網路世界的「檢傷分類」（triage）。

### 檢傷分類：誰先救？

<div style="display: flex; justify-content: center; gap: 1em; flex-wrap: wrap;">
  <div style="background: rgba(231,76,60,0.15); padding: 0.8em; border-radius: 8px; flex: 1; min-width: 180px; max-width: 250px; border-left: 4px solid #e74c3c;">
    <p style="color: #e74c3c;">🔴 可能最優先</p>
    <p style="color: #aaa; font-size: 0.85em;">DNS 查詢<br>政府網站<br>即時訊息（LINE 文字）<br>金融交易</p>
  </div>
  <div style="background: rgba(243,156,18,0.15); padding: 0.8em; border-radius: 8px; flex: 1; min-width: 180px; max-width: 250px; border-left: 4px solid #f39c12;">
    <p style="color: #f39c12;">🟡 可能次優先</p>
    <p style="color: #aaa; font-size: 0.85em;">一般網頁瀏覽<br>Email 收發<br>低解析度串流</p>
  </div>
  <div style="background: rgba(46,204,113,0.15); padding: 0.8em; border-radius: 8px; flex: 1; min-width: 180px; max-width: 250px; border-left: 4px solid #2ecc71;">
    <p style="color: #2ecc71;">🟢 可能可延後</p>
    <p style="color: #aaa; font-size: 0.85em;">YouTube 高畫質<br>Instagram 圖片/影片<br>軟體更新下載<br>雲端備份</p>
  </div>
</div>

ISP 工程師**可能會手動介入**，可能會決定誰的封包優先通過——這就是為什麼有些東西「恢復了」、有些變更慢。

ISP 的流量管理（traffic engineering）在正常情況下大多是自動化的。但在海纜事件中，工程師會手動介入，設定 QoS（Quality of Service）規則。DNS 和政府網站被列為最高優先，因為 DNS 是所有網路服務的基礎。即時訊息（LINE 文字）流量小但對民眾影響大，所以也被優先處理。YouTube、Instagram 的圖片和影片流量極大（佔總流量的高比例），被降級處理。這就是為什麼你會看到 YouTube 畫質驟降、Instagram 只有文字沒有圖片。

### 為什麼 LINE 文字可能恢復了？

1️⃣ LINE 文字訊息 = **相對小的封包**——一則文字訊息可能大約 1 KB，一張 Instagram 照片可能大約 2,000 KB，差 **2000 倍**。

2️⃣ ISP 可能把訊息列為**高優先**——小封包 + 本地路由 + 高優先 = 可能擠得過去 ✅

<p style="color: #f39c12;">Instagram 圖片？大封包 + 海外來源 + 可能被降級 = 可能轉圈圈 🖼️</p>

LINE 文字訊息能恢復有三個原因疊加：(1) 封包極小，文字訊息的資料量微不足道，就算頻寬極度壅塞也能擠過去。(2) LINE 在 TPIX（台灣網際網路交換中心）有對等連線，代表很多 LINE 文字訊息其實走島內路由，根本不需要經過海纜。(3) ISP 的流量管理把即時訊息列為高優先，在檢傷分類中排在前面。三個因素加起來，LINE 文字訊息就恢復了。相比之下，Instagram 照片動輒數 MB，來源在海外，又被降級，所以只剩灰框。

### 你的網路可能不是壞了：可能是被「管」了

🚦 ISP 工程師 = **十字路口的交通警察**

正常時候：綠燈，所有車都能過——你感覺不到交通警察的存在。

危機時候：警察出來指揮 🖐️——「救護車先走！公車可以過！私家車等一下！」

你的 YouTube 可能不是「斷了」，是被**可能讓道**給更重要的東西了。

這里的重點是讀者理解：此刻他們感受到的「部分恢復」不是隨機的，而是 ISP 工程師刻意決策的結果。ISP 有能力區分不同類型的流量，也有能力決定優先順序。平常你不會注意到，因為頻寬足夠、所有人都能通過。但在頻寬緊縮的時刻，ISP 的「選擇」就直接決定了你能用什麼、不能用什麼。

### 這代表什麼？一件你該知道的事

<div style="background: rgba(52,152,219,0.1); padding: 1em; border-radius: 8px; text-align: left;">
  <p>ISP <strong>有能力</strong>做流量分類和管理——他們知道哪些封包去哪裡、是什麼類型</p>
</div>

<div style="background: rgba(243,156,18,0.1); padding: 1em; border-radius: 8px; margin-top: 0.8em; text-align: left;">
  <p>這代表 ISP <strong>平時的路由決策</strong>也是「選擇」——可能把你的流量繞去國外再繞回來，不在本土做對等連線</p>
</div>

<p style="color: #e74c3c;"><strong>危機時 ISP 能選擇救誰，代表平時 ISP 也在選擇犧牲誰</strong></p>

這是 ISP 流量管理段落的核心洞見。大家剛看到 ISP 在危機中有能力做流量分類和優先排序，這代表 ISP 平時也有這個能力。Phase 2 講到的長號效應，ISP 把本地流量繞去東京再繞回來，不是技術限制，是成本考量下的選擇。不在 TPIX 做本地對等連線，也是選擇。這個段落把 Phase 2 的批判和 Phase 4 的觀察連結起來：ISP 不是被動的管道，是有能力、有選擇、該被追究的行動者。

### 接下來：雲端的問題

LINE 文字可能恢復了、可能一些網頁能看了——但 SaaS 工具和雲端服務**可能完全死掉**。

要理解為什麼，我們需要先搞懂一件事：**「雲端」到底是什麼？** ☁️🤔

轉場到雲端控制平面的部分。很多人對「雲端」的理解停留在很模糊的層次，「資料存在雲上」。我們需要先把「雲端」講清楚，才能解釋為什麼「台灣的雲端」不等於安全。

### 「雲端」其實是⋯⋯別人的電腦

你聽過「資料存在雲端」☁️——聽起來很輕盈、很抽象、飄在天上。

真相：**你的資料存在別人的電腦裡。** 那台電腦放在一棟巨大的建築物裡，有空調、有保全、有備用發電機。這棟建築叫做**「資料中心」（Data Center）**。

台灣有這樣的建築物 🏢——AWS、GCP 都有台灣機房。你的資料**確實**存在台灣的土地上 ✓

先破除「雲端」的抽象感。很多人聽到「雲端」就覺得資料飄在某個虛無的空間裡。但雲端就是別人的電腦，放在大型資料中心裡。AWS 在 2022 年啟用了台灣區域（ap-northeast-3 → 實際是板橋的資料中心）。GCP 在彰化也有資料中心。所以「資料在台灣」這句話在物理上是成立的，但接下來要解釋為什麼這還不夠。

### 工廠和總部

想像一家**跨國企業**在台灣設了一座**工廠**：

<div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap;">
  <div style="background: rgba(46,204,113,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 240px; max-width: 320px;">
    <p>🏭 台灣工廠</p>
    <p style="color: #aaa;">生產產品（存你的檔案）</p>
    <p style="color: #aaa;">出貨給客戶（回應你的請求）</p>
    <p style="color: #aaa;">倉庫裡有原料（你的資料）</p>
    <p style="color: #2ecc71;">→ 這叫「資料平面」Data Plane</p>
  </div>
  <div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px; flex: 1; min-width: 240px; max-width: 320px;">
    <p>🏢 美國總部</p>
    <p style="color: #aaa;">核發員工證（身分驗證 IAM）</p>
    <p style="color: #aaa;">核准預算（配置資源）</p>
    <p style="color: #aaa;">簽發合約（SSL 憑證）</p>
    <p style="color: #e74c3c;">→ 這叫「控制平面」Control Plane</p>
  </div>
</div>

<p style="color: #f39c12;">工廠在台灣 ✓　但做任何重要決定都要<strong>打電話回總部</strong></p>

雲端服務分成兩層：(1) 資料平面（Data Plane）：實際存儲和處理資料的地方，這在台灣。(2) 控制平面（Control Plane）：管理、認證、授權、配置的地方，這通常在美國。AWS 的控制平面很多核心功能集中在 us-east-1（維吉尼亞）。GCP 的全球控制平面也有類似的集中化設計。工廠能生產，但沒有總部的授權，工廠不能開門、不能出貨、不能做任何事。

### 工廠在台灣，但鑰匙可能在美國

🔑 **員工要進工廠**（你要登入 AWS）→ 可能要跟美國總部確認身分（IAM 驗證）→ 可能請求走海纜到維吉尼亞 → <span style="color: #e74c3c;">逾時</span>

📋 **工廠要出貨**（網站要更新安全憑證）→ 可能要跟美國總部簽發合約（SSL 憑證驗證）→ 請求走海纜 → <span style="color: #e74c3c;">逾時</span> → HTTPS 連線失敗

📞 **客戶要查工廠地址**（DNS 解析）→ 地址簿可能在美國（Route 53 在 us-east-1）→ 查詢走海纜 → <span style="color: #e74c3c;">逾時</span> → 找不到工廠

<p style="color: #e74c3c;"><strong>工廠完好、原料充足、機器正常——但就是開不了門</strong></p>

三個具體場景說明控制平面依賴的影響：(1) IAM（Identity and Access Management），AWS 的身分驗證系統。登入 AWS Console 或 API 呼叫都需要 IAM 驗證。IAM 的核心服務在 us-east-1。海纜壅塞時，驗證請求逾時，你就登不進去。(2) SSL/TLS 憑證，HTTPS 連線需要有效的安全憑證。憑證的驗證和更新需要連到海外的 CA（Certificate Authority）或 AWS Certificate Manager（也在 us-east-1）。憑證過期無法更新 → HTTPS 連線就建不起來。(3) Route 53，AWS 的 DNS 服務。如果你的網站用 Route 53 做 DNS，你的「地址簿」就在美國。DNS 查詢逾時 → 找不到你的網站。三個場景的共同結論：你的資料和伺服器都在台灣，但「打開門的鑰匙」在美國。

### 你的資料就在這裡，但你沒有「授權」打開它

<div style="background: rgba(231,76,60,0.1); padding: 1em; border-radius: 8px;">
  <p>🔐</p>
  <p>你的 Google Drive 檔案可能物理上存在彰化的 GCP 機房</p>
  <p style="color: #e74c3c;"><strong>但你可能就是打不開</strong></p>
  <p style="color: #aaa;">因為你可能需要美國的伺服器來確認</p>
</div>

這就像把**保險箱放在家裡**，但把鑰匙寄放在**國外的銀行** 🏦——銀行正常營業，但你打不了國際電話了。

保險箱/鑰匙的比喻非常直覺：如果鑰匙不在家裡而是在國外，你不會覺得「保險箱在家就安全了」。但這正是目前大多數台灣企業的雲端架構現狀，資料在台灣，但授權機制在海外。2021 年 12 月 AWS us-east-1 大當機就是前例：其他物理上完全正常的 AWS 區域也受到影響，因為 IAM、Route 53 等控制平面服務集中在 us-east-1。那次不是海纜問題，是 us-east-1 自己出問題，但效果一模一樣：你的區域正常，但控制平面掛了，所以你也跟著掛。

### 「雲端在台灣」≠ 安全

<div style="display: flex; justify-content: center; gap: 1.5em; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 140px; max-width: 200px; text-align: center;">
    <p style="font-size: 2.5em; margin: 0;">🏭</p>
    <p>工廠在台灣</p>
    <p style="color: #2ecc71;">✓</p>
  </div>
  <div style="flex: 1; min-width: 140px; max-width: 200px; text-align: center;">
    <p style="font-size: 2.5em; margin: 0;">🔑</p>
    <p>鑰匙在美國</p>
    <p style="color: #e74c3c;">✗</p>
  </div>
  <div style="flex: 1; min-width: 140px; max-width: 200px; text-align: center;">
    <p style="font-size: 2.5em; margin: 0;">📞</p>
    <p>電話線塞爆了</p>
    <p style="color: #e74c3c;">✗</p>
  </div>
</div>

**「我們用台灣的 AWS/GCP」可能 ≠「我們的服務在對外流量大量降低時還能用」**

這是雲端控制平面段落的核心結論。很多企業和政府機構在回答「你的服務有韌性嗎？」的時候，會說「我們用的是台灣的 AWS 區域」或「我們的 GCP 機房在彰化」。但這只代表「工廠在台灣」，不代表「鑰匙也在台灣」。如果控制平面依賴海外，那海纜一斷，你的服務就跟著掛。「台灣雲端」給人一種虛假的安全感，這是最需要被點破的認知誤區。

### 贏家：真正的純國內服務

在這場模擬中，可能有些服務完全不受影響。

<div style="background: rgba(46,204,113,0.12); padding: 1em; border-radius: 8px; text-align: left; border: 1px solid rgba(46,204,113,0.3);">
  <p style="color: #2ecc71;"><strong>✅ 活下來的服務長這樣：</strong></p>
  <p>伺服器在台灣</p>
  <p>認證（Auth）在台灣</p>
  <p>DNS 權威伺服器在台灣</p>
  <p>CDN 來源站在台灣</p>
</div>

**整條鏈都在島內 → 海纜斷不斷，跟它無關**

這裡要強調的是：要在海纜事件中存活，不是只要「伺服器在台灣」就夠了。你的整條依賴鏈，伺服器、認證、DNS、CDN 來源，都必須在台灣。任何一個環節依賴海外，就是一個弱點。能在這場模擬中完全不受影響的服務，是那些「選擇」了把每一層都做到國內自主的服務。這不是偶然，是有意識的架構決策。

### 差別在哪？一張表

| | 伺服器 | 認證 | DNS | CDN 來源 | 海纜斷裂時 |
|---|:---:|:---:|:---:|:---:|---|
| **純國內 stack** | 🟢 台灣 | 🟢 台灣 | 🟢 台灣 | 🟢 台灣 | ✅ 正常運作 |
| **台灣雲端** | 🟢 台灣 | 🔴 美國 | 🔴 美國 | 🟢 台灣 | ⚠️ 能跑但登不進去 |
| **完全海外** | 🔴 海外 | 🔴 海外 | 🔴 海外 | 🔴 海外 | ❌ 完全掛掉 |

大多數台灣企業的服務落在**中間那一列**——看起來在台灣，但 dependency 在海外。

這張表可以一目了然地看到三種架構的差異。重點是中間那一列，「台灣雲端」。大多數台灣企業和政府服務落在這一列：伺服器確實在台灣（AWS 台灣區域、GCP 彰化），但認證、DNS、甚至部分 CDN 邏輯依賴海外的控制平面。這給人「在台灣」的安全感，但在海纜事件中照樣出問題。這也是最危險的狀態，因為沒出事之前，沒人會去檢視這些隱藏的依賴。

### 是技術限制嗎？

那些活下來的服務，不是運氣好——是有人**選擇**多花時間、多花錢、把每一層都做到國內自主。

**「如果海纜斷了，我們的服務還能用嗎？」**

這是本段落最重要的訊息：韌性是選擇，不是命運。AWS、GCP 的預設配置就是會依賴海外控制平面，因為它是全球化服務，這是合理的預設。但如果你在台灣經營關鍵服務，你需要主動去改這個預設。大多數企業沒有這樣做，不是做不到，是沒有人問過那個問題。這也是為什麼我們需要政策和法規來推動，因為靠企業自覺是不夠的。

## 模擬回顧

<table class="phase-table">
<thead>
<tr><th>階段</th><th>你的體驗</th><th>可能的原因</th></tr>
</thead>
<tbody>
<tr><td>0–5 分</td><td>VoIP 通話斷線</td><td>BGP reconvergence + 通話控制伺服器在日本</td></tr>
<tr><td>5–30 分</td><td>全部變慢、卡住</td><td>壅塞崩潰 + 長號效應</td></tr>
<tr><td>30–60 分</td><td>逐一斷線、登出</td><td>快取 TTL 到期、Token 過期、DNS 失效</td></tr>
<tr><td>1–6 時</td><td>雲端後台全掛</td><td>控制平面依賴海外</td></tr>
</tbody>
</table>

這邊想再次建立完整的因果鏈：體驗 → 技術原因 → 決策者。重點是讓大家看到：沒有任何一個故障是「自然現象」，每一個都是某個組織的工程或政策選擇。

### 做完模擬了

各個利害關係人需要做一次**斷網演習**。

### 🤔 留給大家的問題

在剛剛的情境下，**政府網站 gov.tw** 撐得住嗎？<br>
<http://poslab.info/slide/20260325>

目前**海底電纜還好嗎**？<br>
<https://drive.google.com/file/d/1n9mbFNVeukMt3g_ywP8ne9366JWWhnT5/view>

## 延伸閱讀

海纜與骨幹網路的脆弱性，只是斷網情境的一半；另一半是頻寬完全歸零時的離線通訊方案。台灣開源社群過去半年投入的其中一個實作方向是 Meshtastic 與 Reticulum 之類的網狀網路：可延伸閱讀 [Mesh 工作坊記錄](/records/2026-04-20-kuma-academy-mesh-workshop/)，以及 [Rti 中央廣播電臺對台灣民間 Meshtastic 的採訪](/records/2026-06-15-rti-meshtastic/)。

- 原始簡報連結：<https://paulpengtw.github.io/crc-march-25-decks/>
- CRC 過往記錄：[/records/](/records/)
- CRC 訊息公告：[/news/](/news/)
