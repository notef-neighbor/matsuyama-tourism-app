// 松山観光アプリ データファイル（調査メモ research.md に基づく。事実の追加・変更時は必ず出典を確認すること）
window.MATSUYAMA_DATA = {
  lastChecked: "2026-11-27",
  lastCheckedNote: "各公式ページ等で確認した日。営業時間・料金・イベントは変更される場合があります。お出かけ前に公式情報をご確認ください。",
  categories: [
    { id: "sights", label: "名所", icon: "🏯" },
    { id: "onsen", label: "温泉", icon: "♨️" },
    { id: "food", label: "グルメ", icon: "🍊" },
    { id: "events", label: "イベント", icon: "✨" }
  ],
  spots: [
    {
      id: "dogo-honkan", name: "道後温泉本館", kana: "どうごおんせん ほんかん", category: "onsen",
      lat: 33.85206, lng: 132.78640, address: "愛媛県松山市道後湯之町5-6", coordApprox: false,
      summary: "日本最古といわれる道後温泉のシンボル。国の重要文化財で、約6年にわたる保存修理工事は2024年12月20日に完了しました。",
      highlights: ["2024年7月11日に全館営業再開、同年12月20日に全工事完了", "神の湯・霊の湯の2つの浴室、2階席・3階個室で休憩も", "貸切室（しらさぎの間・飛翔の間）と又新殿は事前予約が可能", "夜は「DOGO ART」のライトアップ（17:00〜23:30）"],
      details: [
        { label: "営業時間", value: "神の湯階下 6:00〜23:00（札止22:30）／神の湯2階席・霊の湯2階席 6:00〜22:00（札止21:00）／霊の湯3階個室 6:00〜22:00（札止20:30）／貸切室 しらさぎの間 6:30〜20:00・飛翔の間 8:00〜21:30（各1日5組限定）" },
        { label: "料金（税込・大人/小人）", value: "神の湯階下 700円/350円、神の湯2階席 1,300円/650円、霊の湯2階席 2,000円/1,000円、霊の湯3階個室 2,500円/1,250円、又新殿 500円/250円（9:00〜17:00・要予約）" },
        { label: "お得なチケット", value: "3館周湯チケット 大人1,440円/小人680円（本館神の湯階下・飛鳥乃湯泉1階・椿の湯／販売日とその翌日有効）" },
        { label: "ご注意", value: "公衆浴場のため宿泊はできません。貸切室・又新殿は前日22時までWeb予約、当日は電話 089-921-5141。" }
      ],
      sources: [
        { title: "道後温泉本館｜道後温泉 公式サイト", url: "https://dogo.jp/onsen/honkan" },
        { title: "営業時間と料金案内｜松山市（更新2026-09-01）", url: "https://www.city.matsuyama.ehime.jp/kanko/kankoguide/kankomeisho/dogoonsen/info/dougo1126.html" },
        { title: "保存修理工事完了のお知らせ｜松山市", url: "https://www.city.matsuyama.ehime.jp/hodo/202412/14492120241212144327.html" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 150 }, color: "#e8590c"
    },
    {
      id: "asuka-no-yu", name: "道後温泉別館 飛鳥乃湯泉", kana: "あすかのゆ", category: "onsen",
      lat: 33.8523, lng: 132.7872, address: "愛媛県松山市道後湯之町19-22", coordApprox: true,
      summary: "道後温泉の外湯のひとつ。2026年12月26日に9周年を迎え、記念イベントを開催中です。",
      highlights: ["9周年記念：今治タオル展（2026/11/26〜2027/1/31）", "9周年記念タオル 2,200円（税込）を新発売", "12/26(土) 14:00〜 中庭で記念セレモニー・祝い餅まき", "2階特別浴室は2時間前までの予約制（TEL 089-932-1126）"],
      details: [
        { label: "営業時間", value: "1階浴室 6:00〜23:00（札止22:30）／2階大広間・個室 6:00〜22:00（札止21:00）／2階特別浴室 6:00〜22:00（札止20:30・1日8組限定）" },
        { label: "料金（税込・大人/小人）", value: "1階浴室 610円/300円、2階大広間 1,280円/630円、2階個室 1,690円/830円、2階特別浴室 1組2,040円＋1,690円/830円" },
        { label: "椿ランタン", value: "2026-27シーズンの椿ランタン・行燈イルミネーションの期間は、確認時点では未発表でした（前回は2025/11/28〜2026/2/1）。" }
      ],
      sources: [
        { title: "飛鳥乃湯泉9周年記念イベント｜松山市（更新2026-11-16）", url: "https://www.city.matsuyama.ehime.jp/hodo/202611/9syuunen.html" },
        { title: "道後温泉別館 飛鳥乃湯泉｜松山市", url: "https://www.city.matsuyama.ehime.jp/kanko/kankoguide/kankomeisho/dogoonsen/asuka/asuka.html" },
        { title: "道後温泉 公式サイト", url: "https://dogo.jp/" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 200 }, color: "#c2255c"
    },
    {
      id: "tsubaki-no-yu", name: "道後温泉 椿の湯", kana: "つばきのゆ", category: "onsen",
      lat: 33.85237, lng: 132.78504, address: "愛媛県松山市道後湯之町", coordApprox: false,
      summary: "地元の方にも親しまれている道後温泉の共同浴場。気軽に立ち寄れる外湯です。",
      highlights: ["3館周湯チケットの対象施設", "入浴のみ・利用時間60分以内"],
      details: [
        { label: "営業時間", value: "6:30〜23:00（札止22:30）" },
        { label: "料金（税込）", value: "大人500円／小人200円" }
      ],
      sources: [
        { title: "営業時間と料金案内｜松山市（更新2026-09-01）", url: "https://www.city.matsuyama.ehime.jp/kanko/kankoguide/kankomeisho/dogoonsen/info/dougo1126.html" },
        { title: "道後温泉 公式サイト", url: "https://dogo.jp/" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 150 }, color: "#d9480f"
    },
    {
      id: "dogo-station", name: "道後温泉駅・坊っちゃん列車", kana: "ぼっちゃんれっしゃ", category: "sights",
      lat: 33.85043, lng: 132.78508, address: "愛媛県松山市道後町1丁目", coordApprox: false,
      summary: "伊予鉄が運行する「坊っちゃん列車」が、土・日・祝日に道後温泉と松山市内を結びます。",
      highlights: ["運行は土・日・祝日のみ（12/30〜1/3は運休）", "予約不可・定員36名。道後温泉駅発の当日便は道後チケットカウンターで8:30から整理券を配布", "ICカード利用可"],
      details: [
        { label: "料金（1乗車）", value: "大人1,300円／小児650円" },
        { label: "道後温泉発", value: "松山市駅行き 9:19／13:19／14:59、古町行き 10:48（JR松山駅前 11:13着、古町 11:17着）" },
        { label: "道後温泉行き", value: "松山市駅発 10:04／14:04／15:44（道後着 10:24／14:24／16:04）、古町発 11:47（道後着 12:21）" },
        { label: "乗車できる電停", value: "道後温泉・大街道・松山市駅・JR松山駅前・古町" },
        { label: "ご注意", value: "天候不良や点検で運休する場合があります。" }
      ],
      sources: [
        { title: "坊っちゃん列車｜伊予鉄", url: "https://www.iyotetsu.co.jp/botchan/" },
        { title: "坊っちゃん列車と伊予灘ものがたり｜この街手帖（公式確認 2026-11-01）", url: "https://konomachi-note.jp/ehime/guides/play-kankou-train-ehime/" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 150 }, color: "#2b8a3e"
    },
    {
      id: "shiki-museum", name: "松山市立子規記念博物館", kana: "しききねんはくぶつかん", category: "sights",
      lat: 33.84970, lng: 132.78705, address: "愛媛県松山市道後公園1-30", coordApprox: false,
      summary: "俳人・正岡子規にまつわる博物館。道後公園の一角にあります。",
      highlights: ["「ひかりの実」（12/18〜）の会場・道後公園のすぐそば", "音声ガイド 1台100円（重要展示物約30点）", "キャッシュレス決済に対応"],
      details: [
        { label: "開館時間", value: "11/1〜4/30 9:00〜17:00（入館16:30まで）／5/1〜10/31 9:00〜18:00（入館17:30まで）" },
        { label: "休館日", value: "火曜日（祝日の場合は翌日）" },
        { label: "観覧料", value: "個人500円、65歳以上250円、高校生以下無料（特別展は別料金）" },
        { label: "電話", value: "089-931-5566" }
      ],
      sources: [
        { title: "開館時間等のご案内｜松山市（ページ更新日2025-04-01）", url: "https://www.city.matsuyama.ehime.jp/shisetsu/bunka/sikihaku/sikihakuriyou/shikihaku_riyouannai.html" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 150 }, color: "#364fc7"
    },
    {
      id: "ishiteji", name: "石手寺", kana: "いしてじ", category: "sights",
      lat: 33.84677, lng: 132.79639, address: "愛媛県松山市石手2-9-21", coordApprox: false,
      summary: "四国八十八ヶ所の51番札所。国宝の二王門をはじめ、国宝・重要文化財が数多く残る古刹です。",
      highlights: ["国宝・二王門（1318年、河野通継の建立）", "重要文化財の金剛力士像・本堂・三重塔など", "境内の拝観は無料。マントラ洞窟（100円）も", "道後温泉から歩いて行ける距離"],
      details: [
        { label: "納経所", value: "8:00〜17:00（年中無休）" },
        { label: "宝物館", value: "8:00〜17:00／大人200円（子ども100円）" },
        { label: "マントラ洞窟・第二洞窟", value: "8:30〜16:30／100円" },
        { label: "電話", value: "089-977-0870" }
      ],
      sources: [
        { title: "石手寺 公式サイト｜当寺院について", url: "https://nehan.net/about/" },
        { title: "石手寺二王門｜松山市（更新2026-10-13）", url: "https://www.city.matsuyama.ehime.jp/kanko/kankoguide/rekishibunka/bunkazai/kuni/isiteji_nioumon.html" },
        { title: "熊野山 石手寺｜いよ観ネット", url: "https://www.iyokannet.jp/spot/875" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 200 }, color: "#862e9c"
    },
    {
      id: "matsuyama-castle", name: "松山城", kana: "まつやまじょう", category: "sights",
      lat: 33.84565, lng: 132.76575, address: "愛媛県松山市丸之内1（ロープウェイ東雲口駅舎：大街道3丁目）", coordApprox: false,
      summary: "標高132mの本丸広場に天守が建つ松山のシンボル。ロープウェイ・リフトで8合目付近まで登れ、歩いて登る登城道もあります。",
      highlights: ["12月・1月は天守の営業時間が16:30までに短縮（入場は16:00まで）", "2026年の天守定休日：12月16日（第3水曜・大掃除）", "ロープウェイ約3分（10分毎）／リフト約6分（雨天運休）", "ロープウェイ往復＋天守見学で約1時間30分が目安"],
      details: [
        { label: "天守 営業時間", value: "2〜7月・9〜11月 9:00〜17:00／8月 〜17:30／12・1月 9:00〜16:30（入場は終了30分前まで）" },
        { label: "天守 料金", value: "大人520円／小学生160円" },
        { label: "ロープウェイ・リフト", value: "ロープウェイ 8:30〜17:30（12・1月は〜17:00）、リフト 8:30〜17:00。共通券 往復 大人520円・小人260円／片道 大人270円・小人140円" },
        { label: "本丸広場", value: "無料。11〜3月は5:30〜21:00" },
        { label: "お得なきっぷ", value: "松山道後周遊パス 1,700円（天守・ロープウェイ/リフト・道後温泉本館神の湯階下・坂の上の雲ミュージアム）" }
      ],
      sources: [
        { title: "天守営業案内｜松山市（更新2026-08-31）", url: "https://www.city.matsuyama.ehime.jp/kanko/kankoguide/shitestukoen/matsuyamajyo/tensyu.html" },
        { title: "城山ロープウェイ・リフト｜松山市（更新2026-10-09）", url: "https://www.city.matsuyama.ehime.jp/kanko/kankoguide/shitestukoen/matsuyamajyo/ro-puuei.html" },
        { title: "松山城の観覧ガイド｜松山城公式", url: "https://www.matsuyamajo.jp/guide/" },
        { title: "お得な情報｜松山観光コンベンション協会", url: "https://www.mcvb.jp/oyakudachi/otoku.html" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 200 }, color: "#1864ab"
    },
    {
      id: "ninomaru", name: "二之丸史跡庭園", kana: "にのまるしせきていえん", category: "sights",
      lat: 33.84273, lng: 132.76442, address: "愛媛県松山市丸之内", coordApprox: false,
      summary: "松山城のふもとにある庭園。「恋人の聖地」認定で、秋は紅葉のライトアップ「二之丸 光の庭園」が開かれます。",
      highlights: ["光の庭園：残り開催日は 11/28・29、12/5・6（17:00〜21:00・20:30札止）", "流水園にLEDボール、もみじのライトアップ", "ライトアップ時の料金は中学生以上200円・小学生100円（ブログ記載）"],
      details: [
        { label: "通常入場料", value: "大人200円／小人100円（6〜12歳）" },
        { label: "光の庭園 開催日", value: "2026/11/13・14・15・21・22・23・28・29、12/5・6" }
      ],
      sources: [
        { title: "松山市内のイルミネーション情報｜松山観光コンベンション協会", url: "https://www.mcvb.jp/kankou/illumination.html" },
        { title: "松山市イルミネーション2026-2027｜ゆりママんブログ（2026-11-23時点）", url: "https://yurimaman.com/archives/89577" },
        { title: "松山城の観覧ガイド｜松山城公式", url: "https://www.matsuyamajo.jp/guide/" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 200 }, color: "#e03131"
    },
    {
      id: "bansuisou", name: "萬翠荘", kana: "ばんすいそう", category: "sights",
      lat: 33.84247, lng: 132.76820, address: "愛媛県松山市一番町3-3-7", coordApprox: false,
      summary: "国指定重要文化財の洋館。大街道から徒歩約5分、城山のふもとに建つレトロな建物です。",
      highlights: ["国指定重要文化財", "駐車場は約20台（公共交通機関の利用を推奨）", "支払いは現金・PayPay"],
      details: [
        { label: "開館時間", value: "9:00〜18:00（イベントにより変更の場合あり）" },
        { label: "休館日", value: "月曜日（祝日の場合は開館）" },
        { label: "観覧料", value: "大人400円／小人200円／未就学児無料" },
        { label: "アクセス", value: "伊予鉄市内電車「大街道」下車、徒歩約5分" },
        { label: "電話", value: "089-921-3711" }
      ],
      sources: [ { title: "来館案内・アクセス｜萬翠荘 公式", url: "https://www.bansuisou.org/information/" } ],
      checkedAt: "2026-11-27", stamp: { radius: 150 }, color: "#0b7285"
    },
    {
      id: "sakanoue-museum", name: "坂の上の雲ミュージアム", kana: "さかのうえのくも", category: "sights",
      lat: 33.84185, lng: 132.76918, address: "愛媛県松山市一番町3-20", coordApprox: false,
      summary: "小説『坂の上の雲』にちなむ市立ミュージアム。大街道電停から徒歩2分です。",
      highlights: ["音声ガイド 1台100円（日本語・英語・中国語・韓国語・台湾華語）", "松山道後周遊パスの対象施設"],
      details: [
        { label: "開館時間", value: "9:00〜18:30（入館は18:00まで）" },
        { label: "休館日", value: "原則月曜日。毎年2〜3月は展示入替で休館期間あり" },
        { label: "観覧料", value: "一般500円、65歳以上・高校生250円、中学生以下無料" },
        { label: "電話", value: "089-915-2600" }
      ],
      sources: [ { title: "利用案内｜松山市（更新2025-07-01）", url: "https://www.city.matsuyama.ehime.jp/shisetsu/kanko/sakamuseum/annai.html" } ],
      checkedAt: "2026-11-27", stamp: { radius: 150 }, color: "#5f3dc4"
    },
    {
      id: "okaido-gintengai", name: "大街道・松山銀天街", kana: "おおかいどう・ぎんてんがい", category: "sights",
      lat: 33.84058, lng: 132.76959, address: "愛媛県松山市大街道・湊町", coordApprox: false,
      summary: "松山中心部のアーケード商店街。銀天街は約600m、北側で大街道につながります。冬はイルミネーションで彩られます。",
      highlights: ["大街道イルミネーション：2026/11/11〜2027年2月中旬予定（無料）", "紫・ピンクに輝く巨大ツリーと「みきゃん」", "銀天街の入口にはいよてつ高島屋、地下街「まつちかTOWN」"],
      details: [
        { label: "アーケード装飾の点灯", value: "10:00〜翌1:00（大街道アーケードの情報。巨大ツリー・銀天街は異なる場合あり）" },
        { label: "松山市駅前広場", value: "2026/11/8〜2027/1/31 17:00〜23:00・無料（球体オーナメント）" }
      ],
      sources: [
        { title: "松山銀天街について｜松山銀天街商店街", url: "https://gintengai.or.jp/?page_id=5" },
        { title: "松山市イルミネーション2026-2027｜ゆりママんブログ（2026-11-23時点）", url: "https://yurimaman.com/archives/89577" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 200 }, color: "#f08c00"
    },
    {
      id: "nabeyaki-asahi", name: "鍋焼うどん アサヒ", kana: "なべやきうどん あさひ", category: "food",
      lat: 33.8385, lng: 132.7690, address: "愛媛県松山市湊町3-10-11", coordApprox: true,
      summary: "1947年創業、松山の鍋焼きうどんの老舗。アルミ鍋で出てくる、甘めのつゆとやわらかい麺が特徴です。",
      highlights: ["鍋焼うどん880円／たまご入り950円／いなり150円", "営業は木〜日のみ（月・火・水定休）", "現金のみ・予約不可"],
      details: [
        { label: "営業時間", value: "木・金・土・日 10:00〜15:30（食べログ記載・2026/06更新。変更される場合があります）" },
        { label: "支払い", value: "カード・電子マネー・QRコード決済は不可（食べログ記載）" },
        { label: "電話", value: "089-921-6470" },
        { label: "鍋焼きうどんとは", value: "戦後まもなく松山で生まれた、甘みのあるダシとやわらかい麺が特徴の庶民派グルメ。" }
      ],
      sources: [
        { title: "鍋焼うどん アサヒ｜食べログ", url: "https://tabelog.com/ehime/A3801/A380101/38000348/" },
        { title: "松山の絶品グルメ｜松山市公式観光情報サイト", url: "https://matsuyama-sightseeing.com/appeal/food/" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 200 }, color: "#d9480f"
    },
    {
      id: "dogo-street-food", name: "道後商店街の食べ歩き（谷本蒲鉾・つぼや）", kana: "どうごしょうてんがい", category: "food",
      lat: 33.85224, lng: 132.78605, address: "愛媛県松山市道後湯之町（道後温泉本館前・ハイカラ通り）", coordApprox: false,
      summary: "道後温泉本館のすぐ近く。揚げたてのじゃこ天や、『坊っちゃん』の団子屋のモデルと伝わる老舗の坊っちゃん団子など、名物を食べ歩きできます。",
      highlights: ["谷本蒲鉾店 道後店：本館前でじゃこ天", "つぼや菓子舗：明治16年創業、元祖坊っちゃん団子", "坊っちゃん団子は抹茶・卵・小豆の3色の餅菓子", "みかんジュースの専門店も（10FACTORY 道後店など）"],
      details: [
        { label: "営業時間", value: "各店舗により異なります。お出かけ前に店舗へご確認ください（確認できなかったため掲載していません）。" },
        { label: "ご当地スイーツ", value: "松山タルト（松山藩主が長崎から持ち帰った製法に由来するという逸話）、坊っちゃん団子" }
      ],
      sources: [
        { title: "道後温泉中心エリア｜道後めぐり", url: "https://dogomeguri.com/areas/dogo-onsen-central" },
        { title: "谷本蒲鉾店 道後店｜食べログ", url: "https://tabelog.com/ehime/A3801/A380101/38006535/" },
        { title: "松山の絶品グルメ｜松山市公式観光情報サイト", url: "https://matsuyama-sightseeing.com/appeal/food/" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 150 }, color: "#e67700"
    },
    {
      id: "mitsuhama", name: "三津浜（鯛や・三津の渡し）", kana: "みつはま", category: "food",
      lat: 33.8638, lng: 132.7125, address: "愛媛県松山市三津", coordApprox: true,
      summary: "室町時代からの歴史が残る港町。約500年前から続く無料の渡し船「三津の渡し」や、登録有形文化財の古民家で味わう炊き込み鯛めしが人気です。",
      highlights: ["鯛メシ専門 鯛や：鯛メシ膳 3,080円（税込）", "営業 10:30〜14:30（L.O.14:00）、火・水定休。予約 089-951-1061", "三津浜資料館 開館・ちゃんちゃんこ展：2026/11/27〜12/21（入館料300円）", "三津浜焼き（お好み焼き系）の専門店が20軒以上"],
      details: [
        { label: "鯛や 住所", value: "松山市三津1-3-21（登録有形文化財「森家住宅」）" },
        { label: "アクセス", value: "伊予鉄高浜線 港山駅から徒歩＋無料の渡し船（約2分）＋徒歩5分で約10分／三津駅から三津浜商店街を徒歩約8分＋2分" },
        { label: "三津の朝市", value: "第37回は2026/10/24に開催済み。次回日程は確認できていません。" },
        { label: "松山の鯛めし", value: "愛媛の鯛めしは3種類。松山（中予）は炊き込み、南予の宇和島は刺身をタレ・卵で、東予は洋風焼き鯛めし。" }
      ],
      sources: [
        { title: "鯛メシ専門・鯛や 公式サイト", url: "https://taimesi.net/" },
        { title: "愛媛名物「鯛めし」3種類を食べ比べ｜いよ観ネット（2026-08-19）", url: "https://www.iyokannet.jp/blog/210" },
        { title: "第37回三津の朝市｜松山市（更新2026-10-23）", url: "https://www.city.matsuyama.ehime.jp/kanko/event/sonota/37asaichi.html" },
        { title: "松山の絶品グルメ｜松山市公式観光情報サイト", url: "https://matsuyama-sightseeing.com/appeal/food/" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 400 }, color: "#1971c2"
    },
    {
      id: "baishinji", name: "梅津寺・みきゃんパーク梅津寺", kana: "ばいしんじ", category: "sights",
      lat: 33.87497, lng: 132.70748, address: "愛媛県松山市梅津寺町1374-1", coordApprox: false,
      summary: "瀬戸内海に面した海辺の駅・梅津寺駅のすぐ前にある、みかんの魅力を伝える施設。入場無料で、ジュース工場見学と柑橘カフェが楽しめます。",
      highlights: ["入場無料・月曜休館・9:30〜16:30（夏期変更あり）", "1階：ジュースの加工場とグッズ売場、2階：みかんを使ったカフェ", "品種の特徴や栽培の歴史を学べる展示", "梅津寺駅は「東京ラブストーリー」のロケ地としても知られる"],
      details: [
        { label: "アクセス", value: "伊予鉄 高浜・横河原線「梅津寺駅」すぐ前" },
        { label: "駐車場", value: "16台（普通車13台・車椅子用1台・大型バス2台）" },
        { label: "電話", value: "089-992-9898" },
        { label: "愛媛のみかん", value: "松山市内では30種以上の柑橘を栽培。紅まどんな・せとかなどの高級品種も。" }
      ],
      sources: [
        { title: "みきゃんパーク 梅津寺 公式サイト", url: "https://www.mican-park.jp/" },
        { title: "愛媛・松山の穴場｜BRAVO MOUNTAIN", url: "https://bravo-m.futabanet.jp/articles/-/121478" },
        { title: "松山の絶品グルメ｜松山市公式観光情報サイト", url: "https://matsuyama-sightseeing.com/appeal/food/" }
      ],
      checkedAt: "2026-11-27", stamp: { radius: 200 }, color: "#f76707"
    }
  ],
  events: [
    {
      id: "ev-dogo-art", name: "蜷川実花 with EiM × 道後温泉 DOGO ART", spotId: "dogo-honkan",
      start: "2025-10-10", end: "2027-02-28", time: "ライトアップ：本館 17:00〜23:30／提灯ゲート 17:00〜23:00",
      summary: "道後温泉本館の北側と西側の障子・ガラスに蜷川実花さんらの作品（四季の花々や金魚など36点）を設置。夜はライトアップで表情が変わります。",
      sources: [ { title: "松山市内のイルミネーション情報｜松山観光コンベンション協会", url: "https://www.mcvb.jp/kankou/illumination.html" } ]
    },
    {
      id: "ev-asuka-9th", name: "飛鳥乃湯泉 9周年記念イベント", spotId: "asuka-no-yu",
      start: "2026-11-26", end: "2027-01-31", time: "今治タオル展 6:00〜23:00（大広間は22:00まで）／12/26 14:00〜 記念セレモニー・祝い餅まき",
      summary: "今治タオル展、9周年記念タオル（2,200円）の販売、12/26の祝い餅まきなど。12/26〜1/3は2階利用者に毎日先着100名でTSUBAKIヘアケアサンプルをプレゼント。",
      sources: [ { title: "飛鳥乃湯泉9周年記念イベント｜松山市（更新2026-11-16）", url: "https://www.city.matsuyama.ehime.jp/hodo/202611/9syuunen.html" } ]
    },
    {
      id: "ev-ninomaru", name: "二之丸 光の庭園（紅葉ライトアップ）", spotId: "ninomaru",
      start: "2026-11-13", end: "2026-12-06", time: "17:00〜21:00（20:30札止）", dates: ["2026-11-13","2026-11-14","2026-11-15","2026-11-21","2026-11-22","2026-11-23","2026-11-28","2026-11-29","2026-12-05","2026-12-06"],
      summary: "開催日限定。もみじのライトアップ、流水園のLEDボールなど。開催日：11/13・14・15・21・22・23・28・29、12/5・6。",
      sources: [ { title: "松山市内のイルミネーション情報｜松山観光コンベンション協会", url: "https://www.mcvb.jp/kankou/illumination.html" }, { title: "ゆりママんブログ（2026-11-23時点）", url: "https://yurimaman.com/archives/89577" } ]
    },
    {
      id: "ev-okaido-illumi", name: "大街道・銀天街のイルミネーション", spotId: "okaido-gintengai",
      start: "2026-11-11", end: "2027-02-15", endNote: "2027年2月中旬予定", time: "アーケード装飾 10:00〜翌1:00（無料）",
      summary: "紫やピンクに輝く巨大クリスマスツリー（みきゃん・ダークみきゃんも）、銀天街はシルバー×ブルーのベル型イルミネーション。",
      sources: [ { title: "ゆりママんブログ（2026-11-23時点）", url: "https://yurimaman.com/archives/89577" } ]
    },
    {
      id: "ev-hikari-no-mi", name: "道後公園「ひかりの実」", spotId: "shiki-museum",
      start: "2026-12-18", end: "2027-01-17", time: "12/18 16:00〜 1/17 24:00（無料）",
      summary: "美術家・高橋匡太さんの参加型アート。果実袋に大切な人の笑顔を描き、LEDで光る約3,000個の実を道後公園（北側入口〜西側一帯）に飾ります。13回目。ワークショップは11/20〜12/6（木金土日月祝 11:00〜17:00）に「ひみつジャナイ基地」（道後湯月町2-41）、12/18 16:00〜20:00に道後公園で開催。",
      sources: [ { title: "「ひかりの実」を開催します｜松山市（更新2026-11-12）", url: "https://www.city.matsuyama.ehime.jp/hodo/202611/161491202.html" } ]
    },
    {
      id: "ev-station-plaza", name: "松山市駅前広場のイルミネーション", spotId: null, lat: 33.8340, lng: 132.7655, coordApprox: true,
      start: "2026-11-08", end: "2027-01-31", time: "17:00〜23:00（無料）",
      summary: "新しく整備された松山市駅前広場に、中に入れる球体のクリスマスオーナメントが登場。LIGHT PARKSのサテライト会場です。",
      sources: [ { title: "ゆりママんブログ（2026-11-23時点）", url: "https://yurimaman.com/archives/89577" } ]
    },
    {
      id: "ev-light-parks", name: "えひめこどもの城「LIGHT PARKS」", spotId: null, lat: 33.76018, lng: 132.79742, coordApprox: true,
      start: "2026-11-14", end: "2027-01-31", time: "17:30〜21:30（最終入場21:00）※非点灯日あり",
      summary: "2026年から一新。高さ13m超の巨大クリスマスツリー、光のトンネルなど。大人1,500円／こども800円（3歳〜中学生）、みきゃんアプリ前売は大人1,300円／こども600円。",
      sources: [ { title: "ゆりママんブログ（2026-11-23時点）", url: "https://yurimaman.com/archives/89577" }, { title: "LIGHT PARKS 公式", url: "https://festaluce-ehime.jp/" } ]
    },
    {
      id: "ev-mitsu-museum", name: "三津浜資料館 開館・ちゃんちゃんこ展", spotId: "mitsuhama",
      start: "2026-11-27", end: "2026-12-21", time: "入館料300円（未就学児は入館不可）",
      summary: "鯛メシ専門・鯛やの公式サイトで告知されている三津浜の展示イベント。",
      sources: [ { title: "鯛メシ専門・鯛や 公式サイト", url: "https://taimesi.net/" } ]
    }
  ],
  notices: [
    { title: "12月から松山城天守は営業時間が短縮", body: "12・1月は天守 9:00〜16:30（入場16:00まで）、ロープウェイ 〜17:00。12月16日（水）は天守が定休日です。", url: "https://www.city.matsuyama.ehime.jp/kanko/kankoguide/shitestukoen/matsuyamajyo/tensyu.html" },
    { title: "坊っちゃん列車は土・日・祝のみ", body: "12/30〜1/3は運休。道後温泉発の当日便は朝8:30から整理券を配布。", url: "https://www.iyotetsu.co.jp/botchan/" }
  ],
  access: [
    { title: "松山空港から", body: "JR松山駅まで約15分、松山市駅まで約20分、道後温泉まで約40分（車・リムジンバス、目安）。", url: "https://www.matsuyama-airport.co.jp/access/index.html" },
    { title: "お得なきっぷ", body: "市内電車・郊外電車1Dayチケット 大人2,000円、市内電車・リムジンバス1Dayチケット 大人2,300円（みきゃんアプリ決済のみ、坊っちゃん列車は除く）、松山道後周遊パス 1,700円。", url: "https://www.mcvb.jp/oyakudachi/otoku.html" }
  ],
  courses: [
    {
      id: "c-dogo", name: "道後温泉まったり半日コース", tagline: "湯・文学・古刹をめぐる定番ルート", duration: "約4〜5時間（目安）",
      stops: ["dogo-station", "dogo-honkan", "dogo-street-food", "asuka-no-yu", "shiki-museum", "ishiteji"],
      tips: ["土日祝なら坊っちゃん列車（道後発9:19など）の整理券を8:30に確認", "石手寺は納経所・宝物館とも17:00まで", "子規記念博物館は火曜休館（11〜4月は17:00閉館）"]
    },
    {
      id: "c-castle", name: "松山城と城下町さんぽ", tagline: "天守・庭園・洋館・鍋焼きうどん", duration: "約5時間（目安）",
      stops: ["matsuyama-castle", "ninomaru", "bansuisou", "sakanoue-museum", "okaido-gintengai", "nabeyaki-asahi"],
      tips: ["12・1月は天守が16:30閉館（入場16:00まで）", "鍋焼うどん アサヒは木〜日のみ営業", "萬翠荘は月曜休館、坂の上の雲ミュージアムも原則月曜休館"]
    },
    {
      id: "c-sea", name: "港町と海のんびりコース", tagline: "梅津寺の海と三津浜の鯛めし", duration: "約4時間（目安）",
      stops: ["baishinji", "mitsuhama"],
      tips: ["みきゃんパークは月曜休館", "鯛やは火・水が定休（予約 089-951-1061）", "港山駅から無料の渡し船で三津浜へ"]
    },
    {
      id: "c-night", name: "冬の夜景・イルミめぐり", tagline: "光に包まれる松山の夜", duration: "約3時間（夕方〜夜・目安）",
      stops: ["okaido-gintengai", "ninomaru", "dogo-honkan", "asuka-no-yu", "shiki-museum"],
      tips: ["二之丸 光の庭園は開催日限定（残り 11/28・29、12/5・6）", "DOGO ARTの本館ライトアップは17:00〜23:30", "道後公園「ひかりの実」は12/18から"]
    }
  ]
};
