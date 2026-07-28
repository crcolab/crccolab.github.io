---
title: "為什麼要進行「行動網路降速」演習？有意義嗎？"
date: 2026-07-28
category: NOTE
summary: "2026 城鎮韌性演習首度納入「行動網路降速」：8 月 10 日與 8 月 13 日下午 2 時 30 分起降速 30 分鐘。從花蓮強震、丹娜絲颱風的基地台受損，到日、韓、北約與芬蘭的通訊演練，談把斷網情境納入防災演習的意義。"
author: 彭宬
author_slug: cheng
tags:
  - 行動網路降速
  - 城鎮韌性演習
  - 數位韌性
  - 防災演練
  - 海底電纜
  - 行動基地台
  - 災害漫遊
  - 離線準備
  - 電信基礎設施
  - 台灣
about:
  - 數位韌性
  - 災害整備與應變
  - 電信與網路基礎設施
  - 台灣
mentions:
  - name: "非常通信協議会"
  - name: "NATO Cooperative Cyber Defence Centre of Excellence"
    url: "https://ccdcoe.org/"
  - name: "Digi- ja väestötietovirasto (DVV)"
    url: "https://dvv.fi/"
citations:
  - name: "強震影響三大電信172個基地台 NCC：估今天可修復"
    url: "https://www.cna.com.tw/news/ahel/202404030090.aspx"
    publisher: "中央社"
  - name: "丹娜絲颱風應變處置與復原情形"
    url: "https://www.ey.gov.tw/Page/448DE008087A1971/d6215b19-fc53-4373-989b-80ef81bf8277"
    publisher: "行政院"
  - name: "丹娜絲風災重創嘉南通訊避免數位孤島 NCC啟動災害漫遊"
    url: "https://udn.com/news/story/7326/8925595"
    publisher: "聯合新聞網"
  - name: "颱風丹娜絲重創基地台 中華電信：預定10月底前復原"
    url: "https://www.cna.com.tw/news/afe/202508040028.aspx"
    publisher: "中央社"
  - name: "「數位韌性論壇：地緣政治下的海纜與網路基礎設施」"
    url: "/ideas/2026-03-25-crc-march-25-decks/"
    publisher: "Cyborg Resilience Co-lab"
  - name: "非常通信確保のためのガイド・マニュアル"
    url: "https://www.bousai.go.jp/kaigirep/houkokusho/hukkousesaku/saigaitaiou/output_html_1/pdf/4.pdf"
    publisher: "非常通信協議会"
  - name: "\"드론과 GPS가 멈춘다\"… 전 국민이 훈련에 들어가는 3박 4일, 2025 을지연습"
    url: "https://www.eachj.co.kr/news/articleView.html?idxno=13386"
    publisher: "이치저널"
  - name: "Locked Shields"
    url: "https://ccdcoe.org/locked-shields/"
    publisher: "NATO CCDCOE"
  - name: "TAISTO-harjoitus"
    url: "https://dvv.fi/taisto"
    publisher: "Digi- ja väestötietovirasto (DVV)"
  - name: "城鎮韌性演習14縣市手機降速非斷網 影響範圍一篇看懂"
    url: "https://www.cna.com.tw/news/aipl/202607210026.aspx"
    publisher: "中央社"
---

台灣的行動網路資費、連線速度與連線品質在全球名列前茅，這有賴三大電信業者與政府長期的建設維運，民眾才能享受穩定又便宜的行動網路環境。

不過，台灣同時也是颱風、地震頻發的國家。天災除了破壞供水與電網，也會波及基地台與纜線等網通設備：2024 年 4 月 3 日規模 7.2 的花蓮強震，尖峰時曾造成 172 座行動基地台受影響（多集中於宜花地區）\[1\]；2025 年 7 月丹娜絲颱風更使嘉南地區一帶逾 1,300 座基地台因斷電或毀損而停止服務\[2\]\[3\]，部分基地台直到同年 10 月底才全數修復\[4\]。行動網路中斷不僅讓災區居民難以聯繫親友，更阻礙救災調度。

值得注意的是，基地台受損多造成「局部斷網」，而當對外海纜受損時，恐會出現「全島降速」：許多日常使用的 app 與網站，核心伺服器都在海外，一旦國際頻寬驟減，即使島內網路正常，服務仍會嚴重卡頓。賽伯格韌性實驗室 CRC 今年 3 月 25 日舉辦的[「數位韌性論壇：地緣政治下的海纜與網路基礎設施」](/ideas/2026-03-25-crc-march-25-decks/)，即針對這類網路部分受損情境進行模擬分析\[5\]，當時的結論之一，就是「無論政府或民間的演練皆需納入網路受損情境」。

