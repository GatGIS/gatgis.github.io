(function () {
  // Default coordinate (lon, lat) used if geolocation isn't available
  // Updated start location to user's location: lat 56.9361061, lon 24.0625166
  const DEFAULT_COORD = { lon: 24.0998371, lat: 56.9462801 };

  function initMap(centerLonLat) {
    // Ensure OpenLayers (ol) is available
    if (typeof ol === 'undefined') {
      console.error('OpenLayers (ol) is not loaded. Add <script src="https://cdn.jsdelivr.net/npm/ol/dist/ol.js"></script> to index.html');
      return;
    }

    // Transform from lon/lat to Web Mercator
    const center = ol.proj.fromLonLat([centerLonLat.lon, centerLonLat.lat]);

    // currentCoord must exist before any functions use it (fix ReferenceError)
    let currentCoord = { lon: centerLonLat.lon, lat: centerLonLat.lat };
    let posMethod = 'GPS'; // default

    // create base and overlay layers (with titles for LayerSwitcher)
    const osmLayer = new ol.layer.Tile({
      title: 'OSM',
      source: new ol.source.OSM(),
      visible: true
    });
    const orthoLayer = new ol.layer.Tile({
      title: 'Ortofoto 7',
      source: new ol.source.TileWMS({
        url: 'https://lvmgeoserver.lvm.lv/geoserver/ows',
        params: {'LAYERS': 'public:Orto_7cikls', 'TILED': true},
        serverType: 'geoserver'
      }),
      visible: false
    });
    const cadastralLayer = new ol.layer.Tile({
      title: 'Kadastrs',
      source: new ol.source.TileWMS({
        url: 'https://lvmgeoserver.lvm.lv/geoserver/ows',
        params: {'LAYERS': 'publicwfs:kkparcel', 'TILED': true},
        serverType: 'geoserver'
      }),
      visible: false
    });
    const quaternaryLayer = new ol.layer.Tile({
      title: 'Kvartāra nog.',
      source: new ol.source.TileWMS({
        url: 'https://lvmgeoserver.lvm.lv/geoserver/ows',
        params: {'LAYERS': 'public:quaternary', 'TILED': true},
        serverType: 'geoserver'
      }),
      visible: false
    });
    const soilLayer = new ol.layer.Tile({
      title: 'Augsne',
      source: new ol.source.TileWMS({
        url: 'https://lvmgeoserver.lvm.lv/geoserver/ows',
        params: {'LAYERS': 'publicwfs:soils', 'TILED': true},
        serverType: 'geoserver'
      }),
      visible: false
    });      
    const t10Layer = new ol.layer.Tile({
      title: 'Topo10',
      source: new ol.source.TileWMS({
        url: 'https://lvmgeoserver.lvm.lv/geoserver/ows',
        params: {'LAYERS': 'public:Topo10DTM_contours', 'TILED': true},
        serverType: 'geoserver'
      }),
      visible: false
    });
    const map = new ol.Map({
      target: 'map',
      layers: [osmLayer, t10Layer, orthoLayer, quaternaryLayer, soilLayer, cadastralLayer],
      view: new ol.View({
        center: center,
        zoom: 13
      })
    });

    // Add a marker at the center
    const marker = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([currentCoord.lon, currentCoord.lat]))
    });

    const vectorSource = new ol.source.Vector({
      features: [marker]
    });

    const markerStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 8,
        fill: new ol.style.Fill({ color: '#007AFF' }),
        stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
      })
    });

    const markerLayer = new ol.layer.Vector({
      source: vectorSource,
      style: markerStyle
    });

    map.addLayer(markerLayer);

    // accuracy/precision variables (hoisted so handlers can access them)
    let accuracySource = null;
    let accuracyLayer = null;
    let precisionEl = null;
    let precisionOverlay = null;
    let precisionTimer = null;
    let gpsAccuracyLabel = null;
    let mosysSpinner = null;

    // --- NEW: controls, request + parsing logic ----------------
    let waitInterval = null;

    // Panel container (exists in index.html)
    let panel = document.getElementById('panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'panel';
      document.body.appendChild(panel);
    }

    // Populate panel content — buttons moved into header (top-actions)
    panel.innerHTML = `
      <div class="mosys-panel">
        <div class="mosys-header">
          <strong>MOSYS Drill</strong>
          <div class="top-actions">
            <button id="mosys-drill" class="mosys-btn primary">Drill</button>
            <button id="mosys-refresh" class="mosys-btn secondary">Refresh GPS</button>
            <!-- Close as compact X icon -->
            <button id="mosys-close" class="mosys-close hidden" aria-label="Close results" title="Close results">✕</button>
          </div>
        </div>
  
        <div class="controls">
          <input id="mosys-lat" type="text" placeholder="Latitude (x)" />
          <input id="mosys-lon" type="text" placeholder="Longitude (y)" />
        </div>
  
        <div id="mosys-webAnswer" class="mosys-result"></div>
        <div id="mosys-tableContainer"></div>
      </div>
    `;

    const latInput = panel.querySelector('#mosys-lat');
    const lonInput = panel.querySelector('#mosys-lon');
    let drillBtn = panel.querySelector('#mosys-drill');
    let refreshBtn = panel.querySelector('#mosys-refresh');
    const webAnswer = panel.querySelector('#mosys-webAnswer');
    const tableContainer = panel.querySelector('#mosys-tableContainer');
    const closeBtn = panel.querySelector('#mosys-close');
    const appEl = document.getElementById('app');

    // Replace custom layer button/menu wiring with the ol-layerswitcher control
    // This mirrors your map project usage and places a proper LayerSwitcher on the map.
    try {
        var layerSwitcher = new LayerSwitcher({
            reverse: true,
            groupSelectStyle: 'group'
        });
        map.addControl(layerSwitcher);
    } catch (e) {
        // If the LayerSwitcher lib isn't available, fail gracefully
        console.warn('LayerSwitcher control not added:', e);
    }
    // GPS control + accuracy circle + label: add a small map-top-right button that centers on user's location
    try {
      // vector layer to show accuracy circle (meters in EPSG:3857)
      accuracySource = new ol.source.Vector();
      accuracyLayer = new ol.layer.Vector({
        source: accuracySource,
        style: new ol.style.Style({
          fill: new ol.style.Fill({ color: 'rgba(0,122,255,0.08)' }),
          stroke: new ol.style.Stroke({ color: 'rgba(0,122,255,0.35)', width: 2 })
        })
      });
      map.addLayer(accuracyLayer);

      // precision overlay near the marker (hidden by default)
      precisionEl = document.createElement('div');
      precisionEl.className = 'gps-precision';
      precisionEl.style.display = 'none';
      precisionOverlay = new ol.Overlay({ element: precisionEl, positioning: 'bottom-center', offset: [0, -12] });
      map.addOverlay(precisionOverlay);
      precisionTimer = null;

      function doGpsRefresh() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((p) => {
            const lon = p.coords.longitude, lat = p.coords.latitude;
            setMarkerPosition({ lon, lat }, { setPosMethod: 'GPS' });
            // Draw accuracy circle (coords.accuracy in meters)
            try {
              accuracySource.clear();
              const center = ol.proj.fromLonLat([lon, lat]);
              const radius = Number(p.coords.accuracy) || 0;
              const circ = new ol.Feature(new ol.geom.Circle(center, radius));
              accuracySource.addFeature(circ);
              // show temporary precision overlay near the marker
              precisionEl.textContent = '± ' + Math.round(p.coords.accuracy) + ' m';
              precisionEl.style.display = 'block';
              precisionOverlay.setPosition(center);
              if (precisionTimer) clearTimeout(precisionTimer);
              precisionTimer = setTimeout(() => {
                try { precisionEl.style.display = 'none'; precisionOverlay.setPosition(undefined); } catch (e) {}
              }, 3000);
            } catch (e) { /* ignore drawing errors */ }
            // update GPS button label if present
            try {
              if (gpsAccuracyLabel) {
                gpsAccuracyLabel.textContent = '± ' + Math.round(p.coords.accuracy) + ' m';
                gpsAccuracyLabel.style.display = 'block';
              }
            } catch (e) {}
            try { panel.scrollIntoView({ block: 'end', behavior: 'smooth' }); } catch (e) {}
            try { if (gpsSpinner) gpsSpinner.style.display = 'none'; } catch (e) {}
          }, (err) => {
            // GPS failed: inform user instead of setting a possibly misleading marker
            try { if (gpsAccuracyLabel) { gpsAccuracyLabel.textContent = 'Enable GPS'; gpsAccuracyLabel.style.display = 'block'; } } catch (e) {}
            try { if (gpsSpinner) gpsSpinner.style.display = 'none'; } catch (e) {}
            try { if (precisionEl) { precisionEl.style.display = 'none'; precisionOverlay.setPosition(undefined); } } catch (e) {}
            // hide message after a moment
            try { setTimeout(() => { if (gpsAccuracyLabel) gpsAccuracyLabel.style.display = 'none'; }, 4000); } catch (e) {}
          }, { enableHighAccuracy: true, timeout: 5000 });
        } else {
          // no geolocation API available
          try { if (gpsAccuracyLabel) { gpsAccuracyLabel.textContent = 'Enable GPS'; gpsAccuracyLabel.style.display = 'block'; } } catch (e) {}
          try { if (gpsSpinner) gpsSpinner.style.display = 'none'; } catch (e) {}
          try { setTimeout(() => { if (gpsAccuracyLabel) gpsAccuracyLabel.style.display = 'none'; }, 4000); } catch (e) {}
        }
      }

      // expose doGpsRefresh and a small marker setter to the global scope so page-load geolocation can trigger it
      try { window.mosysDoGpsRefresh = doGpsRefresh; } catch (e) {}
      try { window.mosysSetMarker = function(lon, lat) { try { setMarkerPosition({ lon: lon, lat: lat }, { setPosMethod: 'GPS' }); } catch (e) {} }; } catch (e) {}
      try {
        window.mosysApplyPosition = function(p) {
          try {
            const lon = p.coords.longitude, lat = p.coords.latitude;
            // move marker and center
            try { setMarkerPosition({ lon, lat }, { setPosMethod: 'GPS' }); } catch (e) {}
            // draw accuracy circle
            try {
              if (accuracySource) {
                accuracySource.clear();
                const center = ol.proj.fromLonLat([lon, lat]);
                const radius = Number(p.coords.accuracy) || 0;
                const circ = new ol.Feature(new ol.geom.Circle(center, radius));
                accuracySource.addFeature(circ);
              }
            } catch (e) {}
            // update GPS label
            try { if (gpsAccuracyLabel) { gpsAccuracyLabel.textContent = '± ' + Math.round(p.coords.accuracy) + ' m'; gpsAccuracyLabel.style.display = 'block'; } } catch (e) {}
            // show temporary precision overlay
            try {
              if (precisionEl && precisionOverlay) {
                precisionEl.textContent = '± ' + Math.round(p.coords.accuracy) + ' m';
                precisionEl.style.display = 'block';
                const center = ol.proj.fromLonLat([lon, lat]);
                precisionOverlay.setPosition(center);
                if (precisionTimer) clearTimeout(precisionTimer);
                precisionTimer = setTimeout(() => { try { precisionEl.style.display = 'none'; precisionOverlay.setPosition(undefined); } catch (e) {} }, 3000);
              }
            } catch (e) {}
          } catch (e) {}
        };
      } catch (e) {}

      const gpsEl = document.createElement('div');
      gpsEl.className = 'ol-control ol-unselectable ol-gps';
      const gpsBtn = document.createElement('button');
      gpsBtn.type = 'button';
      gpsBtn.title = 'Center on my location';
      // Google-like location SVG (simple target icon)
      gpsBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">'
        + '<circle cx="12" cy="12" r="7" fill="none" stroke="#007AFF" stroke-width="1.6"/>'
        + '<circle cx="12" cy="12" r="2.6" fill="#007AFF"/>'
        + '</svg>';
      gpsBtn.addEventListener('click', function (evt) { evt.stopPropagation(); try { if (gpsSpinner) gpsSpinner.style.display = 'inline-block'; } catch(e){}; doGpsRefresh(); try { gpsBtn.blur(); } catch(e){} });
      gpsBtn.addEventListener('mouseup', function () { try { gpsBtn.blur(); } catch(e){} });
      // also blur on touchend to avoid persisted focus/selection on mobile
      gpsBtn.addEventListener('touchend', function () { try { gpsBtn.blur(); } catch(e){} });
      gpsEl.appendChild(gpsBtn);
      // small spinner inside gps control
      const gpsSpinner = document.createElement('div');
      gpsSpinner.className = 'gps-spinner';
      gpsSpinner.style.display = 'none';
      gpsEl.appendChild(gpsSpinner);
      // accuracy label
      const gpsAccuracyLabel = document.createElement('div');
      gpsAccuracyLabel.className = 'ol-gps-accuracy';
      gpsAccuracyLabel.style.display = 'none';
      gpsEl.appendChild(gpsAccuracyLabel);
      map.addControl(new ol.control.Control({ element: gpsEl }));

      // panel-level spinner for MOSYS requests (created later inside Drill button)

      // initial accuracy read: populate GPS label and circle on page load (no centering)
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((p) => {
            try {
              if (gpsAccuracyLabel) {
                gpsAccuracyLabel.textContent = '± ' + Math.round(p.coords.accuracy) + ' m';
                gpsAccuracyLabel.style.display = 'block';
              }
              // draw circle at actual device location to give immediate visual cue
              accuracySource.clear();
              const center = ol.proj.fromLonLat([p.coords.longitude, p.coords.latitude]);
              const radius = Number(p.coords.accuracy) || 0;
              const circ = new ol.Feature(new ol.geom.Circle(center, radius));
              accuracySource.addFeature(circ);
            } catch (e) { /* ignore */ }
          }, (err) => {
            try { if (gpsAccuracyLabel) gpsAccuracyLabel.style.display = 'none'; } catch (e) {}
          }, { enableHighAccuracy: true, timeout: 5000 });
        }
      } catch (e) {}
    } catch (e) {
      // don't break map if custom control fails
      console.warn('GPS control not added:', e);
    }

    // helper: update input fields from coord
    function setInputsFromCoord(coord) {
      try {
        if (latInput) latInput.value = Number(coord.lat).toFixed(6);
        if (lonInput) lonInput.value = Number(coord.lon).toFixed(6);
      } catch (e) {}
    }

    // helper: move marker, center map and update inputs
    function setMarkerPosition(coord, options = {}) {
      currentCoord = { lon: Number(coord.lon), lat: Number(coord.lat) };
      try {
        const p = ol.proj.fromLonLat([currentCoord.lon, currentCoord.lat]);
        marker.setGeometry(new ol.geom.Point(p));
        // animate view to new center (small animation)
        try { map.getView().animate({ center: p, duration: 250 }); } catch (e) {}
        setInputsFromCoord(currentCoord);
      } catch (e) {
        // ignore projection errors
      }
      if (options.setPosMethod) posMethod = options.setPosMethod;
    }

    // Ensure buttons exist (safety)
    if (!drillBtn) {
      drillBtn = document.createElement('button');
      drillBtn.id = 'mosys-drill';
      drillBtn.className = 'mosys-btn primary';
      drillBtn.innerHTML = '<span class="drill-label">Drill</span>';
      panel.querySelector('.top-actions').appendChild(drillBtn);
    }
    if (!refreshBtn) {
      refreshBtn = document.createElement('button');
      refreshBtn.id = 'mosys-refresh';
      refreshBtn.className = 'mosys-btn secondary';
      refreshBtn.textContent = 'Refresh';
      panel.querySelector('.top-actions').appendChild(refreshBtn);
    }

    // create MOSYS spinner to the left of the Drill button (inline)
    try {
      if (!mosysSpinner && drillBtn) {
        const topActions = panel.querySelector('.top-actions') || panel;
        mosysSpinner = document.createElement('div');
        mosysSpinner.className = 'mosys-spinner mosys-spinner-left';
        mosysSpinner.style.display = 'none';
        // insert spinner before the drill button so it appears to the left
        try { topActions.insertBefore(mosysSpinner, drillBtn); } catch (e) { try { drillBtn.parentNode.insertBefore(mosysSpinner, drillBtn); } catch (err) { /* ignore */ } }
      }
    } catch (e) { /* ignore */ }

    // initialize marker and inputs from currentCoord
    setInputsFromCoord(currentCoord);
    try {
      marker.setGeometry(new ol.geom.Point(ol.proj.fromLonLat([currentCoord.lon, currentCoord.lat])));
      // ensure map view centers properly initially
      map.getView().setCenter(ol.proj.fromLonLat([currentCoord.lon, currentCoord.lat]));
    } catch (e) {}

    // allow tapping/clicking the map to set position
    try {
      map.on('singleclick', function(evt) {
        try {
          const ll = ol.proj.toLonLat(evt.coordinate);
          setMarkerPosition({ lon: ll[0], lat: ll[1] }, { setPosMethod: 'MAP' });
          webAnswer.textContent = 'Position set from map (posmethod=MAP)';
          // remove previous accuracy visuals when user manually sets position
          try { if (accuracySource) accuracySource.clear(); } catch (e) {}
          try { if (precisionEl) { precisionEl.style.display = 'none'; precisionOverlay.setPosition(undefined); } } catch (e) {}
          try { if (gpsAccuracyLabel) gpsAccuracyLabel.style.display = 'none'; } catch (e) {}
          ensurePanelFits();
        } catch (e) {}
      });
    } catch (e) {
      // if map.on is not available, ignore
    }

    // Dynamic panel fit: compute required panel height so header + top-actions + controls fit
    // This function calculates the minimum height needed for the panel to display its essential content
    // (header, controls, and initial webAnswer message) without scrolling, and then sets --panel-height.
    function ensurePanelFits() {
      const docH = window.innerHeight || document.documentElement.clientHeight;
      // if results are open, respect results-open (70vh); still ensure it's not smaller than required
      const resultsOpen = appEl && appEl.classList.contains('results-open');

      const panelAreaEl = document.getElementById('panel'); // The .panel-area div
      const mosysPanelEl = panelAreaEl.querySelector('.mosys-panel');

      // The most reliable way to get the required height is to measure the scrollHeight
      // of the inner container, which includes all its children and their gaps.
      let neededPx = mosysPanelEl.scrollHeight;

      // We must also add the vertical padding of the outer .panel-area container itself,
      // as scrollHeight does not account for the padding of its parent.
      const panelAreaStyles = getComputedStyle(panelAreaEl);
      const panelPaddingTop = parseFloat(panelAreaStyles.paddingTop) || 0;
      const panelPaddingBottom = parseFloat(panelAreaStyles.paddingBottom) || 0;
      neededPx += panelPaddingTop + panelPaddingBottom;

      // Add a small buffer (e.g., 2px) to prevent floating point rounding issues
      // that can sometimes still cause a scrollbar to appear.
      neededPx += 2;

      // convert to vh and clamp
      let neededVh = (neededPx / docH) * 100;
      if (neededVh < 20) neededVh = 20; // Ensure panel is not too tiny, min 20vh
      if (neededVh > 80) neededVh = 80; // Cap panel height at 80vh to always leave some map visible
      if (resultsOpen) {
        // prefer results-open value (70vh), but ensure it's at least neededVh
        neededVh = Math.max(neededVh, 70);
      } else {
        // default target (use variable but ensure it meets neededVh)
        // No longer force a minimum of 35vh. Use the calculated height.
      }
      // set CSS var on root
      document.documentElement.style.setProperty('--panel-height', neededVh + 'vh');
      // update map height immediately
      const mapEl = document.getElementById('map');
      if (mapEl) map.updateSize && setTimeout(() => { try { map.updateSize(); } catch (e) {} }, 200);
    }

    // call ensurePanelFits now and on resize/orientation change
    // Use a setTimeout to ensure the browser has finished rendering before we measure.
    // This prevents a race condition where we calculate the height too early.
    setTimeout(ensurePanelFits, 0);

    window.addEventListener('resize', ensurePanelFits);
    window.addEventListener('orientationchange', ensurePanelFits);

    // run ensurePanelFits when showing results or collapsing
    function expandResults() {
      if (appEl) appEl.classList.add('results-open');
      if (closeBtn) try { closeBtn.classList.remove('hidden'); } catch(e) { closeBtn.style.display = 'inline-flex'; }
      ensurePanelFits();
    }
    function collapseResults() {
      if (appEl) appEl.classList.remove('results-open');
      if (closeBtn) try { closeBtn.classList.add('hidden'); } catch(e) { closeBtn.style.display = 'none'; }
      tableContainer.innerHTML = '';
      webAnswer.textContent = '';
      ensurePanelFits();
    }
    if (closeBtn) closeBtn.addEventListener('click', collapseResults);

    // GPS refresh: center marker on current view center or use browser geolocation
    refreshBtn.addEventListener('click', function() {
      // Prefer the shared GPS routine if available (shows accuracy and label)
      try {
        if (typeof doGpsRefresh === 'function') {
          doGpsRefresh();
          return;
        }
      } catch (e) {}

      // Fallback: previous behavior
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((p) => {
          setMarkerPosition({ lon: p.coords.longitude, lat: p.coords.latitude }, { setPosMethod: 'GPS' });
          // ensure panel still visible
          try { panel.scrollIntoView({ block: 'end', behavior: 'smooth' }); } catch (e) {}
        }, (err) => {
          // GPS not available / permission denied — inform user instead of moving marker
          try { if (gpsAccuracyLabel) { gpsAccuracyLabel.textContent = 'Enable GPS'; gpsAccuracyLabel.style.display = 'block'; } } catch (e) {}
          try { if (gpsSpinner) gpsSpinner.style.display = 'none'; } catch (e) {}
          try { setTimeout(() => { if (gpsAccuracyLabel) gpsAccuracyLabel.style.display = 'none'; }, 4000); } catch (e) {}
        }, { enableHighAccuracy: true, timeout: 5000 });
      } else {
        try { if (gpsAccuracyLabel) { gpsAccuracyLabel.textContent = 'Enable GPS'; gpsAccuracyLabel.style.display = 'block'; } } catch (e) {}
        try { setTimeout(() => { if (gpsAccuracyLabel) gpsAccuracyLabel.style.display = 'none'; }, 4000); } catch (e) {}
      }
    });

    // Proxy fallback: AllOrigins -> ThingProxy
    async function fetchWithFallback(remoteUrl) {
      const proxies = [
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?'
      ];

      // try each proxy in order
      for (const p of proxies) {
        const url = p + encodeURIComponent(remoteUrl);
        try {
          const r = await fetch(url);
          if (r.ok) {
            const text = await r.text();
            if (text && text.trim().length > 0) return text;
          }
        } catch (e) {
          // ignore and try next proxy
        }
      }

      // final attempt: direct fetch (may fail due to CORS)
      try {
        const direct = await fetch(remoteUrl);
        if (direct.ok) {
          const t = await direct.text();
          if (t && t.trim().length > 0) return t;
        }
      } catch (e) {
        // ignore
      }

      throw new Error('All proxy attempts failed');
    }

    async function sendRequest(latStr, lonStr) {
      // x = latitude, y = longitude (followed Android mapping)
      const ndata = 'v1.2';
      const build = '13';
      const remoteUrl = `http://www.modlab.lv/kalme/realdata/MOSYSmobile.php?x=${encodeURIComponent(latStr)}&y=${encodeURIComponent(lonStr)}&ndata=${encodeURIComponent(ndata)}&posmethod=${encodeURIComponent(posMethod)}&build=${encodeURIComponent(build)}`;
      if (webAnswer) webAnswer.textContent = 'Calculate on server ...';
      try { if (mosysSpinner) mosysSpinner.style.display = 'inline-block'; } catch (e) {}
      if (tableContainer) tableContainer.innerHTML = '';
      let dots = 0;
      if (waitInterval) { clearInterval(waitInterval); waitInterval = null; }
      waitInterval = setInterval(() => {
        dots = (dots + 1) % 5;
        if (webAnswer) webAnswer.textContent = 'Calculate on server ' + '.'.repeat(dots);
      }, 600);
      try {
        const text = await fetchWithFallback(remoteUrl);
        clearInterval(waitInterval); waitInterval = null;
        try { if (mosysSpinner) mosysSpinner.style.display = 'none'; } catch (e) {}
        parseResponse(text);
        // show expanded results area after parsing
        expandResults();
      } catch (e) {
        clearInterval(waitInterval); waitInterval = null;
        try { if (mosysSpinner) mosysSpinner.style.display = 'none'; } catch (err) {}
        if (webAnswer) webAnswer.textContent = 'Request failed: ' + (e.message || e);
      }
    }

    // expose a stable reference so UI handlers outside the closure can call it reliably
    try { window.mosysSendRequest = sendRequest; } catch (e) { /* ignore if not allowed */ }

    // parse server response similar to Android onPostExecute
    function parseResponse(result) {
      // show raw-ish converted text like Android for quick view
      if (webAnswer) webAnswer.textContent = result.replace(/\|/, '\nLayer : z [m]\n----------------\n').replace(/;/g, '\n').replace(/,/g, ' : ');
      const tokens = result.split(/\|+/);
      if (tokens.length === 2) {
        const header = tokens[0];
        const lines = tokens[1];
        if (header.startsWith('x:')) {
          // parse header e.g. "x:latVal;y:lonVal"
          const headerxy = header.split(';');
          const xs = headerxy[0].split(':');
          const ys = headerxy[1].split(':');
          const head = `(ESPG:25884) ${xs[0]} = ${Number(xs[1]).toFixed(0)} , ${ys[0]} = ${Number(ys[1]).toFixed(0)}`;
          if (webAnswer) webAnswer.textContent = head;

          // build table
          const table = document.createElement('table');
          table.className = 'mosys-table';
          const thead = document.createElement('thead');
          const htr = document.createElement('tr');
          ['Layer','z [m]','Δz [m]','Cond'].forEach(h => {
            const th = document.createElement('td'); th.style.fontWeight = '700'; th.textContent = h; htr.appendChild(th);
          });
          thead.appendChild(htr);
          table.appendChild(thead);

          const lineItemsArr = lines.split(';');
          let topZ = null;
          for (let i = 0; i < lineItemsArr.length; i++) {
            const lineItems = lineItemsArr[i].split(',');
            if (lineItems.length !== 5) {
              // short item -> stop parsing
              break;
            }
            if (i === 0) topZ = Number(lineItems[1]);

            // create row
            const tr = document.createElement('tr');
            // Android createView used CondXYStr = lineItems[2], color = rgb(0,0, min(255,150*Cond))
            const cond = Number(lineItems[2]) || 0;
            let colo = Math.round(150 * cond);
            if (colo > 255) colo = 255;
            const colorStr = `rgb(0,0,${colo})`;
            // Column 1: layer name
            const td1 = document.createElement('td'); td1.textContent = lineItems[0]; td1.style.color = colorStr; td1.style.background = '#f6f6f6';
            // Column 2: z value (one decimal)
            const td2 = document.createElement('td'); td2.textContent = Number(lineItems[1]).toFixed(1); td2.style.color = colorStr; td2.style.background = '#f6f6f6';
            // Column 3: delta z (topZ - z)
            const td3 = document.createElement('td'); td3.textContent = (topZ !== null ? (topZ - Number(lineItems[1])).toFixed(1) : Number(lineItems[1]).toFixed(1)); td3.style.color = colorStr; td3.style.background = '#f6f6f6';
            // Column 4: conductivity (fifth item)
            const td4 = document.createElement('td'); td4.textContent = Number(lineItems[4]).toFixed(1); td4.style.color = colorStr; td4.style.background = '#f6f6f6';

            tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tr.appendChild(td4);
            table.appendChild(tr);
          }

          if (tableContainer) {
            tableContainer.innerHTML = '';
            tableContainer.appendChild(table);
          }
          return;
        } else {
          if (webAnswer) webAnswer.textContent = 'ERROR: ' + header;
          return;
        }
      }
      if (webAnswer) webAnswer.textContent = 'Unexpected response format';
    }

    // Drill button click -> validate inputs and call sendRequest
    // attach direct listener (ensures it fires now that sendRequest is defined)
    if (drillBtn) {
      drillBtn.addEventListener('click', function() {
        const latStr = (latInput && latInput.value) ? latInput.value.trim().replace(',', '.') : '';
        const lonStr = (lonInput && lonInput.value) ? lonInput.value.trim().replace(',', '.') : '';
        if (!latStr || !lonStr) {
          if (webAnswer) webAnswer.textContent = 'Enter coordinates first';
          try { panel.scrollIntoView({ block: 'end', behavior: 'smooth' }); } catch (e) {}
          return;
        }
        if (isNaN(Number(latStr)) || isNaN(Number(lonStr))) {
          if (webAnswer) webAnswer.textContent = 'Invalid coordinates';
          try { panel.scrollIntoView({ block: 'end', behavior: 'smooth' }); } catch (e) {}
          return;
        }
        const caller = (typeof window.mosysSendRequest === 'function') ? window.mosysSendRequest : sendRequest;
        try {
          const p = caller(latStr, lonStr);
          if (p && typeof p.then === 'function') p.catch(err => console.error('sendRequest failed:', err));
        } catch (err) {
          console.error('Error calling sendRequest:', err);
        }
      });
    }

    // refreshBtn handler (unchanged)
    // ...existing code...

  } // end initMap

  // Public API (for external calls)
  try { window.mosysMapInit = initMap; } catch (e) {}

  // On load: initialize the map immediately with DEFAULT_COORD to avoid render delays,
  // then try to get the user's location asynchronously and update the marker when available.
  document.addEventListener('DOMContentLoaded', function() {
    try { initMap(DEFAULT_COORD); } catch (e) { console.error('initMap failed:', e); }

    // Try to update position in background without blocking initial render
    if (navigator.geolocation) {
      const geoOpts = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };
      navigator.geolocation.getCurrentPosition((pos) => {
        try {
          // Use the obtained Position directly to update marker and accuracy visuals
          try { if (typeof window.mosysApplyPosition === 'function') { window.mosysApplyPosition(pos); return; } } catch (e) {}
          // Fallbacks: prefer doGpsRefresh if available, otherwise set marker only
          try { if (typeof window.mosysDoGpsRefresh === 'function') { window.mosysDoGpsRefresh(); return; } } catch (e) {}
          try { if (typeof window.mosysSetMarker === 'function') { window.mosysSetMarker(pos.coords.longitude, pos.coords.latitude); } else { /* no-op */ } } catch (e) {}
        } catch (e) { /* ignore */ }
      }, (err) => {
        // ignore errors — map is already visible with default coords
      }, geoOpts);
    }
  });
 
})();