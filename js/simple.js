function hasLatLon(site) {
  return site.lat && site.lon
}

function handleLocationsCSV(response) {
  const sites = response.data
    .filter(hasLatLon)

  const eventsLayer = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
      return  L.divIcon({ html: '<span class="cluster-marker--count">' + cluster.getChildCount() +'</span>', className: 'cluster-marker' });
    },
    singleMarkerMode: true,
  });

  const myIcon = L.divIcon({ html: '<span class="cluster-marker--count">1</span>', className: 'cluster-marker' });

  sites.forEach(function(site) {
    eventsLayer.addLayer(L.marker([site.lat, site.lon], {
      // icon: myIcon
    }))
  })

  var mymap = L.map('map').setView([29.7604, -95.3698], 11);
  const Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
    maxZoom: 13
  })

  zoomOutToAll(mymap, eventsLayer)
  Esri_OceanBasemap.addTo(mymap)

  eventsLayer.addTo(mymap)

  function zoomOutToAll(map, layer) {
    map.fitBounds(layer.getBounds())
  }
  function addZoomOutToAllButton(map) {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.style.backgroundColor = 'white'
    container.style.width = '30px'
    container.style.height = '30px'
    container.style.backgroundImage = "url(https://static1.squarespace.com/static/59cc06facd0f680d7a60ccbe/t/59cc08f9f9a61ea643113d0a/1544097621092/)"
    container.style.backgroundSize = 'contain'
    container.onclick = function(){
      zoomOutToAll(mymap, eventsLayer)
    }
    return container;
  }

  const ZoomOutToAllButton = L.Control.extend({
    options: {
      position: 'topleft',
    },
    onAdd: addZoomOutToAllButton
  })

  mymap.addControl(new ZoomOutToAllButton())

}

Papa.parse('./events-locations-merged.csv', {
  download: true,
  header: true,
	complete: handleLocationsCSV,
})