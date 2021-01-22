window.onload = init();
function init(){
    const map = new ol.Map({
        view: new ol.View({
            center: [2682857.1135981246, 7748815.42281414],
            zoom: 12
        }),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        target: 'map'
    })
    map.on('click', function(e){
        console.log(e.coordinate);
    })
}
