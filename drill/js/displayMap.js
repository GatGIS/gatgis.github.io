(function () {
  // Default coordinate (lon, lat) used if geolocation isn't available
  // Updated start location to user's location: lat 56.9361061, lon 24.0625166
  const DEFAULT_COORD = { lon: 24.0625166, lat: 56.9361061 };

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
      type: 'base',
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

    const map = new ol.Map({
      target: 'map',
      layers: [osmLayer, orthoLayer, cadastralLayer],
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
            <button id="mosys-refresh" class="mosys-btn secondary">Refresh</button>
            <button id="mosys-close" class="mosys-close" style="display:none">Close</button>
          </div>
        </div>

        <div class="layer-selector" aria-label="Map layers">
          <label><input type="checkbox" name="mosys-layer" value="osm" checked> OSM</label>
          <label><input type="checkbox" name="mosys-layer" value="ortho"> Ortofoto 7</label>
          <label><input type="checkbox" name="mosys-layer" value="kadastrs"> Kadastrs</label>
        </div>

        <div class="controls">
          <input id="mosys-lat" type="text" placeholder="Latitude (x)" />
          <input id="mosys-lon" type="text" placeholder="Longitude (y)" />
        </div>

        <div class="buttons-row" style="margin-top:6px;">
          <!-- retained for layout parity; empty or for extra actions -->
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

    // Wire layer checkboxes to actual layer visibility (allow multiple checked)
    const layerCheckboxes = panel.querySelectorAll('input[name="mosys-layer"]');
    function updateLayersFromCheckboxes() {
      if (!layerCheckboxes || layerCheckboxes.length === 0) return;
      layerCheckboxes.forEach(cb => {
        try {
          const v = cb.value;
          if (v === 'osm') osmLayer.setVisible(cb.checked);
          if (v === 'ortho') orthoLayer.setVisible(cb.checked);
          if (v === 'kadastrs') cadastralLayer.setVisible(cb.checked);
        } catch (e) {
          // ignore if layers not available yet
        }
      });
      try { map.render(); } catch (e) {}
    }
    layerCheckboxes.forEach(cb => cb.addEventListener('change', updateLayersFromCheckboxes));
    // apply initial states
    updateLayersFromCheckboxes();

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
      drillBtn.textContent = 'Drill';
      panel.querySelector('.top-actions').appendChild(drillBtn);
    }
    if (!refreshBtn) {
      refreshBtn = document.createElement('button');
      refreshBtn.id = 'mosys-refresh';
      refreshBtn.className = 'mosys-btn secondary';
      refreshBtn.textContent = 'Refresh';
      panel.querySelector('.top-actions').appendChild(refreshBtn);
    }

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
          ensurePanelFits();
        } catch (e) {}
      });
    } catch (e) {
      // if map.on is not available, ignore
    }

    // Dynamic panel fit: compute required panel height so header + top-actions + controls fit
    function ensurePanelFits() {
      const docH = window.innerHeight || document.documentElement.clientHeight;
      // if results are open, respect results-open (70vh); still ensure it's not smaller than required
      const resultsOpen = appEl && appEl.classList.contains('results-open');
      // measure required pixel height of panel content we want visible (header + layer-selector + controls + small padding)
      const headerEl = panel.querySelector('.mosys-header');
      const layerEl = panel.querySelector('.layer-selector');
      const controlsEl = panel.querySelector('.controls');

      let neededPx = 0;
      if (headerEl) neededPx += headerEl.getBoundingClientRect().height;
      if (layerEl) neededPx += layerEl.getBoundingClientRect().height;
      if (controlsEl) neededPx += controlsEl.getBoundingClientRect().height;
      // include webAnswer minimal area (single line) and padding
      neededPx += 80; // safety padding for small webAnswer area and spacing

      // convert to vh and clamp
      let neededVh = (neededPx / docH) * 100;
      if (neededVh < 20) neededVh = 20; // ensure panel not tiny
      if (neededVh > 80) neededVh = 80; // cap
      if (resultsOpen) {
        // prefer results-open value (70vh), but ensure it's at least neededVh
        neededVh = Math.max(neededVh, 70);
      } else {
        // default target (use variable but ensure it meets neededVh)
        neededVh = Math.max(neededVh, 35);
      }
      // set CSS var on root
      document.documentElement.style.setProperty('--panel-height', neededVh + 'vh');
      // update map height immediately
      const mapEl = document.getElementById('map');
      if (mapEl) map.updateSize && setTimeout(() => { try { map.updateSize(); } catch (e) {} }, 200);
    }

    // call ensurePanelFits now and on resize/orientation change
    ensurePanelFits();
    window.addEventListener('resize', ensurePanelFits);
    window.addEventListener('orientationchange', ensurePanelFits);

    // run ensurePanelFits when showing results or collapsing
    function expandResults() {
      if (appEl) appEl.classList.add('results-open');
      if (closeBtn) closeBtn.style.display = 'inline-flex';
      ensurePanelFits();
    }
    function collapseResults() {
      if (appEl) appEl.classList.remove('results-open');
      if (closeBtn) closeBtn.style.display = 'none';
      tableContainer.innerHTML = '';
      webAnswer.textContent = '';
      ensurePanelFits();
    }
    if (closeBtn) closeBtn.addEventListener('click', collapseResults);

    // GPS refresh: center marker on current view center or use browser geolocation
    refreshBtn.addEventListener('click', function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((p) => {
          setMarkerPosition({ lon: p.coords.longitude, lat: p.coords.latitude }, { setPosMethod: 'GPS' });
          // ensure panel still visible
          try { panel.scrollIntoView({ block: 'end', behavior: 'smooth' }); } catch (e) {}
        }, (err) => {
          const viewCenter = ol.proj.toLonLat(map.getView().getCenter());
          setMarkerPosition({ lon: viewCenter[0], lat: viewCenter[1] }, { setPosMethod: 'GPS' });
        }, { enableHighAccuracy: true, timeout: 5000 });
      } else {
        const viewCenter = ol.proj.toLonLat(map.getView().getCenter());
        setMarkerPosition({ lon: viewCenter[0], lat: viewCenter[1] }, { setPosMethod: 'GPS' });
      }
    });

    // Proxy fallback: AllOrigins -> ThingProxy
    async function fetchWithFallback(remoteUrl) {
      const proxies = [
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest=',
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
      webAnswer.textContent = 'Calculate on server ...';
      tableContainer.innerHTML = '';
      let dots = 0;
      if (waitInterval) { clearInterval(waitInterval); waitInterval = null; }
      waitInterval = setInterval(() => {
        dots = (dots + 1) % 5;
        webAnswer.textContent = 'Calculate on server ' + '.'.repeat(dots);
      }, 600);
      try {
        const text = await fetchWithFallback(remoteUrl);
        clearInterval(waitInterval); waitInterval = null;
        parseResponse(text);
        // show expanded results area after parsing
        expandResults();
      } catch (e) {
        clearInterval(waitInterval); waitInterval = null;
        webAnswer.textContent = 'Request failed: ' + (e.message || e);
      }
    }

    // parse server response similar to Android onPostExecute
    function parseResponse(result) {
      // show raw-ish converted text like Android for quick view
      webAnswer.textContent = result.replace(/\|/, '\nLayer : z [m]\n----------------\n').replace(/;/g, '\n').replace(/,/g, ' : ');
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
          webAnswer.textContent = head;

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

          tableContainer.innerHTML = '';
          tableContainer.appendChild(table);
          return;
        } else {
          webAnswer.textContent = 'ERROR: ' + header;
          return;
        }
      }
      webAnswer.textContent = 'Unexpected response format';
    }

    // Drill button click -> validate inputs and call sendRequest
    drillBtn.addEventListener('click', function() {
      const latStr = latInput.value.trim().replace(',', '.');
      const lonStr = lonInput.value.trim().replace(',', '.');
      if (!latStr || !lonStr) {
        webAnswer.textContent = 'Enter coordinates first';
        // ensure panel remains fully visible
        try { panel.scrollIntoView({ block: 'end', behavior: 'smooth' }); } catch (e) {}
        return;
      }
      if (isNaN(Number(latStr)) || isNaN(Number(lonStr))) {
        webAnswer.textContent = 'Invalid coordinates';
        try { panel.scrollIntoView({ block: 'end', behavior: 'smooth' }); } catch (e) {}
        return;
      }
      sendRequest(latStr, lonStr);
    });

    refreshBtn.addEventListener('click', function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((p) => {
          setMarkerPosition({ lon: p.coords.longitude, lat: p.coords.latitude }, { setPosMethod: 'GPS' });
          // ensure panel still visible
          try { panel.scrollIntoView({ block: 'end', behavior: 'smooth' }); } catch (e) {}
        }, (err) => {
          const viewCenter = ol.proj.toLonLat(map.getView().getCenter());
          setMarkerPosition({ lon: viewCenter[0], lat: viewCenter[1] }, { setPosMethod: 'GPS' });
        }, { enableHighAccuracy: true, timeout: 5000 });
      } else {
        const viewCenter = ol.proj.toLonLat(map.getView().getCenter());
        setMarkerPosition({ lon: viewCenter[0], lat: viewCenter[1] }, { setPosMethod: 'GPS' });
      }
    });
  }

  // Public API (for external calls)
  window.mosysMapInit = initMap;

  // Auto-init map with default coordinates after DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    // For local testing, use default coord directly
    initMap(DEFAULT_COORD);
  });
})();