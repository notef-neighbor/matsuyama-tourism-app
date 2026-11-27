/* スタンプラリー機能（localStorage永続化・GPS距離判定・デモモード・押印アニメ・シェア） */
(function () {
  "use strict";

  window.MatsuyamaApp = window.MatsuyamaApp || {};

  var STORAGE_KEY = "matsuyama_stamps_v1";
  var DEMO_KEY = "matsuyama_stamp_demo_v1";

  function safeReadJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return (parsed && typeof parsed === "object") ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function getStamps() {
    return safeReadJSON(STORAGE_KEY, {});
  }

  function saveStamps(stamps) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stamps));
    } catch (e) {
      // storage quota / private mode
    }
  }

  function isStamped(spotId) {
    var stamps = getStamps();
    return Boolean(stamps[spotId]);
  }

  function getStampTime(spotId) {
    var stamps = getStamps();
    return stamps[spotId] || null;
  }

  function getTotalCount() {
    var U = window.MatsuyamaApp.Utils;
    return (U.getData().spots || []).length;
  }

  function getStampCount() {
    var U = window.MatsuyamaApp.Utils;
    var spots = U.getData().spots || [];
    var stamps = getStamps();
    var count = 0;
    for (var i = 0; i < spots.length; i++) {
      if (stamps[spots[i].id]) count++;
    }
    return count;
  }

  function isComplete() {
    var total = getTotalCount();
    return total > 0 && getStampCount() >= total;
  }

  function resetStamps() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  function isDemoMode() {
    try {
      return window.localStorage.getItem(DEMO_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setDemoMode(enabled) {
    try {
      window.localStorage.setItem(DEMO_KEY, enabled ? "1" : "0");
    } catch (e) {
      // ignore
    }
    syncGlobalIndicators();
  }

  function syncGlobalIndicators() {
    var demoBanner = document.getElementById("demo-global-banner");
    var demoOn = isDemoMode();
    if (demoBanner) {
      demoBanner.hidden = !demoOn;
    }
    document.body.classList.toggle("has-demo-banner", demoOn);

    var badge = document.getElementById("nav-stamp-badge");
    if (badge) {
      var count = getStampCount();
      var total = getTotalCount();
      if (count > 0) {
        badge.textContent = count + "/" + total;
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }
  }

  function getMilestones(count, total) {
    return [
      { target: 5, label: "5個: ビギナー🍊", achieved: count >= 5 },
      { target: 10, label: "10個: 松山ツウ🏯", achieved: count >= 10 },
      { target: total, label: total + "個: マスター👑", achieved: count >= total && total > 0 }
    ];
  }

  function createStampSealElement(spot, isoTime, extraClass) {
    var U = window.MatsuyamaApp.Utils;
    var emoji = U.getSpotEmoji(spot);
    if (isoTime) {
      return U.el("div", {
        className: "stamp-ink" + (extraClass ? " " + extraClass : ""),
        style: { "--accent": spot.color || "#C93A2B" },
        "aria-label": spot.name + " スタンプ取得済み（" + U.formatStampDate(isoTime) + "）"
      }, [
        U.el("span", { className: "stamp-ink-emoji", text: emoji }),
        U.el("span", { className: "stamp-ink-label", text: "松山・済" }),
        U.el("span", { className: "stamp-ink-date", text: U.formatStampDate(isoTime) })
      ]);
    }
    return U.el("div", {
      className: "stamp-empty",
      "aria-label": spot.name + " 未取得"
    }, [
      U.el("span", { className: "stamp-empty-emoji", text: emoji }),
      U.el("span", { text: "未取得" })
    ]);
  }

  function recordStamp(spot) {
    var stamps = getStamps();
    var isoNow = new Date().toISOString();
    stamps[spot.id] = isoNow;
    saveStamps(stamps);
    syncGlobalIndicators();
    return isoNow;
  }

  var modalKeydownHandler = null;
  var lastFocusedEl = null;

  function closeModal(options) {
    var opts = options || {};
    var root = document.getElementById("modal-root");
    var active = document.activeElement;
    if (root && active && root.contains && root.contains(active) && typeof active.blur === "function") {
      try { active.blur(); } catch (e) { /* noop */ }
    }
    if (root) {
      window.MatsuyamaApp.Utils.clearEl(root);
    }
    if (document.body) {
      document.body.classList.remove("is-modal-open");
    }
    if (modalKeydownHandler) {
      document.removeEventListener("keydown", modalKeydownHandler);
      modalKeydownHandler = null;
    }
    var prev = lastFocusedEl;
    lastFocusedEl = null;
    if (!opts.skipFocusRestore && prev && typeof prev.focus === "function" && document.body && document.body.contains && document.body.contains(prev)) {
      try { prev.focus(); } catch (e) { /* noop */ }
    }
  }

  function mountModal(dialog, onEscape) {
    var root = document.getElementById("modal-root");
    if (!root) return;
    closeModal({ skipFocusRestore: true });
    lastFocusedEl = document.activeElement || null;
    root.appendChild(dialog);
    if (document.body) {
      document.body.classList.add("is-modal-open");
    }
    modalKeydownHandler = function (e) {
      if (e.key === "Escape") {
        if (typeof onEscape === "function") {
          onEscape();
        } else {
          closeModal();
        }
      }
    };
    document.addEventListener("keydown", modalKeydownHandler);
    if (dialog.querySelector) {
      var focusTarget = dialog.querySelector("a, button");
      if (focusTarget && typeof focusTarget.focus === "function") {
        try { focusTarget.focus(); } catch (e) { /* noop */ }
      }
    }
  }

  function showStampCelebrationModal(spot, isoTime, newCount, totalCount, onAfterClose) {
    var U = window.MatsuyamaApp.Utils;
    var root = document.getElementById("modal-root");
    if (!root) return;

    var particles = ["🍊", "✨", "🎉", "🍊", "♨️", "🌸", "🍊", "✨", "🏯", "🍊"];
    var burstNodes = particles.map(function (ch, idx) {
      var angle = (idx / particles.length) * Math.PI * 2;
      var dist = 95 + (idx % 3) * 28;
      var tx = Math.round(Math.cos(angle) * dist) + "px";
      var ty = Math.round(Math.sin(angle) * dist) + "px";
      var rot = ((idx % 2 === 0 ? 1 : -1) * (120 + idx * 18)) + "deg";
      return U.el("span", {
        className: "confetti-piece",
        text: ch,
        style: { "--tx": tx, "--ty": ty, "--rot": rot }
      });
    });

    var isAllDone = newCount >= totalCount && totalCount > 0;
    var milestoneMsg = "";
    if (isAllDone) {
      milestoneMsg = "🎊 全" + totalCount + "スポットを制覇しました！コンプリートおめでとうございます！";
    } else if (newCount === 10) {
      milestoneMsg = "🏯 10個達成！「松山ツウ」ランクに到達しました！";
    } else if (newCount === 5) {
      milestoneMsg = "🍊 5個達成！「松山ビギナー」ランクに到達しました！";
    }

    function handleClose() {
      closeModal();
      if (typeof onAfterClose === "function") onAfterClose();
    }

    var buttons = [];
    if (isAllDone) {
      buttons.push(U.el("a", {
        href: "#/stamp/complete",
        className: "btn btn-stamp btn-block",
        text: "🎉 コンプリート画面を見る",
        onClick: function () {
          closeModal({ skipFocusRestore: true });
        }
      }));
    }
    buttons.push(U.el("button", {
      type: "button",
      className: isAllDone ? "btn btn-secondary btn-block mt-8" : "btn btn-primary btn-block",
      text: "閉じる",
      onClick: handleClose
    }));

    var dialog = U.el("div", {
      className: "modal-backdrop",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "stamp-modal-title",
      onClick: function (e) {
        if (e.target === dialog) handleClose();
      }
    }, [
      U.el("div", { className: "modal-card" }, [
        U.el("div", { className: "confetti-burst", "aria-hidden": "true" }, burstNodes),
        U.el("p", {
          style: { margin: "0", fontSize: "0.85rem", fontWeight: "800", color: "#C93A2B" },
          text: isDemoMode() ? "🧪 デモモードで獲得！" : "🍊 スタンプ獲得！"
        }),
        U.el("h2", {
          id: "stamp-modal-title",
          style: { margin: "4px 0 8px", fontSize: "1.25rem", fontWeight: "900", color: "#1E3252" },
          text: spot.name
        }),
        U.el("div", { className: "stamp-seal-wrap", style: { margin: "4px auto 10px" } }, [
          createStampSealElement(spot, isoTime, "stamp-anim-seal")
        ]),
        U.el("p", {
          style: { margin: "0 0 8px", fontSize: "0.92rem", fontWeight: "800", color: "#2B2B2B" },
          text: "現在の獲得数： " + newCount + " / " + totalCount
        }),
        milestoneMsg ? U.el("div", {
          className: "stamp-feedback is-success",
          style: { marginBottom: "14px" },
          text: milestoneMsg
        }) : null,
        U.el("div", { style: { marginTop: "14px" } }, buttons)
      ])
    ]);

    mountModal(dialog, handleClose);
  }

  function showResetConfirmModal(onConfirm) {
    var U = window.MatsuyamaApp.Utils;
    var root = document.getElementById("modal-root");
    if (!root) return;

    var dialog = U.el("div", {
      className: "modal-backdrop",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "reset-modal-title",
      onClick: function (e) {
        if (e.target === dialog) closeModal();
      }
    }, [
      U.el("div", { className: "modal-card" }, [
        U.el("h2", {
          id: "reset-modal-title",
          style: { margin: "0 0 10px", fontSize: "1.15rem", fontWeight: "900", color: "#1E3252" },
          text: "スタンプをリセットしますか？"
        }),
        U.el("p", {
          style: { margin: "0 0 18px", fontSize: "0.9rem", color: "#5C554E" },
          text: "これまでに獲得したスタンプの記録がすべて削除されます。この操作は取り消せません。"
        }),
        U.el("div", { className: "flex-row", style: { justifyContent: "center" } }, [
          U.el("button", {
            type: "button",
            className: "btn btn-secondary",
            text: "キャンセル",
            onClick: closeModal
          }),
          U.el("button", {
            type: "button",
            className: "btn btn-stamp",
            text: "リセットする",
            onClick: function () {
              closeModal();
              resetStamps();
              syncGlobalIndicators();
              if (typeof onConfirm === "function") onConfirm();
            }
          })
        ])
      ])
    ]);

    mountModal(dialog, closeModal);
  }

  function attemptStamp(spot, callbacks) {
    var U = window.MatsuyamaApp.Utils;
    var cb = callbacks || {};
    var onFeedback = cb.onFeedback || function () {};
    var onSuccess = cb.onSuccess || function () {};
    var onLoading = cb.onLoading || function () {};

    if (!spot) return;
    if (isStamped(spot.id)) {
      onFeedback("info", "このスポットのスタンプはすでに獲得済みです。");
      return;
    }

    var total = getTotalCount();
    if (isDemoMode()) {
      var isoDemo = recordStamp(spot);
      var newCountDemo = getStampCount();
      onFeedback("success", "デモモードで「" + spot.name + "」のスタンプを獲得しました！");
      onSuccess(isoDemo);
      showStampCelebrationModal(spot, isoDemo, newCountDemo, total);
      return;
    }

    if (!navigator.geolocation) {
      onFeedback("error", "このブラウザは位置情報（Geolocation）に対応していません。スタンプ帳の「デモモード」をONにするとテストできます。");
      return;
    }

    onLoading(true);
    onFeedback("info", "現在地を確認しています…");

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        onLoading(false);
        var radius = (spot.stamp && typeof spot.stamp.radius === "number") ? spot.stamp.radius : 150;
        var dist = U.haversineMeters(pos.coords.latitude, pos.coords.longitude, spot.lat, spot.lng);
        if (dist <= radius) {
          var isoNow = recordStamp(spot);
          var newCount = getStampCount();
          onFeedback("success", "現在地を確認（約" + Math.round(dist) + "m）。スタンプを獲得しました！");
          onSuccess(isoNow);
          showStampCelebrationModal(spot, isoNow, newCount, total);
        } else {
          var remaining = Math.max(1, Math.round(dist - radius));
          onFeedback(
            "error",
            "あと約" + remaining.toLocaleString("ja-JP") + "m離れています（スポットまで約" +
            Math.round(dist).toLocaleString("ja-JP") + "m／判定範囲：半径" + radius + "m以内）。"
          );
        }
      },
      function (err) {
        onLoading(false);
        var msg = "位置情報を取得できませんでした。";
        if (err && err.code === 1) {
          msg = "位置情報の利用が拒否されました。ブラウザの設定で位置情報を許可するか、スタンプ帳の「デモモード」をお試しください。";
          if (window.isSecureContext === false) {
            msg += "（※位置情報は HTTPS または localhost でのみ利用できます）";
          }
        } else if (err && err.code === 2) {
          msg = "現在地を特定できませんでした。屋外など電波状況の良い場所で再度お試しください。";
        } else if (err && err.code === 3) {
          msg = "位置情報の取得がタイムアウトしました。少し待ってからもう一度お試しください。";
        }
        onFeedback("error", msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  }

  function buildShareText() {
    var U = window.MatsuyamaApp.Utils;
    var count = getStampCount();
    var total = getTotalCount();
    var lines = [
      "🍊 松山さんぽ スタンプラリー 🍊",
      count >= total
        ? "全" + total + "スポットをコンプリートしました！🎉"
        : count + " / " + total + " スポットを巡りました！",
      "道後温泉・松山城・三津浜など、松山の魅力を満喫✨",
      "#松山さんぽ #松山観光 #道後温泉 #松山城"
    ];
    return lines.join("\n");
  }

  window.MatsuyamaApp.Stamp = {
    STORAGE_KEY: STORAGE_KEY,
    DEMO_KEY: DEMO_KEY,
    getStamps: getStamps,
    isStamped: isStamped,
    getStampTime: getStampTime,
    getTotalCount: getTotalCount,
    getStampCount: getStampCount,
    isComplete: isComplete,
    resetStamps: resetStamps,
    isDemoMode: isDemoMode,
    setDemoMode: setDemoMode,
    syncGlobalIndicators: syncGlobalIndicators,
    getMilestones: getMilestones,
    createStampSealElement: createStampSealElement,
    attemptStamp: attemptStamp,
    closeModal: closeModal,
    showResetConfirmModal: showResetConfirmModal,
    buildShareText: buildShareText
  };
})();
