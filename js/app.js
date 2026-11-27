/* 松山さんぽ メインアプリ（ハッシュルーティング・全画面レンダリング） */
(function () {
  "use strict";

  var U = window.MatsuyamaApp.Utils;
  var MapMod = window.MatsuyamaApp.Map;
  var Stamp = window.MatsuyamaApp.Stamp;

  var appMain = null;
  var backBtn = null;
  var routeHistoryCount = 0;
  var currentFallbackBack = "#/";

  // スポット一覧のフィルタ状態（画面内操作で維持）
  var spotsState = {
    category: "all",
    query: ""
  };

  var eventsFilterState = "all";

  function parseRoute() {
    var raw = window.location.hash || "#/";
    if (raw.charAt(0) === "#") raw = raw.slice(1);
    if (!raw) raw = "/";

    var qIndex = raw.indexOf("?");
    var path = qIndex >= 0 ? raw.slice(0, qIndex) : raw;
    var queryStr = qIndex >= 0 ? raw.slice(qIndex + 1) : "";
    var params = {};
    if (queryStr) {
      queryStr.split("&").forEach(function (pair) {
        if (!pair) return;
        var eq = pair.indexOf("=");
        var k = eq >= 0 ? decodeURIComponent(pair.slice(0, eq)) : decodeURIComponent(pair);
        var v = eq >= 0 ? decodeURIComponent(pair.slice(eq + 1)) : "";
        params[k] = v;
      });
    }

    if (path.length > 1 && path.charAt(path.length - 1) === "/") {
      path = path.slice(0, -1);
    }

    var segments = path.split("/").filter(Boolean);
    return { path: path, segments: segments, params: params };
  }

  function updateNavState(activeKey) {
    var items = document.querySelectorAll("#bottom-nav .nav-item");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var isActive = item.getAttribute("data-nav") === activeKey;
      item.classList.toggle("active", isActive);
      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    }
  }

  function updateBackButton(show, fallbackHash) {
    currentFallbackBack = fallbackHash || "#/";
    if (backBtn) {
      backBtn.hidden = !show;
    }
  }

  function renderFooter() {
    var footerInner = document.getElementById("footer-inner");
    if (!footerInner) return;
    U.clearEl(footerInner);
    var data = U.getData();

    footerInner.appendChild(U.el("div", { className: "footer-meta" }, [
      U.el("strong", { text: "松山さんぽ" }),
      U.el("span", { text: "情報確認日: " + (data.lastChecked || "—") })
    ]));
    footerInner.appendChild(U.el("p", {
      style: { margin: "0", opacity: "0.9" },
      text: "データは公式サイト等から取得しています。営業時間・料金・イベント等の最新情報は各公式サイトをご確認ください。"
    }));
    footerInner.appendChild(U.el("div", { className: "footer-links" }, [
      U.el("a", { href: "#/about", text: "出典一覧・このアプリについて" }),
      U.el("span", { text: "© OpenStreetMap contributors" })
    ]));
  }

  /* ---------------- Reusable Card Builders ---------------- */
  function createSpotCard(spot) {
    var cat = U.getCategoryMeta(spot.category);
    var stamped = Stamp.isStamped(spot.id);
    return U.el("a", {
      href: "#/spot/" + encodeURIComponent(spot.id),
      className: "spot-card",
      style: { "--accent": spot.color || "#FB8C00" }
    }, [
      U.el("div", { className: "spot-card-top" }, [
        U.el("div", { className: "spot-emoji-circle", "aria-hidden": "true", text: cat.icon }),
        U.el("div", { className: "spot-card-head" }, [
          U.el("div", { className: "spot-card-badges" }, [
            U.el("span", { className: "badge badge-" + spot.category, text: cat.label }),
            stamped ? U.el("span", { className: "badge badge-stamped", text: "✓ スタンプ済" }) : null
          ]),
          U.el("h3", { className: "spot-card-title", text: spot.name }),
          U.el("div", { className: "spot-card-kana", text: spot.kana })
        ])
      ]),
      U.el("p", { className: "spot-card-summary", text: spot.summary })
    ]);
  }

  function createEventCard(ev, options) {
    var opts = options || {};
    var status = U.getEventStatus(ev);
    var spot = ev.spotId ? U.getSpotById(ev.spotId) : null;
    var coords = U.getEventCoords(ev);

    var badges = [
      U.el("span", { className: "badge " + status.className, text: status.label }),
      status.subLabel ? U.el("span", { className: "badge badge-events", text: status.subLabel }) : null,
      ev.coordApprox ? U.el("span", { className: "badge badge-approx", text: "位置は概算" }) : null
    ];

    var metaLines = [
      U.el("div", { text: "📅 期間：" + U.formatEventPeriod(ev) }),
      ev.time ? U.el("div", { text: "🕒 時間：" + ev.time }) : null
    ];

    if (Array.isArray(ev.dates) && ev.dates.length > 0 && !opts.compact) {
      var dateListText = ev.dates.map(U.formatShortDate).join("・");
      metaLines.push(U.el("div", { text: "🗓 開催日：" + dateListText }));
    }

    var actionNodes = [];
    if (spot && !opts.hideSpotLink) {
      actionNodes.push(U.el("a", {
        href: "#/spot/" + encodeURIComponent(spot.id),
        className: "btn btn-secondary btn-sm",
        text: "📍 " + spot.name
      }));
    } else if (coords && !opts.hideMapLink) {
      actionNodes.push(U.el("a", {
        href: "#/map",
        className: "btn btn-secondary btn-sm",
        text: "🗺 地図で見る"
      }));
    }

    if (!opts.compact && Array.isArray(ev.sources) && ev.sources.length > 0) {
      ev.sources.forEach(function (src) {
        actionNodes.push(U.createExternalLink(src.title, src.url, "btn btn-secondary btn-sm"));
      });
    }

    return U.el("article", {
      className: "event-card" + (status.code === "ended" ? " is-ended" : "")
    }, [
      U.el("div", { className: "event-card-top" }, badges),
      U.el("h3", { className: "event-card-title", text: ev.name }),
      U.el("div", { className: "event-meta" }, metaLines),
      U.el("p", { className: "event-summary", text: opts.compact ? U.truncate(ev.summary, 92) : ev.summary }),
      actionNodes.length > 0 ? U.el("div", { className: "event-actions" }, actionNodes) : null
    ]);
  }

  function createStampProgressCard(options) {
    var opts = options || {};
    var count = Stamp.getStampCount();
    var total = Stamp.getTotalCount();
    var pct = total > 0 ? Math.round((count / total) * 100) : 0;
    var complete = Stamp.isComplete();
    var milestones = Stamp.getMilestones(count, total);

    return U.el("section", { className: "progress-card", "aria-label": "スタンプラリー進捗" }, [
      U.el("div", { className: "progress-header" }, [
        U.el("div", {}, [
          U.el("span", { style: { fontSize: "0.85rem", fontWeight: "800", color: "#1E3252", display: "block" }, text: "🍊 松山スタンプラリー" }),
          U.el("span", { className: "progress-count" }, [
            String(count),
            U.el("small", { text: " / " + total + " スポット" })
          ])
        ]),
        complete
          ? U.el("span", { className: "badge status-today", text: "🎉 コンプリート達成済み" })
          : U.el("span", { style: { fontSize: "0.85rem", fontWeight: "800", color: "#E8590C" }, text: pct + "%" })
      ]),
      U.el("div", {
        className: "progress-bar-track",
        role: "progressbar",
        "aria-valuenow": count,
        "aria-valuemin": 0,
        "aria-valuemax": total
      }, [
        U.el("div", { className: "progress-bar-fill", style: { width: pct + "%" } })
      ]),
      U.el("div", { className: "milestones-row" }, milestones.map(function (m) {
        return U.el("div", {
          className: "milestone-pill" + (m.achieved ? " achieved" : ""),
          text: (m.achieved ? "✓ " : "") + m.label
        });
      })),
      opts.showCta ? U.el("div", { className: "flex-row mt-12" }, [
        U.el("a", {
          href: "#/stamp",
          className: "btn btn-primary btn-sm",
          text: "スタンプ帳を開く"
        }),
        complete ? U.el("a", {
          href: "#/stamp/complete",
          className: "btn btn-stamp btn-sm",
          text: "達成証・シェアを見る"
        }) : null
      ]) : (complete ? U.el("div", { className: "mt-12" }, [
        U.el("a", {
          href: "#/stamp/complete",
          className: "btn btn-stamp btn-block",
          text: "🎉 コンプリート画面・シェアを見る"
        })
      ]) : null)
    ]);
  }

  function createCourseCard(course) {
    var stops = (course.stops || []).map(U.getSpotById).filter(Boolean);
    var stampedInCourse = stops.filter(function (s) { return Stamp.isStamped(s.id); }).length;
    var stopPreview = stops.map(function (s) { return s.name; }).join(" → ");

    return U.el("a", {
      href: "#/course/" + encodeURIComponent(course.id),
      className: "course-card"
    }, [
      U.el("div", { className: "course-meta-row" }, [
        U.el("span", { className: "badge badge-sights", text: "⏱ " + course.duration }),
        U.el("span", { className: "badge badge-food", text: stops.length + "スポット" }),
        stampedInCourse > 0
          ? U.el("span", { className: "badge badge-stamped", text: "スタンプ " + stampedInCourse + "/" + stops.length })
          : null
      ]),
      U.el("h3", { className: "spot-card-title", text: course.name }),
      U.el("p", { className: "course-tagline", text: course.tagline }),
      U.el("p", {
        style: { margin: "2px 0 0", fontSize: "0.78rem", color: "#7A7168" },
        text: U.truncate(stopPreview, 80)
      })
    ]);
  }

  function sortEventsByStatus(events) {
    return (events || []).slice().sort(function (a, b) {
      var sa = U.getEventStatus(a);
      var sb = U.getEventStatus(b);
      if (sa.sortOrder !== sb.sortOrder) return sa.sortOrder - sb.sortOrder;
      return String(a.start || "").localeCompare(String(b.start || ""));
    });
  }

  /* ---------------- View 1: Home (#/) ---------------- */
  function renderHome() {
    var data = U.getData();
    updateNavState("home");
    updateBackButton(false);

    // ヒーロー
    var hero = U.el("section", { className: "hero" }, [
      U.el("div", { className: "hero-content" }, [
        U.el("div", { className: "hero-kicker", text: "🍊 愛媛・松山のまち歩きガイド" }),
        U.el("h1", { className: "hero-title", text: "松山へ、ようこそ。" }),
        U.el("p", {
          className: "hero-sub",
          text: "道後温泉の湯けむり、城山にそびえる松山城、瀬戸内の港町とご当地グルメ。公式情報をもとに巡る松山さんぽ。"
        }),
        U.el("div", { className: "hero-meta-row" }, [
          U.el("span", { className: "hero-checked-badge", text: "最終確認日: " + data.lastChecked })
        ]),
        U.el("div", { className: "hero-quick-links" }, [
          U.el("a", { href: "#/spots", className: "hero-cta hero-cta-primary", text: "🏯 スポットを探す" }),
          U.el("a", { href: "#/map", className: "hero-cta hero-cta-secondary", text: "🗺 地図を見る" })
        ])
      ]),
      U.createHeroSilhouetteSvg()
    ]);

    // スタンプラリー進捗カード
    var stampSection = U.el("section", { className: "section" }, [
      createStampProgressCard({ showCta: true })
    ]);

    // お知らせ
    var noticesSection = U.el("section", { className: "section" }, [
      U.el("div", { className: "section-header" }, [
        U.el("h2", { className: "section-title", text: "お知らせ" })
      ]),
      U.el("div", { className: "card-stack" }, (data.notices || []).map(function (n) {
        return U.el("article", { className: "notice-card" }, [
          U.el("h3", { className: "notice-title", text: n.title }),
          U.el("p", { className: "notice-body", text: n.body }),
          n.url ? U.createExternalLink("公式案内を見る", n.url) : null
        ]);
      }))
    ]);

    // 開催中・近日開催のイベント
    var sortedEvents = sortEventsByStatus(data.events);
    var highlightEvents = sortedEvents.filter(function (ev) {
      return U.getEventStatus(ev).code !== "ended";
    });
    if (highlightEvents.length === 0) {
      highlightEvents = sortedEvents.slice(0, 4);
    } else {
      highlightEvents = highlightEvents.slice(0, 4);
    }

    var eventsSection = U.el("section", { className: "section" }, [
      U.el("div", { className: "section-header" }, [
        U.el("h2", { className: "section-title", text: "開催中・近日開催のイベント" }),
        U.el("a", { href: "#/events", className: "section-more", text: "すべて見る →" })
      ]),
      U.el("div", { className: "card-grid" }, highlightEvents.map(function (ev) {
        return createEventCard(ev, { compact: true });
      })),
      U.el("div", { className: "flex-row mt-12" }, [
        U.el("a", { href: "#/events", className: "btn btn-secondary btn-sm", text: "✨ イベント一覧（全" + (data.events || []).length + "件）" }),
        U.el("a", { href: "#/spots?cat=events", className: "btn btn-secondary btn-sm", text: "スポット画面のイベントタブへ" })
      ])
    ]);

    // おすすめコース
    var coursesSection = U.el("section", { className: "section" }, [
      U.el("div", { className: "section-header" }, [
        U.el("h2", { className: "section-title", text: "おすすめモデルコース" }),
        U.el("a", { href: "#/courses", className: "section-more", text: "すべて見る →" })
      ]),
      U.el("div", { className: "card-grid" }, (data.courses || []).map(createCourseCard))
    ]);

    // アクセス
    var accessSection = U.el("section", { className: "section" }, [
      U.el("div", { className: "section-header" }, [
        U.el("h2", { className: "section-title", text: "アクセス・お得なきっぷ" })
      ]),
      U.el("div", { className: "card-grid" }, (data.access || []).map(function (a) {
        return U.el("article", { className: "card" }, [
          U.el("h3", { className: "notice-title", text: a.title }),
          U.el("p", { className: "notice-body", text: a.body }),
          a.url ? U.createExternalLink("詳細を見る（公式サイト）", a.url) : null
        ]);
      }))
    ]);

    appMain.appendChild(hero);
    appMain.appendChild(stampSection);
    appMain.appendChild(noticesSection);
    appMain.appendChild(eventsSection);
    appMain.appendChild(coursesSection);
    appMain.appendChild(accessSection);
  }

  /* ---------------- View 2: Spots List (#/spots) ---------------- */
  function renderSpots(params) {
    var data = U.getData();
    updateNavState("spots");
    updateBackButton(false);

    if (params && params.cat) {
      spotsState.category = params.cat;
    }

    var heading = U.el("h1", { className: "page-heading", text: "スポット・イベント一覧" });

    var tabsList = [{ id: "all", label: "すべて", icon: "🍊" }].concat(data.categories || []);
    var tabButtons = [];
    var tabsBar = U.el("div", { className: "filter-tabs", role: "tablist", "aria-label": "カテゴリ絞り込み" });
    var resultCountEl = U.el("p", { className: "result-count" });
    var listContainer = U.el("div", { className: "card-grid" });

    var searchClearBtn = U.el("button", {
      type: "button",
      className: "search-clear",
      "aria-label": "検索語をクリア",
      text: "✕",
      hidden: !spotsState.query
    });

    var searchInput = U.el("input", {
      type: "search",
      className: "search-input",
      placeholder: "スポット名・かな・キーワードで検索…",
      "aria-label": "スポットやイベントを検索",
      value: spotsState.query
    });

    function updateList() {
      U.clearEl(listContainer);
      var q = (spotsState.query || "").trim().toLowerCase();
      searchClearBtn.hidden = !q;

      tabButtons.forEach(function (btn) {
        var active = btn.dataset.cat === spotsState.category;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });

      if (spotsState.category === "events") {
        var filteredEvents = sortEventsByStatus(data.events).filter(function (ev) {
          if (!q) return true;
          var hay = ((ev.name || "") + " " + (ev.summary || "") + " " + (ev.time || "")).toLowerCase();
          return hay.indexOf(q) !== -1;
        });
        resultCountEl.textContent = "イベント：" + filteredEvents.length + "件";
        if (filteredEvents.length === 0) {
          listContainer.appendChild(U.el("div", { className: "empty-state", style: { gridColumn: "1 / -1" }, text: "条件に合うイベントが見つかりませんでした。" }));
          return;
        }
        filteredEvents.forEach(function (ev) {
          listContainer.appendChild(createEventCard(ev, { compact: false }));
        });
        return;
      }

      var filteredSpots = (data.spots || []).filter(function (spot) {
        if (spotsState.category !== "all" && spot.category !== spotsState.category) return false;
        if (!q) return true;
        var hay = ((spot.name || "") + " " + (spot.kana || "") + " " + (spot.summary || "")).toLowerCase();
        return hay.indexOf(q) !== -1;
      });

      resultCountEl.textContent = "スポット：" + filteredSpots.length + "件";
      if (filteredSpots.length === 0) {
        listContainer.appendChild(U.el("div", { className: "empty-state", style: { gridColumn: "1 / -1" }, text: "条件に合うスポットが見つかりませんでした。" }));
        return;
      }
      filteredSpots.forEach(function (spot) {
        listContainer.appendChild(createSpotCard(spot));
      });
    }

    tabsList.forEach(function (cat) {
      var btn = U.el("button", {
        type: "button",
        role: "tab",
        className: "filter-tab",
        dataset: { cat: cat.id },
        text: cat.icon + " " + cat.label,
        onClick: function () {
          spotsState.category = cat.id;
          updateList();
        }
      });
      tabButtons.push(btn);
      tabsBar.appendChild(btn);
    });

    searchInput.addEventListener("input", function () {
      spotsState.query = searchInput.value;
      updateList();
    });

    searchClearBtn.addEventListener("click", function () {
      spotsState.query = "";
      searchInput.value = "";
      searchInput.focus();
      updateList();
    });

    var searchWrap = U.el("div", { className: "search-wrap" }, [
      U.el("span", { className: "search-icon", "aria-hidden": "true", text: "🔍" }),
      searchInput,
      searchClearBtn
    ]);

    appMain.appendChild(heading);
    appMain.appendChild(tabsBar);
    appMain.appendChild(searchWrap);
    appMain.appendChild(resultCountEl);
    appMain.appendChild(listContainer);

    updateList();
  }

  /* ---------------- View 3: Spot Detail (#/spot/<id>) ---------------- */
  function renderSpotDetail(spotId) {
    var data = U.getData();
    var spot = U.getSpotById(spotId);
    updateNavState("spots");
    updateBackButton(true, "#/spots");

    if (!spot) {
      appMain.appendChild(U.el("div", { className: "empty-state" }, [
        U.el("h1", { className: "page-heading", text: "スポットが見つかりません" }),
        U.el("p", { text: "指定されたスポットは存在しないか、URLが正しくありません。" }),
        U.el("a", { href: "#/spots", className: "btn btn-primary", text: "スポット一覧へ戻る" })
      ]));
      return;
    }

    var cat = U.getCategoryMeta(spot.category);
    var stampedTime = Stamp.getStampTime(spot.id);

    // ヘッダーカード
    var heroCard = U.el("section", {
      className: "detail-hero",
      style: { "--accent": spot.color || "#FB8C00" }
    }, [
      U.el("div", { className: "detail-header-row" }, [
        U.el("div", { className: "detail-emoji", "aria-hidden": "true", text: cat.icon }),
        U.el("div", { style: { flex: "1", minWidth: "0" } }, [
          U.el("div", { className: "flex-row" }, [
            U.el("span", { className: "badge badge-" + spot.category, text: cat.icon + " " + cat.label }),
            stampedTime ? U.el("span", { className: "badge badge-stamped", text: "✓ スタンプ獲得済み" }) : null,
            spot.coordApprox ? U.el("span", { className: "badge badge-approx", text: "※位置は概算です" }) : null
          ]),
          U.el("h1", { className: "detail-title", text: spot.name }),
          U.el("p", { className: "detail-kana", text: spot.kana })
        ])
      ]),
      U.el("p", { className: "detail-address" }, [
        U.el("span", { "aria-hidden": "true", text: "📍" }),
        U.el("span", { text: spot.address })
      ]),
      U.el("p", { className: "detail-summary", text: spot.summary })
    ]);

    // スタンプ取得セクション
    var stampSection = U.el("section", { className: "section card" });
    function renderSpotStampBlock() {
      U.clearEl(stampSection);
      var currentTime = Stamp.getStampTime(spot.id);
      var radius = (spot.stamp && spot.stamp.radius) ? spot.stamp.radius : 150;
      var demoOn = Stamp.isDemoMode();

      stampSection.appendChild(U.el("h2", { className: "section-title", style: { marginBottom: "12px" }, text: "スタンプラリー" }));

      if (currentTime) {
        stampSection.appendChild(U.el("div", {
          style: { display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }
        }, [
          Stamp.createStampSealElement(spot, currentTime),
          U.el("div", { style: { flex: "1", minWidth: "180px" } }, [
            U.el("p", { style: { margin: "0 0 4px", fontWeight: "800", color: "#2B8A3E" }, text: "🎉 スタンプ獲得済みです！" }),
            U.el("p", { style: { margin: "0 0 10px", fontSize: "0.85rem", color: "#5C554E" }, text: "取得日時：" + U.formatStampDateTime(currentTime) }),
            U.el("div", { className: "flex-row" }, [
              U.el("a", { href: "#/stamp", className: "btn btn-secondary btn-sm", text: "スタンプ帳を見る" }),
              Stamp.isComplete() ? U.el("a", { href: "#/stamp/complete", className: "btn btn-stamp btn-sm", text: "達成証を見る" }) : null
            ])
          ])
        ]));
        return;
      }

      var feedbackBox = U.el("div", { hidden: true });
      var stampBtn = U.el("button", {
        type: "button",
        className: "btn btn-stamp btn-block",
        text: demoOn ? "🧪 スタンプを押す（デモモード）" : "🍊 現在地でスタンプを押す",
        onClick: function () {
          Stamp.attemptStamp(spot, {
            onLoading: function (loading) {
              stampBtn.disabled = loading;
              stampBtn.textContent = loading ? "現在地を確認中…" : (Stamp.isDemoMode() ? "🧪 スタンプを押す（デモモード）" : "🍊 現在地でスタンプを押す");
            },
            onFeedback: function (type, msg) {
              feedbackBox.hidden = false;
              feedbackBox.className = "stamp-feedback is-" + type;
              feedbackBox.textContent = msg;
            },
            onSuccess: function () {
              renderSpotStampBlock();
            }
          });
        }
      });

      stampSection.appendChild(U.el("p", {
        style: { margin: "0 0 10px", fontSize: "0.86rem", color: "#5C554E" },
        text: demoOn
          ? "デモモードがONのため、位置判定をスキップしてすぐに押印できます。"
          : "このスポットの半径約" + radius + "m以内でボタンを押すとスタンプを獲得できます。"
      }));
      stampSection.appendChild(stampBtn);
      stampSection.appendChild(feedbackBox);
    }
    renderSpotStampBlock();

    // 見どころ
    var highlightsSection = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "12px" }, text: "見どころ・ポイント" }),
      U.el("ul", { className: "highlights-list" }, (spot.highlights || []).map(function (h) {
        return U.el("li", { text: h });
      }))
    ]);

    // 基本情報テーブル
    var detailsSection = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "10px" }, text: "基本情報" }),
      U.el("table", { className: "details-table" }, [
        U.el("tbody", {}, (spot.details || []).map(function (d) {
          return U.el("tr", {}, [
            U.el("th", { scope: "row", text: d.label }),
            U.el("td", { text: d.value })
          ]);
        }))
      ]),
      U.el("div", {
        className: "caution-box",
        text: "※営業時間・料金は変更される場合があります。お出かけ前に公式情報をご確認ください。"
      })
    ]);

    // 地図セクション
    var miniMapContainer = U.el("div", { className: "mini-map-container", "aria-label": spot.name + "の地図" });
    var gmapUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(spot.lat + "," + spot.lng);
    var mapSection = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "10px" }, text: "地図・アクセス" }),
      spot.coordApprox ? U.el("p", {
        className: "stamp-feedback is-info",
        style: { marginTop: "0", marginBottom: "10px" },
        text: "※このスポットの地図ピン位置は概算です。"
      }) : null,
      miniMapContainer,
      U.el("div", { className: "flex-row mt-12" }, [
        U.createExternalLink("Googleマップで開く", gmapUrl, "btn btn-blue btn-sm"),
        U.el("a", {
          href: "#/map?spot=" + encodeURIComponent(spot.id),
          className: "btn btn-secondary btn-sm",
          text: "🗺 全体地図で見る"
        })
      ])
    ]);

    // 関連イベント
    var relatedEvents = sortEventsByStatus((data.events || []).filter(function (ev) {
      return ev.spotId === spot.id;
    }));
    var relatedSection = null;
    if (relatedEvents.length > 0) {
      relatedSection = U.el("section", { className: "section" }, [
        U.el("div", { className: "section-header" }, [
          U.el("h2", { className: "section-title", text: "関連イベント" })
        ]),
        U.el("div", { className: "card-stack" }, relatedEvents.map(function (ev) {
          return createEventCard(ev, { hideSpotLink: true });
        }))
      ]);
    }

    // 出典・情報確認日
    var sourcesSection = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "10px" }, text: "出典" }),
      U.el("ul", { className: "source-list" }, (spot.sources || []).map(function (src) {
        return U.el("li", {}, [U.createExternalLink(src.title, src.url)]);
      })),
      U.el("p", { className: "checked-meta", text: "情報確認日: " + (spot.checkedAt || data.lastChecked) })
    ]);

    appMain.appendChild(heroCard);
    appMain.appendChild(stampSection);
    appMain.appendChild(highlightsSection);
    appMain.appendChild(detailsSection);
    appMain.appendChild(mapSection);
    if (relatedSection) appMain.appendChild(relatedSection);
    appMain.appendChild(sourcesSection);

    MapMod.mountSpotMiniMap(miniMapContainer, spot, Boolean(stampedTime));
  }

  /* ---------------- View 4: Full Map (#/map) ---------------- */
  function renderMap(params) {
    var data = U.getData();
    updateNavState("map");
    updateBackButton(false);

    document.body.classList.add("is-map-view");
    appMain.classList.add("is-map-main");

    var chipsList = [{ id: "all", label: "すべて", icon: "🍊" }].concat(data.categories || []);
    var chipButtons = [];
    var activeFilter = "all";
    var mapCtrl = null;

    var statusText = U.el("span");
    var statusBar = U.el("div", { className: "map-status-bar", role: "status", hidden: true }, [
      statusText,
      U.el("button", {
        type: "button",
        style: { border: "none", background: "transparent", color: "#fff", cursor: "pointer", fontWeight: "800", minWidth: "32px", minHeight: "32px" },
        "aria-label": "メッセージを閉じる",
        text: "✕",
        onClick: function () {
          statusBar.hidden = true;
        }
      })
    ]);

    function showMapStatus(msg) {
      statusText.textContent = msg;
      statusBar.hidden = false;
    }

    var chipsContainer = U.el("div", { className: "map-chips", role: "group", "aria-label": "地図のカテゴリ絞り込み" });
    chipsList.forEach(function (cat) {
      var btn = U.el("button", {
        type: "button",
        className: "map-chip" + (cat.id === activeFilter ? " active" : ""),
        text: cat.icon + " " + cat.label,
        onClick: function () {
          activeFilter = cat.id;
          chipButtons.forEach(function (b) {
            b.classList.toggle("active", b.dataset.cat === activeFilter);
          });
          if (mapCtrl) mapCtrl.setFilter(activeFilter);
        },
        dataset: { cat: cat.id }
      });
      chipButtons.push(btn);
      chipsContainer.appendChild(btn);
    });

    var toolbar = U.el("div", { className: "map-toolbar" }, [
      U.el("div", { className: "map-toolbar-row" }, [chipsContainer])
    ]);

    var mapEl = U.el("div", { id: "full-map", "aria-label": "松山市内の観光マップ" });
    var locateBtn = U.el("button", {
      type: "button",
      className: "map-locate-btn",
      text: "📍 現在地を表示",
      onClick: function () {
        if (mapCtrl) mapCtrl.locateUser(showMapStatus);
      }
    });

    var canvasWrap = U.el("div", { className: "map-canvas-wrap" }, [
      mapEl,
      statusBar,
      locateBtn
    ]);

    appMain.appendChild(toolbar);
    appMain.appendChild(canvasWrap);

    mapCtrl = MapMod.mountFullMap(mapEl, {
      focusSpotId: params && params.spot ? params.spot : null
    });
  }

  /* ---------------- View 5: Courses List (#/courses) ---------------- */
  function renderCourses() {
    var data = U.getData();
    updateNavState("courses");
    updateBackButton(false);

    appMain.appendChild(U.el("h1", { className: "page-heading", text: "モデルコース" }));
    appMain.appendChild(U.el("p", {
      style: { margin: "0 0 14px", fontSize: "0.9rem", color: "#5C554E" },
      text: "道後温泉・松山城・三津浜・冬の夜景など、テーマ別に松山の見どころを巡るおすすめルートです。"
    }));
    appMain.appendChild(U.el("div", { className: "card-grid" }, (data.courses || []).map(createCourseCard)));
  }

  /* ---------------- View 6: Course Detail (#/course/<id>) ---------------- */
  function renderCourseDetail(courseId) {
    var course = U.getCourseById(courseId);
    updateNavState("courses");
    updateBackButton(true, "#/courses");

    if (!course) {
      appMain.appendChild(U.el("div", { className: "empty-state" }, [
        U.el("h1", { className: "page-heading", text: "コースが見つかりません" }),
        U.el("a", { href: "#/courses", className: "btn btn-primary", text: "モデルコース一覧へ" })
      ]));
      return;
    }

    var stops = (course.stops || []).map(U.getSpotById).filter(Boolean);

    var headerCard = U.el("section", { className: "card" }, [
      U.el("div", { className: "flex-row", style: { marginBottom: "6px" } }, [
        U.el("span", { className: "badge badge-sights", text: "⏱ 所要時間（目安）：" + course.duration }),
        U.el("span", { className: "badge badge-food", text: "全" + stops.length + "スポット" })
      ]),
      U.el("h1", { className: "detail-title", text: course.name }),
      U.el("p", { style: { margin: "6px 0 0", color: "#5C554E", fontSize: "0.94rem" }, text: course.tagline })
    ]);

    var mapContainer = U.el("div", { className: "course-map-container", "aria-label": course.name + "のルート地図" });
    var mapSection = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "10px" }, text: "コース地図" }),
      mapContainer
    ]);

    var timelineSection = U.el("section", { className: "section" }, [
      U.el("div", { className: "section-header" }, [
        U.el("h2", { className: "section-title", text: "めぐる順番" })
      ]),
      U.el("ol", { className: "timeline" }, stops.map(function (spot, idx) {
        var cat = U.getCategoryMeta(spot.category);
        var stamped = Stamp.isStamped(spot.id);
        return U.el("li", { className: "timeline-item" }, [
          U.el("span", { className: "timeline-num", "aria-hidden": "true", text: String(idx + 1) }),
          U.el("a", {
            href: "#/spot/" + encodeURIComponent(spot.id),
            className: "timeline-card"
          }, [
            U.el("div", { className: "flex-row", style: { marginBottom: "4px" } }, [
              U.el("span", { className: "badge badge-" + spot.category, text: cat.icon + " " + cat.label }),
              stamped ? U.el("span", { className: "badge badge-stamped", text: "✓ スタンプ済" }) : null
            ]),
            U.el("h3", { className: "spot-card-title", text: spot.name }),
            U.el("p", { className: "spot-card-summary", style: { marginTop: "4px" }, text: spot.summary }),
            U.el("span", {
              style: { display: "inline-block", marginTop: "6px", fontSize: "0.82rem", fontWeight: "800", color: "#E8590C" },
              text: "スポット詳細を見る →"
            })
          ])
        ]);
      }))
    ]);

    var tipsSection = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "10px" }, text: "めぐり方のヒント・注意点" }),
      U.el("ul", { className: "highlights-list" }, (course.tips || []).map(function (t) {
        return U.el("li", { text: t });
      }))
    ]);

    appMain.appendChild(headerCard);
    appMain.appendChild(mapSection);
    appMain.appendChild(timelineSection);
    appMain.appendChild(tipsSection);

    MapMod.mountCourseMap(mapContainer, course, stops);
  }

  /* ---------------- View 7: Stamp Rally Book (#/stamp) ---------------- */
  function renderStampBook() {
    var data = U.getData();
    updateNavState("stamp");
    updateBackButton(false);

    var demoOn = Stamp.isDemoMode();

    appMain.appendChild(U.el("h1", { className: "page-heading", text: "松山スタンプラリー" }));

    // デモ/テストモードトグル
    var demoCheckbox = U.el("input", {
      type: "checkbox",
      className: "switch-input",
      id: "demo-mode-toggle",
      checked: demoOn ? true : false
    });
    demoCheckbox.checked = demoOn;

    demoCheckbox.addEventListener("change", function () {
      Stamp.setDemoMode(demoCheckbox.checked);
      U.showToast(demoCheckbox.checked ? "🧪 デモモードをONにしました（位置判定スキップ）" : "デモモードをOFFにしました（GPS位置判定）");
      // 再描画して各ボタン表示を同期
      U.clearEl(appMain);
      renderStampBook();
    });

    var demoToggleCard = U.el("div", {
      className: "demo-toggle-card" + (demoOn ? " is-on" : "")
    }, [
      U.el("div", {}, [
        U.el("strong", { style: { display: "block", fontSize: "0.94rem", color: "#1E3252" }, text: "🧪 デモ／テストモード" }),
        U.el("span", { style: { fontSize: "0.8rem", color: "#5C554E" }, text: "ONにすると位置情報判定をスキップして押印を試せます" })
      ]),
      U.el("label", { className: "switch-label", for: "demo-mode-toggle" }, [
        demoCheckbox,
        U.el("span", { className: "switch-track", "aria-hidden": "true" })
      ])
    ]);

    appMain.appendChild(demoToggleCard);
    appMain.appendChild(createStampProgressCard({ showCta: false }));

    // フィードバック表示エリア（一覧共通）
    var globalFeedback = U.el("div", { hidden: true, style: { marginTop: "12px" } });
    appMain.appendChild(globalFeedback);

    // スタンプ台帳グリッド
    var gridSection = U.el("section", { className: "section" }, [
      U.el("div", { className: "section-header" }, [
        U.el("h2", { className: "section-title", text: "スタンプ台帳（全" + (data.spots || []).length + "スポット）" })
      ])
    ]);

    var grid = U.el("div", { className: "stamp-grid" });

    (data.spots || []).forEach(function (spot) {
      var stampTime = Stamp.getStampTime(spot.id);
      var radius = (spot.stamp && spot.stamp.radius) ? spot.stamp.radius : 150;

      var cardChildren = [
        U.el("div", { className: "stamp-seal-wrap" }, [
          Stamp.createStampSealElement(spot, stampTime)
        ]),
        U.el("h3", { className: "stamp-card-name", text: spot.name }),
        U.el("p", {
          className: "stamp-card-sub",
          text: stampTime ? ("取得: " + U.formatStampDate(stampTime)) : (demoOn ? "デモモードで押印可" : "判定範囲: 半径" + radius + "m")
        })
      ];

      if (stampTime) {
        cardChildren.push(U.el("a", {
          href: "#/spot/" + encodeURIComponent(spot.id),
          className: "btn btn-secondary btn-sm btn-block",
          text: "スポット詳細"
        }));
      } else {
        var btn = U.el("button", {
          type: "button",
          className: "btn btn-stamp btn-sm btn-block",
          text: "スタンプを押す",
          onClick: function () {
            Stamp.attemptStamp(spot, {
              onLoading: function (loading) {
                btn.disabled = loading;
                btn.textContent = loading ? "確認中…" : "スタンプを押す";
              },
              onFeedback: function (type, msg) {
                globalFeedback.hidden = false;
                globalFeedback.className = "stamp-feedback is-" + type;
                globalFeedback.textContent = "【" + spot.name + "】" + msg;
                if (type === "error") {
                  globalFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
              },
              onSuccess: function () {
                U.clearEl(appMain);
                renderStampBook();
              }
            });
          }
        });
        cardChildren.push(btn);
        cardChildren.push(U.el("a", {
          href: "#/spot/" + encodeURIComponent(spot.id),
          style: { fontSize: "0.78rem", fontWeight: "700", marginTop: "2px", padding: "4px 8px" },
          text: "詳細・地図を見る →"
        }));
      }

      grid.appendChild(U.el("article", {
        className: "stamp-card" + (stampTime ? " is-stamped" : ""),
        style: { "--accent": spot.color || "#E8590C" }
      }, cardChildren));
    });

    gridSection.appendChild(grid);
    appMain.appendChild(gridSection);

    // リセットボタン
    var resetSection = U.el("section", { className: "section card", style: { textAlign: "center" } }, [
      U.el("p", {
        style: { margin: "0 0 10px", fontSize: "0.84rem", color: "#5C554E" },
        text: "スタンプの獲得履歴はこの端末のブラウザ（localStorage）に保存されています。"
      }),
      U.el("button", {
        type: "button",
        className: "btn btn-danger-outline btn-sm",
        text: "🗑 スタンプをすべてリセット",
        disabled: Stamp.getStampCount() === 0 ? true : false,
        onClick: function () {
          Stamp.showResetConfirmModal(function () {
            U.showToast("スタンプ履歴をリセットしました");
            U.clearEl(appMain);
            renderStampBook();
          });
        }
      })
    ]);

    appMain.appendChild(resetSection);
  }

  /* ---------------- View 8: Stamp Complete (#/stamp/complete) ---------------- */
  function renderStampComplete() {
    var data = U.getData();
    updateNavState("stamp");
    updateBackButton(true, "#/stamp");

    var count = Stamp.getStampCount();
    var total = Stamp.getTotalCount();
    var complete = Stamp.isComplete();

    if (!complete) {
      appMain.appendChild(U.el("div", { className: "empty-state" }, [
        U.el("h1", { className: "page-heading", text: "コンプリートまであと " + (total - count) + " スポット！" }),
        U.el("p", { text: "現在 " + count + " / " + total + " 個のスタンプを獲得しています。すべて集めるとコンプリート達成証が表示されます。" }),
        U.el("a", { href: "#/stamp", className: "btn btn-primary", text: "スタンプ帳へ戻る" })
      ]));
      return;
    }

    var fwCoords = [
      { left: "10%", top: "16%", ch: "🍊", delay: "0s" },
      { left: "86%", top: "14%", ch: "✨", delay: "0.4s" },
      { left: "22%", top: "74%", ch: "🎉", delay: "0.9s" },
      { left: "78%", top: "70%", ch: "🍊", delay: "1.2s" },
      { left: "50%", top: "10%", ch: "🌸", delay: "0.6s" },
      { left: "14%", top: "48%", ch: "✨", delay: "1.5s" },
      { left: "90%", top: "44%", ch: "🎊", delay: "0.2s" }
    ];

    var hero = U.el("section", { className: "complete-hero" }, [
      U.el("div", { className: "complete-fireworks", "aria-hidden": "true" }, fwCoords.map(function (f) {
        return U.el("span", {
          className: "fw-dot",
          text: f.ch,
          style: { left: f.left, top: f.top, animationDelay: f.delay }
        });
      })),
      U.el("div", { style: { position: "relative", zIndex: "2" } }, [
        U.el("div", { style: { fontSize: "2.8rem", lineHeight: "1" }, "aria-hidden": "true", text: "👑🍊🎉" }),
        U.el("h1", { className: "complete-title", text: "コンプリートおめでとう！" }),
        U.el("p", {
          style: { margin: "0", fontSize: "0.98rem", opacity: "0.95" },
          text: "松山さんぽ 全" + total + "スポットを完全制覇しました！あなたは立派な「松山マスター」です。"
        })
      ])
    ]);

    // シェアテキスト
    var shareText = Stamp.buildShareText();
    var shareSection = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "10px" }, text: "達成をシェアしよう" }),
      U.el("div", { className: "share-box", text: shareText }),
      U.el("button", {
        type: "button",
        className: "btn btn-primary btn-block",
        text: "📋 シェア用テキストをコピー",
        onClick: function () {
          U.copyToClipboard(shareText).then(function (ok) {
            U.showToast(ok ? "シェア用テキストをコピーしました！" : "コピーに失敗しました。上のテキストを手動で選択してコピーしてください。");
          });
        }
      })
    ]);

    // 取得日時一覧
    var stamps = Stamp.getStamps();
    var rows = (data.spots || []).map(function (spot) {
      return {
        spot: spot,
        iso: stamps[spot.id] || ""
      };
    }).sort(function (a, b) {
      return String(a.iso).localeCompare(String(b.iso));
    });

    var historySection = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "10px" }, text: "獲得日時一覧" }),
      U.el("table", { className: "details-table" }, [
        U.el("tbody", {}, rows.map(function (row, idx) {
          return U.el("tr", {}, [
            U.el("th", { scope: "row", text: (idx + 1) + ". " + row.spot.name }),
            U.el("td", { text: U.formatStampDateTime(row.iso) })
          ]);
        }))
      ])
    ]);

    var backArea = U.el("div", { className: "mt-16" }, [
      U.el("a", { href: "#/stamp", className: "btn btn-secondary btn-block", text: "スタンプ帳へ戻る" })
    ]);

    appMain.appendChild(hero);
    appMain.appendChild(shareSection);
    appMain.appendChild(historySection);
    appMain.appendChild(backArea);
  }

  /* ---------------- View 9: Events Page (#/events) ---------------- */
  function renderEventsPage() {
    var data = U.getData();
    updateNavState("spots");
    updateBackButton(true, "#/");

    appMain.appendChild(U.el("h1", { className: "page-heading", text: "イベント情報" }));

    var filters = [
      { id: "all", label: "すべて" },
      { id: "active", label: "開催中" },
      { id: "upcoming", label: "まもなく" },
      { id: "ended", label: "終了" }
    ];

    var buttons = [];
    var filterBar = U.el("div", { className: "filter-tabs", role: "tablist", "aria-label": "開催状況絞り込み" });
    var countEl = U.el("p", { className: "result-count" });
    var listEl = U.el("div", { className: "card-stack" });

    function updateEventsList() {
      U.clearEl(listEl);
      buttons.forEach(function (b) {
        var active = b.dataset.filter === eventsFilterState;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
      });

      var sorted = sortEventsByStatus(data.events).filter(function (ev) {
        if (eventsFilterState === "all") return true;
        var code = U.getEventStatus(ev).code;
        if (eventsFilterState === "active") return code === "active" || code === "today";
        return code === eventsFilterState;
      });

      countEl.textContent = "表示件数：" + sorted.length + "件（基準日：" + U.formatDisplayDate(U.getTodayISO()) + "）";
      if (sorted.length === 0) {
        listEl.appendChild(U.el("div", { className: "empty-state", text: "該当するイベントはありません。" }));
        return;
      }
      sorted.forEach(function (ev) {
        listEl.appendChild(createEventCard(ev, { compact: false }));
      });
    }

    filters.forEach(function (f) {
      var btn = U.el("button", {
        type: "button",
        role: "tab",
        className: "filter-tab",
        dataset: { filter: f.id },
        text: f.label,
        onClick: function () {
          eventsFilterState = f.id;
          updateEventsList();
        }
      });
      buttons.push(btn);
      filterBar.appendChild(btn);
    });

    appMain.appendChild(filterBar);
    appMain.appendChild(countEl);
    appMain.appendChild(listEl);
    updateEventsList();
  }

  /* ---------------- View 10: About & Sources (#/about) ---------------- */
  function renderAbout() {
    var data = U.getData();
    updateNavState("");
    updateBackButton(true, "#/");

    appMain.appendChild(U.el("h1", { className: "page-heading", text: "出典・このアプリについて" }));

    appMain.appendChild(U.el("section", { className: "card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "8px" }, text: "松山さんぽについて" }),
      U.el("p", {
        style: { margin: "0 0 8px", fontSize: "0.92rem" },
        text: "「松山さんぽ」は、愛媛県松山市の観光スポット・温泉・グルメ・イベント・モデルコース・GPSスタンプラリーをまとめた静的Webアプリです。"
      }),
      U.el("p", {
        style: { margin: "0 0 8px", fontSize: "0.88rem", color: "#5C554E" },
        text: "最終確認日：" + data.lastChecked + "（" + data.lastCheckedNote + "）"
      }),
      U.el("p", {
        style: { margin: "0", fontSize: "0.85rem", color: "#5C554E" },
        text: "地図データ：© OpenStreetMap contributors ／ 地図ライブラリ：Leaflet"
      })
    ]));

    // スポット別出典
    var spotSourcesCard = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "12px" }, text: "スポット情報の出典（全" + (data.spots || []).length + "件）" }),
      U.el("div", { className: "card-stack" }, (data.spots || []).map(function (spot) {
        return U.el("div", { style: { paddingBottom: "10px", borderBottom: "1px solid #ECDCC5" } }, [
          U.el("div", { style: { marginBottom: "4px" } }, [
            U.el("a", {
              href: "#/spot/" + encodeURIComponent(spot.id),
              style: { fontWeight: "800", color: "#1E3252" },
              text: spot.name
            }),
            U.el("span", { style: { marginLeft: "8px", fontSize: "0.76rem", color: "#7A7168" }, text: "確認日: " + spot.checkedAt })
          ]),
          U.el("ul", { className: "source-list" }, (spot.sources || []).map(function (src) {
            return U.el("li", {}, [U.createExternalLink(src.title, src.url)]);
          }))
        ]);
      }))
    ]);

    // イベント別出典
    var eventSourcesCard = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "12px" }, text: "イベント情報の出典（全" + (data.events || []).length + "件）" }),
      U.el("div", { className: "card-stack" }, (data.events || []).map(function (ev) {
        return U.el("div", { style: { paddingBottom: "10px", borderBottom: "1px solid #ECDCC5" } }, [
          U.el("strong", { style: { display: "block", marginBottom: "4px", color: "#1E3252" }, text: ev.name }),
          U.el("ul", { className: "source-list" }, (ev.sources || []).map(function (src) {
            return U.el("li", {}, [U.createExternalLink(src.title, src.url)]);
          }))
        ]);
      }))
    ]);

    // お知らせ・アクセス出典
    var miscLinks = [].concat(data.notices || [], data.access || []).filter(function (item) { return Boolean(item.url); });
    var miscSourcesCard = U.el("section", { className: "section card" }, [
      U.el("h2", { className: "section-title", style: { marginBottom: "10px" }, text: "お知らせ・アクセス情報の出典" }),
      U.el("ul", { className: "source-list" }, miscLinks.map(function (item) {
        return U.el("li", {}, [U.createExternalLink(item.title, item.url)]);
      }))
    ]);

    appMain.appendChild(spotSourcesCard);
    appMain.appendChild(eventSourcesCard);
    appMain.appendChild(miscSourcesCard);
  }

  /* ---------------- Router ---------------- */
  function renderRoute() {
    if (!appMain) return;

    if (Stamp && typeof Stamp.closeModal === "function") {
      Stamp.closeModal({ skipFocusRestore: true });
    }
    MapMod.destroyAllMaps();
    document.body.classList.remove("is-map-view");
    appMain.classList.remove("is-map-main");
    U.clearEl(appMain);

    var route = parseRoute();
    var segs = route.segments;

    if (segs.length === 0) {
      renderHome();
    } else if (segs[0] === "spots") {
      renderSpots(route.params);
    } else if (segs[0] === "spot" && segs[1]) {
      renderSpotDetail(decodeURIComponent(segs[1]));
    } else if (segs[0] === "map") {
      renderMap(route.params);
    } else if (segs[0] === "stamp" && segs[1] === "complete") {
      renderStampComplete();
    } else if (segs[0] === "stamp") {
      renderStampBook();
    } else if (segs[0] === "courses") {
      renderCourses();
    } else if (segs[0] === "course" && segs[1]) {
      renderCourseDetail(decodeURIComponent(segs[1]));
    } else if (segs[0] === "events") {
      renderEventsPage();
    } else if (segs[0] === "about") {
      renderAbout();
    } else {
      updateNavState("");
      updateBackButton(true, "#/");
      appMain.appendChild(U.el("div", { className: "empty-state" }, [
        U.el("h1", { className: "page-heading", text: "ページが見つかりません" }),
        U.el("p", { text: "お探しのページは存在しないか、URLが正しくありません。" }),
        U.el("a", { href: "#/", className: "btn btn-primary", text: "ホームへ戻る" })
      ]));
    }

    Stamp.syncGlobalIndicators();
    window.scrollTo(0, 0);
  }

  function init() {
    appMain = document.getElementById("app-main");
    backBtn = document.getElementById("header-back-btn");

    if (backBtn) {
      backBtn.addEventListener("click", function () {
        if (routeHistoryCount > 1 && window.history.length > 1) {
          window.history.back();
        } else {
          window.location.hash = currentFallbackBack;
        }
      });
    }

    renderFooter();
    Stamp.syncGlobalIndicators();

    window.addEventListener("hashchange", function () {
      routeHistoryCount++;
      renderRoute();
    });

    routeHistoryCount = 1;
    renderRoute();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