政府長期推動防救災教育與避難演練，讓民眾在天災來臨前熟悉應變流程，培養處理突發狀況的能力。減（防）災的核心是盡可能降低天災對生活的衝擊；隨著常民生活愈發依賴網路，「網路降速或中斷」也應納入演練情境。

這類與網路、通訊有關的演練在國際上並非首創：日本總務省與電信機構組成的「非常通信協議會」（日文：非常通信協議会），定期演練公眾線路與防災無線中斷時，會以備用電源與替代通訊線路傳遞災情的「非常通信訓練」\[6\]；韓國 2025 年「乙支演習」（을지연습）動員約 4,000 個機關、58 萬人，情境除了通訊中斷、網路基礎設施破壞外，更涵蓋 GPS 遭干擾情境\[7\]；北約的網路防禦卓越中心（CCDCOE）每年於愛沙尼亞塔林舉辦全球規模最大的實戰網路防禦演習 Locked Shields，動員 41 國、逾 4,000 人演練關鍵基礎設施防禦，其中也針對通訊基礎設施遭破壞的情境進行演練\[8\]。

芬蘭甚至連續九年由數位暨人口資料服務局（DVV）每年舉辦全國性「TAISTO」網路及資安演習，免費開放所有公部門組織參加，近年單屆逾 450 個機關機構參與，與警方和國安機構合作，針對網路攻擊、系統遭駭、甚至是 AI 資安等情境進行模擬\[9\]。

今年的城鎮韌性演習首度納入「行動網路降速」演練：8 月 10 日（中部 7 縣市）與 8 月 13 日（北部 7 縣市）下午 2 時 30 分起，模擬啟動災害漫遊與分級限流後頻寬不足的情境，降速 30 分鐘；語音通話、簡訊、災防細胞簡訊與 110、119 等緊急電話均不受影響，以寬頻固網運作的 Wi-Fi 也不受影響\[10\]。民眾可藉此練習離線地圖、現金支付、手機號碼聯繫等替代方案，為可能出現的天災預作準備。

我們樂見本年度演習新增此項目，也期待未來的演習及防災教育持續擴大並深化數位韌性相關情境！

距離演習還有半個月，CRC 在下週將分享如何為「行動網路降速」演習做準備，歡迎厲害的大家在留言分享自己或親友已經為這次演習做了哪些安排～～

## 參考資料

1. 中央社，〈[強震影響三大電信172個基地台 NCC：估今天可修復](https://www.cna.com.tw/news/ahel/202404030090.aspx)〉，2024/4/3。
2. 行政院，〈[丹娜絲颱風應變處置與復原情形](https://www.ey.gov.tw/Page/448DE008087A1971/d6215b19-fc53-4373-989b-80ef81bf8277)〉（統計至 2025/7/9，基地臺受損 1,360 座）。
3. 聯合新聞網，〈[丹娜絲風災重創嘉南通訊避免數位孤島 NCC啟動災害漫遊](https://udn.com/news/story/7326/8925595)〉（南部 1,293 座基地台因斷電或毀損）。
4. 中央社，〈[颱風丹娜絲重創基地台 中華電信：預定10月底前復原](https://www.cna.com.tw/news/afe/202508040028.aspx)〉，2025/8/4。
5. CRC 賽伯格韌性實驗室，[「數位韌性論壇：地緣政治下的海纜與網路基礎設施」](/ideas/2026-03-25-crc-march-25-decks/)，2026/3/25。
6. 非常通信協議会，《[非常通信確保のためのガイド・マニュアル](https://www.bousai.go.jp/kaigirep/houkokusho/hukkousesaku/saigaitaiou/output_html_1/pdf/4.pdf)》。
7. 이치저널，〈["드론과 GPS가 멈춘다"… 전 국민이 훈련에 들어가는 3박 4일, 2025 을지연습](https://www.eachj.co.kr/news/articleView.html?idxno=13386)〉，2025/8。
8. NATO CCDCOE, "[Locked Shields](https://ccdcoe.org/locked-shields/)"。
9. Digi- ja väestötietovirasto（DVV），"[TAISTO-harjoitus](https://dvv.fi/taisto)"；另見 [DVV 新聞稿](https://dvv.fi/-/tanaan-kaynnistyva-taisto-harjoitus-kokoaa-yli-330-organisaatiota-harjoittelemaan-ajankohtaisten-digiuhkien-varalle)。
10. 中央社，〈[城鎮韌性演習14縣市手機降速非斷網 影響範圍一篇看懂](https://www.cna.com.tw/news/aipl/202607210026.aspx)〉，2026/7/21。
