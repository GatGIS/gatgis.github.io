window.onload = init();
function init(){
    const map = new ol.Map({
        view: new ol.View({
            center: [2682857.1135981246, 7748815.42281414],
            zoom: 12
        }),
        layers: [
            new ol.layer.Tile({
                title: 'OSM',
                source: new ol.source.OSM()
            }),
            new ol.layer.Tile({
                title: 'LGIA Ortofoto',
                source: new ol.source.TileArcGISRest({
                  url: 'https://services.lgia.gov.lv/arcfree/rest/services/WMS_Ortofoto_v6/MapServer',
                  //crossOrigin: 'anonymous',
                  attributions:
                    '© <a href="http://services.lgia.gov.lv/arcfree/rest/services"' +
                    'target="_blank">LĢIA</a>',

                }),
              }),
            new ol.layer.Tile({
                title: 'Kadastrs',
                source: new ol.source.TileWMS({
                    url: 'https://lvmgeoserver.lvm.lv/geoserver/ows?layer=publicwfs%3AKadastra_karte',
                }),
            })
            ],
        target: 'map'
    })
    map.on('click', function(e){
        console.log(e.coordinate);
    })
    var layerSwitcher = new LayerSwitcher({
        reverse: true,
        groupSelectStyle: 'group'
    });
    map.addControl(layerSwitcher);
}
