/* Leaflet 地図モジュール（OpenStreetMap・divIcon自作ピン・現在地・コース折れ線） */
(function () {
  "use strict";

  window.MatsuyamaApp = window.MatsuyamaApp || {};

  var OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  var OSM_ATTRIBUTION = "&copy; OpenStreetMap contributors";
  var MATSUYAMA_CENTER = [33.845, 132.765];

  var activeMaps = [];
  var resizeHandler = null;
  var activeObservers = [];
  var pendingTimers = [];

  function hasLeaflet() {
    return typeof window.L !== "undefined" && typeof window.L.map === "function";
  }

  function destroyAllMaps() {
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
    while (pendingTimers.length > 0) {
      window.clearTimeout(pendingTimers.pop());
    }
    while (activeObservers.length > 0) {
      var obs = activeObservers.pop();
      try { obs.disconnect(); } catch (e) { /* noop */ }
    }
    while (activeMaps.length > 0) {
      var m = activeMaps.pop();
      try {
        m.remove();
      } catch (e) {
        // ignore cleanup errors
      }
    }
  }

  function scheduleInvalidate(map, container) {
    if (!map) return;
    var doInvalidate = function () {
      try { map.invalidateSize(); } catch (e) { /* noop */ }
    };
    window.requestAnimationFrame(doInvalidate);
    pendingTimers.push(window.setTimeout(doInvalidate, 100));
    pendingTimers.push(window.setTimeout(doInvalidate, 300));
    if (container && typeof window.ResizeObserver === "function") {
      try {
        var ro = new window.ResizeObserver(doInvalidate);
        ro.observe(container);
        activeObservers.push(ro);
      } catch (e) {
        // ignore if ResizeObserver unsupported
      }
    }
  }

  function addBaseTiles(map) {
    window.L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19
    }).addTo(map);
  }

  function renderMapFallback(container) {
    var U = window.MatsuyamaApp.Utils;
    U.clearEl(container);
    container.appendChild(
      U.el("div", { className: "empty-state", style: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } }, [
        "地図ライブラリ（Leaflet）を読み込めませんでした。ネットワーク接続をご確認のうえ再読み込みしてください。"
      ])
    );
  }

  function createSpotDivIcon(spot, isStamped) {
    var U = window.MatsuyamaApp.Utils;
    var emoji = U.getSpotEmoji(spot);
    var color = (spot && spot.color) ? spot.color : "#FB8C00";
    var wrapper = U.el("div", {
      className: "pin-bubble",
      style: { "--pin-color": color }
    }, [
      U.el("span", { className: "pin-bubble-inner", text: emoji }),
      isStamped ? U.el("span", { className: "pin-stamped-dot", text: "✓" }) : null
    ]);

    return window.L.divIcon({
      className: "custom-pin",
      html: wrapper.outerHTML,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });
  }

  function createEventDivIcon() {
    var U = window.MatsuyamaApp.Utils;
    var wrapper = U.el("div", { className: "pin-bubble is-event" }, [
      U.el("span", { className: "pin-bubble-inner", text: "✨" })
    ]);
    return window.L.divIcon({
      className: "custom-pin",
      html: wrapper.outerHTML,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });
  }

  function createNumberedDivIcon(num) {
    var U = window.MatsuyamaApp.Utils;
    var wrapper = U.el("div", { className: "pin-bubble is-numbered" }, [
      U.el("span", { className: "pin-bubble-inner", text: String(num) })
    ]);
    return window.L.divIcon({
      className: "custom-pin",
      html: wrapper.outerHTML,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });
  }

  function createUserDivIcon() {
    return window.L.divIcon({
      className: "custom-pin",
      html: '<div class="user-loc-dot"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }

  function createSpotPopupNode(spot, isStamped) {
    var U = window.MatsuyamaApp.Utils;
    var cat = U.getCategoryMeta(spot.category);
    return U.el("div", { className: "popup-box" }, [
      U.el("div", { className: "flex-row", style: { marginBottom: "4px" } }, [
        U.el("span", { className: "badge badge-" + spot.category, text: cat.icon + " " + cat.label }),
        isStamped ? U.el("span", { className: "badge badge-stamped", text: "スタンプ済" }) : null
      ]),
      U.el("p", { className: "popup-title", text: spot.name }),
      spot.coordApprox ? U.el("p", { style: { margin: "0 0 4px", fontSize: "0.75rem", color: "#8F5B00" }, text: "※位置は概算です" }) : null,
      U.el("p", { className: "popup-summary", text: U.truncate(spot.summary, 64) }),
      U.el("a", { href: "#/spot/" + encodeURIComponent(spot.id), className: "popup-link", text: "詳細を見る →" })
    ]);
  }

  function createEventPopupNode(ev) {
    var U = window.MatsuyamaApp.Utils;
    var status = U.getEventStatus(ev);
    var actions = [];
    if (ev.spotId) {
      actions.push(U.el("a", {
        href: "#/spot/" + encodeURIComponent(ev.spotId),
        className: "popup-link",
        text: "関連スポットを見る →"
      }));
    } else {
      actions.push(U.el("a", {
        href: "#/events",
        className: "popup-link",
        text: "イベント一覧を見る →"
      }));
    }

    return U.el("div", { className: "popup-box" }, [
      U.el("div", { className: "flex-row", style: { marginBottom: "4px" } }, [
        U.el("span", { className: "badge badge-events", text: "✨ イベント" }),
        U.el("span", { className: "badge " + status.className, text: status.label })
      ]),
      U.el("p", { className: "popup-title", text: ev.name }),
      U.el("p", { style: { margin: "0 0 4px", fontSize: "0.76rem", color: "#5C554E" }, text: U.formatEventPeriod(ev) }),
      U.el("p", { className: "popup-summary", text: U.truncate(ev.summary, 66) }),
      U.el("div", {}, actions)
    ]);
  }

  function mountSpotMiniMap(container, spot, isStamped) {
    if (!container || !spot) return null;
    if (!hasLeaflet()) {
      renderMapFallback(container);
      return null;
    }
    var map = window.L.map(container, {
      center: [spot.lat, spot.lng],
      zoom: 16,
      scrollWheelZoom: false
    });
    addBaseTiles(map);
    var marker = window.L.marker([spot.lat, spot.lng], {
      icon: createSpotDivIcon(spot, isStamped)
    }).addTo(map);
    marker.bindPopup(createSpotPopupNode(spot, isStamped));
    activeMaps.push(map);
    scheduleInvalidate(map);
    return map;
  }

  function mountCourseMap(container, course, spots) {
    if (!container || !course) return null;
    if (!hasLeaflet()) {
      renderMapFallback(container);
      return null;
    }
    var map = window.L.map(container, {
      center: MATSUYAMA_CENTER,
      zoom: 13,
      scrollWheelZoom: false
    });
    addBaseTiles(map);

    var latlngs = [];
    spots.forEach(function (spot, idx) {
      if (!spot) return;
      var ll = [spot.lat, spot.lng];
      latlngs.push(ll);
      var marker = window.L.marker(ll, {
        icon: createNumberedDivIcon(idx + 1)
      }).addTo(map);
      var U = window.MatsuyamaApp.Utils;
      var pop = U.el("div", { className: "popup-box" }, [
        U.el("p", { className: "popup-title", text: (idx + 1) + ". " + spot.name }),
        U.el("p", { className: "popup-summary", text: U.truncate(spot.summary, 58) }),
        U.el("a", { href: "#/spot/" + encodeURIComponent(spot.id), className: "popup-link", text: "詳細を見る →" })
      ]);
      marker.bindPopup(pop);
    });

    if (latlngs.length >= 2) {
      window.L.polyline(latlngs, {
        color: "#E8590C",
        weight: 4,
        opacity: 0.85,
        dashArray: "8, 6"
      }).addTo(map);
    }

    if (latlngs.length > 0) {
      map.fitBounds(window.L.latLngBounds(latlngs), { padding: [32, 32], maxZoom: 15 });
    }

    activeMaps.push(map);
    scheduleInvalidate(map);
    return map;
  }

  function mountFullMap(container, options) {
    var U = window.MatsuyamaApp.Utils;
    var Stamp = window.MatsuyamaApp.Stamp;
    if (!container) return null;
    if (!hasLeaflet()) {
      renderMapFallback(container);
      return null;
    }

    var data = U.getData();
    var map = window.L.map(container, {
      center: MATSUYAMA_CENTER,
      zoom: 13
    });
    addBaseTiles(map);
    activeMaps.push(map);

    var spotMarkers = [];
    var eventMarkers = [];
    var spotMarkerById = {};
    var userLayerGroup = window.L.layerGroup().addTo(map);

    (data.spots || []).forEach(function (spot) {
      var stamped = Stamp.isStamped(spot.id);
      var marker = window.L.marker([spot.lat, spot.lng], {
        icon: createSpotDivIcon(spot, stamped)
      });
      marker.bindPopup(createSpotPopupNode(spot, stamped));
      spotMarkers.push({ spot: spot, marker: marker });
      spotMarkerById[spot.id] = marker;
    });

    // イベントピン（spotId経由はスポットピンと重なりすぎないよう微小オフセット）
    var spotOffsetCount = {};
    (data.events || []).forEach(function (ev) {
      var coords = U.getEventCoords(ev);
      if (!coords) return;
      var lat = coords.lat;
      var lng = coords.lng;
      if (coords.fromSpot && ev.spotId) {
        var c = (spotOffsetCount[ev.spotId] || 0) + 1;
        spotOffsetCount[ev.spotId] = c;
        lat += 0.00032 * c;
        lng += 0.00036 * c;
      }
      var marker = window.L.marker([lat, lng], {
        icon: createEventDivIcon()
      });
      marker.bindPopup(createEventPopupNode(ev));
      eventMarkers.push({ ev: ev, marker: marker, latlng: [lat, lng] });
    });

    function applyFilter(cat, shouldFit) {
      var spotBoundsPoints = [];
      var eventBoundsPoints = [];
      spotMarkers.forEach(function (item) {
        var visible = (cat === "all" || item.spot.category === cat);
        if (visible) {
          if (!map.hasLayer(item.marker)) item.marker.addTo(map);
          spotBoundsPoints.push([item.spot.lat, item.spot.lng]);
        } else {
          if (map.hasLayer(item.marker)) map.removeLayer(item.marker);
        }
      });

      eventMarkers.forEach(function (item) {
        var visible = (cat === "all" || cat === "events");
        if (visible) {
          if (!map.hasLayer(item.marker)) item.marker.addTo(map);
          eventBoundsPoints.push(item.latlng);
        } else {
          if (map.hasLayer(item.marker)) map.removeLayer(item.marker);
        }
      });

      // 初期表示・すべて表示時はスポット15件のみで fitBounds し、遠方のイベントピンは表示のみ行う
      var fitPoints = spotBoundsPoints.length > 0 ? spotBoundsPoints : eventBoundsPoints;
      if (shouldFit && fitPoints.length > 0) {
        map.fitBounds(window.L.latLngBounds(fitPoints), {
          padding: [36, 36],
          maxZoom: 15
        });
      }
    }

    var focusSpotId = options && options.focusSpotId ? options.focusSpotId : null;
    applyFilter("all", !focusSpotId);

    if (focusSpotId && spotMarkerById[focusSpotId]) {
      var targetSpot = U.getSpotById(focusSpotId);
      if (targetSpot) {
        map.setView([targetSpot.lat, targetSpot.lng], 16);
        window.setTimeout(function () {
          try {
            spotMarkerById[focusSpotId].openPopup();
          } catch (e) { /* noop */ }
        }, 250);
      }
    }

    function locateUser(onStatus) {
      if (!navigator.geolocation) {
        onStatus("このブラウザは位置情報（Geolocation）に対応していません。");
        return;
      }
      onStatus("現在地を取得しています…");
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          var acc = pos.coords.accuracy || 50;
          userLayerGroup.clearLayers();
          window.L.circle([lat, lng], {
            radius: Math.min(acc, 500),
            color: "#1971C2",
            fillColor: "#1971C2",
            fillOpacity: 0.14,
            weight: 1.5
          }).addTo(userLayerGroup);
          window.L.marker([lat, lng], { icon: createUserDivIcon() })
            .bindPopup("現在地（精度 約" + Math.round(acc) + "m）")
            .addTo(userLayerGroup)
            .openPopup();
          map.setView([lat, lng], 15);
          onStatus("現在地を表示しました（精度 約" + Math.round(acc) + "m）。");
        },
        function (err) {
          var msg = "現在地を取得できませんでした。";
          if (err && err.code === 1) {
            msg = "位置情報の利用が許可されていません。ブラウザの設定で位置情報を許可してください。";
            if (window.isSecureContext === false) {
              msg += "（位置情報は HTTPS または localhost でのみ動作します）";
            }
          } else if (err && err.code === 2) {
            msg = "位置情報を取得できませんでした。電波状況の良い場所で再度お試しください。";
          } else if (err && err.code === 3) {
            msg = "位置情報の取得がタイムアウトしました。もう一度お試しください。";
          }
          onStatus(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    }

    resizeHandler = function () {
      scheduleInvalidate(map);
    };
    window.addEventListener("resize", resizeHandler);
    scheduleInvalidate(map, container);

    return {
      map: map,
      setFilter: function (cat) {
        applyFilter(cat, true);
      },
      locateUser: locateUser,
      invalidate: function () {
        scheduleInvalidate(map);
      }
    };
  }

  window.MatsuyamaApp.Map = {
    destroyAllMaps: destroyAllMaps,
    mountSpotMiniMap: mountSpotMiniMap,
    mountCourseMap: mountCourseMap,
    mountFullMap: mountFullMap
  };
})();
