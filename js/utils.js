/* 共通ユーティリティ・安全なDOM生成・日付/イベント判定・距離計算 */
(function () {
  "use strict";

  window.MatsuyamaApp = window.MatsuyamaApp || {};

  function safeUrl(url) {
    if (typeof url !== "string") return "#/";
    var trimmed = url.trim();
    if (trimmed.startsWith("#/") || trimmed === "#" || trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
      return trimmed;
    }
    return "#/";
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs && typeof attrs === "object") {
      Object.keys(attrs).forEach(function (key) {
        var val = attrs[key];
        if (val === undefined || val === null || val === false) return;
        if (key === "className") {
          node.className = String(val);
        } else if (key === "text") {
          node.textContent = String(val);
        } else if (key === "style" && typeof val === "object") {
          Object.keys(val).forEach(function (prop) {
            if (prop.startsWith("--")) {
              node.style.setProperty(prop, String(val[prop]));
            } else {
              node.style[prop] = String(val[prop]);
            }
          });
        } else if (key === "dataset" && typeof val === "object") {
          Object.keys(val).forEach(function (dKey) {
            node.dataset[dKey] = String(val[dKey]);
          });
        } else if (key.startsWith("on") && typeof val === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), val);
        } else if (key === "href") {
          node.setAttribute("href", safeUrl(val));
        } else if (val === true) {
          node.setAttribute(key, "");
        } else {
          node.setAttribute(key, String(val));
        }
      });
    }
    appendChildren(node, children);
    return node;
  }

  function appendChildren(parent, children) {
    if (children === undefined || children === null || children === false) return;
    if (Array.isArray(children)) {
      children.forEach(function (child) {
        appendChildren(parent, child);
      });
    } else if (children instanceof Node) {
      parent.appendChild(children);
    } else {
      parent.appendChild(document.createTextNode(String(children)));
    }
  }

  function clearEl(node) {
    while (node && node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function getData() {
    return window.MATSUYAMA_DATA || {
      lastChecked: "",
      lastCheckedNote: "",
      categories: [],
      spots: [],
      events: [],
      notices: [],
      access: [],
      courses: []
    };
  }

  function getSpotById(id) {
    var spots = getData().spots || [];
    for (var i = 0; i < spots.length; i++) {
      if (spots[i].id === id) return spots[i];
    }
    return null;
  }

  function getCourseById(id) {
    var courses = getData().courses || [];
    for (var i = 0; i < courses.length; i++) {
      if (courses[i].id === id) return courses[i];
    }
    return null;
  }

  function getCategoryMeta(catId) {
    var cats = getData().categories || [];
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].id === catId) return cats[i];
    }
    return { id: catId || "other", label: "その他", icon: "📍" };
  }

  function getSpotEmoji(spot) {
    if (!spot) return "📍";
    var cat = getCategoryMeta(spot.category);
    return cat.icon || "📍";
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function getTodayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function formatShortDate(isoDate) {
    if (!isoDate || typeof isoDate !== "string") return "";
    var parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    return parseInt(parts[1], 10) + "/" + parseInt(parts[2], 10);
  }

  function formatDisplayDate(isoDate) {
    if (!isoDate || typeof isoDate !== "string") return "";
    return isoDate.replace(/-/g, "/");
  }

  function formatStampDate(isoDateTime) {
    if (!isoDateTime) return "";
    var d = new Date(isoDateTime);
    if (isNaN(d.getTime())) return "";
    return d.getFullYear() + "/" + pad2(d.getMonth() + 1) + "/" + pad2(d.getDate());
  }

  function formatStampDateTime(isoDateTime) {
    if (!isoDateTime) return "";
    var d = new Date(isoDateTime);
    if (isNaN(d.getTime())) return "";
    return (
      d.getFullYear() + "/" + pad2(d.getMonth() + 1) + "/" + pad2(d.getDate()) +
      " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes())
    );
  }

  function getEventStatus(ev, todayOverride) {
    var today = todayOverride || getTodayISO();
    var start = ev && ev.start ? String(ev.start) : "";
    var end = ev && ev.end ? String(ev.end) : "";

    if (end && today > end) {
      return {
        code: "ended",
        label: "終了",
        subLabel: "",
        className: "status-ended",
        isToday: false,
        sortOrder: 3
      };
    }

    if (start && today < start) {
      return {
        code: "upcoming",
        label: "まもなく",
        subLabel: formatShortDate(start) + "〜",
        className: "status-upcoming",
        isToday: false,
        sortOrder: 2
      };
    }

    if (ev && Array.isArray(ev.dates) && ev.dates.length > 0) {
      if (ev.dates.indexOf(today) !== -1) {
        return {
          code: "today",
          label: "開催中（本日開催）",
          subLabel: "",
          className: "status-today",
          isToday: true,
          sortOrder: 0
        };
      }
      var nextDate = null;
      for (var i = 0; i < ev.dates.length; i++) {
        if (ev.dates[i] > today) {
          if (!nextDate || ev.dates[i] < nextDate) {
            nextDate = ev.dates[i];
          }
        }
      }
      if (nextDate) {
        return {
          code: "active",
          label: "開催中",
          subLabel: "次回 " + formatShortDate(nextDate),
          className: "status-active",
          isToday: false,
          sortOrder: 1
        };
      }
      return {
        code: "ended",
        label: "終了",
        subLabel: "",
        className: "status-ended",
        isToday: false,
        sortOrder: 3
      };
    }

    return {
      code: "active",
      label: "開催中",
      subLabel: "",
      className: "status-active",
      isToday: false,
      sortOrder: 1
    };
  }

  function formatEventPeriod(ev) {
    if (!ev) return "";
    var period = formatDisplayDate(ev.start) + " 〜 " + formatDisplayDate(ev.end);
    if (ev.endNote) {
      period += "（" + ev.endNote + "）";
    }
    return period;
  }

  function getEventCoords(ev) {
    if (!ev) return null;
    if (typeof ev.lat === "number" && typeof ev.lng === "number") {
      return { lat: ev.lat, lng: ev.lng, approx: Boolean(ev.coordApprox), fromSpot: false };
    }
    if (ev.spotId) {
      var spot = getSpotById(ev.spotId);
      if (spot && typeof spot.lat === "number" && typeof spot.lng === "number") {
        return { lat: spot.lat, lng: spot.lng, approx: Boolean(spot.coordApprox), fromSpot: true, spot: spot };
      }
    }
    return null;
  }

  function haversineMeters(lat1, lng1, lat2, lng2) {
    var R = 6371000;
    var toRad = Math.PI / 180;
    var dLat = (lat2 - lat1) * toRad;
    var dLng = (lng2 - lng1) * toRad;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function truncate(str, maxLen) {
    if (!str) return "";
    var s = String(str);
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen) + "…";
  }

  function createExternalLink(text, url, className) {
    return el("a", {
      href: safeUrl(url),
      target: "_blank",
      rel: "noopener noreferrer",
      className: className || "ext-link"
    }, [text, " ↗"]);
  }

  function showToast(message, durationMs) {
    var container = document.getElementById("toast-container");
    if (!container) return;
    var toast = el("div", { className: "toast", text: message });
    container.appendChild(toast);
    var ms = durationMs || 3200;
    window.setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, ms);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return Boolean(ok);
    } catch (e) {
      return false;
    }
  }

  function createSvgEl(tag, attrs, children) {
    var ns = "http://www.w3.org/2000/svg";
    var node = document.createElementNS(ns, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, String(attrs[k]));
      });
    }
    if (Array.isArray(children)) {
      children.forEach(function (c) {
        if (c) node.appendChild(c);
      });
    }
    return node;
  }

  /* 松山城と道後温泉本館のシルエット装飾SVG（外部画像不使用） */
  function createHeroSilhouetteSvg() {
    return createSvgEl("svg", {
      class: "hero-silhouette",
      viewBox: "0 0 800 110",
      preserveAspectRatio: "none",
      "aria-hidden": "true"
    }, [
      // 瀬戸内海のゆるやかな山並み
      createSvgEl("path", {
        d: "M0 110 L0 72 Q120 42 250 66 T530 62 Q670 36 800 64 L800 110 Z",
        fill: "rgba(30, 50, 82, 0.24)"
      }),
      // 城山と松山城天守シルエット（左寄り）
      createSvgEl("g", { fill: "rgba(30, 50, 82, 0.42)", transform: "translate(70, 8)" }, [
        createSvgEl("path", { d: "M0 102 Q75 48 160 54 Q235 60 300 102 Z" }),
        // 石垣
        createSvgEl("polygon", { points: "110,56 176,56 184,70 102,70" }),
        // 1層目屋根
        createSvgEl("polygon", { points: "108,56 178,56 170,47 116,47" }),
        createSvgEl("rect", { x: "120", y: "39", width: "46", height: "9" }),
        // 2層目屋根
        createSvgEl("polygon", { points: "115,39 171,39 163,31 123,31" }),
        createSvgEl("rect", { x: "128", y: "24", width: "30", height: "8" }),
        // 最上層屋根＋しゃちほこ風
        createSvgEl("polygon", { points: "123,24 163,24 154,15 132,15" }),
        createSvgEl("rect", { x: "136", y: "12", width: "14", height: "3" }),
        createSvgEl("circle", { cx: "135", cy: "11", r: "2" }),
        createSvgEl("circle", { cx: "151", cy: "11", r: "2" })
      ]),
      // 道後温泉本館（振鷺閣イメージ）シルエット（右寄り）
      createSvgEl("g", { fill: "rgba(30, 50, 82, 0.48)", transform: "translate(515, 22)" }, [
        createSvgEl("rect", { x: "16", y: "48", width: "168", height: "42" }),
        createSvgEl("polygon", { points: "8,48 192,48 176,36 24,36" }),
        createSvgEl("rect", { x: "38", y: "24", width: "124", height: "14" }),
        createSvgEl("polygon", { points: "30,24 170,24 154,14 46,14" }),
        // 振鷺閣（太鼓楼）
        createSvgEl("rect", { x: "86", y: "4", width: "28", height: "12" }),
        createSvgEl("polygon", { points: "80,4 120,4 100,-6" }),
        // 障子風の温かい灯り
        createSvgEl("rect", { x: "93", y: "7", width: "14", height: "6", rx: "1", fill: "#FFE066", opacity: "0.9" }),
        createSvgEl("rect", { x: "48", y: "56", width: "14", height: "12", rx: "1", fill: "#FFE066", opacity: "0.7" }),
        createSvgEl("rect", { x: "72", y: "56", width: "14", height: "12", rx: "1", fill: "#FFE066", opacity: "0.7" }),
        createSvgEl("rect", { x: "114", y: "56", width: "14", height: "12", rx: "1", fill: "#FFE066", opacity: "0.7" }),
        createSvgEl("rect", { x: "138", y: "56", width: "14", height: "12", rx: "1", fill: "#FFE066", opacity: "0.7" })
      ]),
      // 手前のやさしいクリームの波
      createSvgEl("path", {
        d: "M0 110 L0 94 Q100 84 200 94 T400 94 T600 94 T800 92 L800 110 Z",
        fill: "#FFF8EC",
        opacity: "0.28"
      })
    ]);
  }

  window.MatsuyamaApp.Utils = {
    safeUrl: safeUrl,
    el: el,
    clearEl: clearEl,
    getData: getData,
    getSpotById: getSpotById,
    getCourseById: getCourseById,
    getCategoryMeta: getCategoryMeta,
    getSpotEmoji: getSpotEmoji,
    getTodayISO: getTodayISO,
    formatShortDate: formatShortDate,
    formatDisplayDate: formatDisplayDate,
    formatStampDate: formatStampDate,
    formatStampDateTime: formatStampDateTime,
    getEventStatus: getEventStatus,
    formatEventPeriod: formatEventPeriod,
    getEventCoords: getEventCoords,
    haversineMeters: haversineMeters,
    truncate: truncate,
    createExternalLink: createExternalLink,
    showToast: showToast,
    copyToClipboard: copyToClipboard,
    createSvgEl: createSvgEl,
    createHeroSilhouetteSvg: createHeroSilhouetteSvg
  };
})();
