function hasLatLon(site) {
  return site.lat && site.lon
}

function addSiteToMap(map, marker) {
  marker.addTo(map)
}

const DEFAULT_MARKER_STYLES = {
  color: '#5fcc5f',
  fillColor: '#965bd2',
  fillOpacity: 0.7,
  radius: 5,
  weight: 1,
}

const ACTIVE_MARKER_STYLES =  {
  color: '#965bd2',
  fillColor: '#965bd2',
  fillOpacity: 0.7,
  radius: 8,
  weight: 2,
}

function makeSiteMarker(site) {
  return L.circleMarker([
    site.lat,
    site.lon,
  ], DEFAULT_MARKER_STYLES)
}

function isSiteLatLong(latLng, site) {
  return (
    (site.lat * 1 === latLng.lat ) &&
    (site.lon * 1 === latLng.lng )
  )
}

function findSiteByLatLng(latLng) {
  return localforage.getItem('sites')
    .then(R.partial(R.find, [R.partial(isSiteLatLong, [latLng])]))
}

function getEventsBySite(site) {
  return localforage.getItem(`events/${site.Name}`)
    .then(function(events) {
      return {
        site,
        events,
      }
    })
}

function handleMarkerClick(markerClickEvent) {
  const marker = markerClickEvent.layer

  this.getLayers().forEach(function (layer) {  layer.setStyle(DEFAULT_MARKER_STYLES) })
  marker.setStyle(ACTIVE_MARKER_STYLES)

  findSiteByLatLng(marker.getLatLng())
    .then(getEventsBySite)
    .then(console.log)
}

const getSortedIncomesFromFeatures = R.pipe(
  R.map(R.path(['properties', 'Median_HHI'])),
  R.reject(R.isNil),
  R.sortBy(R.identity),
)

function plotSites(sites) {
  var mymap = L.map('map').setView([29.7604, -95.3698], 11);

  const hyddaLayer = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
      attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
  })

  const esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  })

  const Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
    maxZoom: 13
  })
  
  Esri_OceanBasemap.addTo(mymap)
  // JusticeMap_income.addTo(mymap)
  // hyddaLayer.addTo(mymap)

  const siteMarkers = sites
    .map(makeSiteMarker)

  const sitesLayer = L.featureGroup(siteMarkers);

  sitesLayer
    .on('click', handleMarkerClick)

  axios.get('./data/Median_Household_Income_by_Census_Block_Group_2010.geojson')
    .then(function(response) {
      
      let geoJSONData = response.data

      const allIncomes = getSortedIncomesFromFeatures(geoJSONData.features)

      const incomeMin = allIncomes[0]
      const incomeMax = R.last(allIncomes)

      window.allIncomes = allIncomes

      const incomeToColor = d3.scaleLinear()
        .domain([incomeMin, incomeMax])
        .range(['white', 'green'])

      const features = geoJSONData.features.map(function(feature) {
        const codeParkSites = sites.filter(function(site){
          return feature.geometry.coordinates.reduce(function (result, coords) {
            return pointInPolygon([site.lon, site.lat], coords) || result
          }, false)
        })

        // mutating stuffs...not recommedned.d.d.d.
        // if (hasCodePark) {
        //   hasCodePark.geoJSON = feature
        // }

        return R.mergeDeepRight(feature, {
          properties: {
            codeParkSites,
          },
        })
      })

      window.sites = sites

      const [
        featuresWithoutCodePark,
        featuresWithCodePark,
      ] = R.partition(R.pipe(
        R.path(['properties', 'codeParkSites']),
        R.isEmpty,
      ))(features)

      const incomesWithCodePark = getSortedIncomesFromFeatures(featuresWithCodePark)

      console.log(allIncomes, incomesWithCodePark)

      const layerWithCodePark = L.geoJSON({
        type: 'FeatureCollection',
        features: featuresWithCodePark,
      }, {
        style: function(feature) {
          return {
            weight: 2,
            color: '#965bd2',
            fillColor: incomeToColor(feature.properties.Median_HHI),
            fillOpacity: 1,
          }
        }
      })

      const layerWithoutCodePark = L.geoJSON({
        type: 'FeatureCollection',
        features: featuresWithoutCodePark,
      }, {
        style: function(feature) {
          return {
            weight: 1,
            fillColor: incomeToColor(feature.properties.Median_HHI),
            fillOpacity: 1,
          }
        }
      })

      layerWithCodePark.on('click', function(clickEvent){
        console.log(clickEvent.layer.feature.properties.Median_HHI)
        window.activeTract = clickEvent.layer
      })

      layerWithoutCodePark.on('click', function(clickEvent){
        console.log(clickEvent.layer.feature.properties.Median_HHI, 'no code')
      })
      
      layerWithoutCodePark.addTo(mymap);
      layerWithCodePark.addTo(mymap);
    })
    .then(function() {
      sitesLayer.addTo(mymap)
    })
}

function storeSitePromise(site) {
  return localforage.setItem(`sites/${site.Name}`, site)
}

function handleLocationsCSV(response) {
  const sites = response.data
    .filter(hasLatLon)

  const storeSitesPromises = sites.map(storeSitePromise)

  return localforage.setItem(`sites`, sites)
    .then(function () {
      return Promise.all(storeSitesPromises)
    })
    .then(plotSites)
}

Papa.parse("./locations-cleaned.csv", {
  download: true,
  header: true,
	complete: handleLocationsCSV,
})