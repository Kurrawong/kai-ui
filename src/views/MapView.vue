<script lang="ts" setup>
import { ref } from "vue";
import { Button } from "../components/ui/button";
import type { MapStyle, MapStyleOptions } from "../types";
import Map from "../components/map/Map.vue";
import { featureCollection } from "../data/map-testdata.ts";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from 'ol/style/Circle';
import Table from '@/components/table/Table';

// OpenLayers Map
/*
  Loading data onto the map is usually asynchronous, with the data coming from a backend.
  Below, we simulate this using a setTimeout.
  Loading in data is as simple as setting the value on a ref that contains the layers you want to display.
  Similarly, clearing this data is done by simply setting this ref value to an empty array.
  Check out ../data/map-testdata.ts for the format the map expects.
*/
const loading = ref(false);
const drawEnabled = ref(false);
const layers = ref<any[]>([]);

async function loadMapData() {
    loading.value = true;
    await new Promise(r => setTimeout(r, 1000));

    layers.value = [featureCollection];
    loading.value = false;
}

async function clearMapData() {
    layers.value = [];
}


/* The map emits several events:
  "drawstart",
  "drawend",
  "select",
  "hover",
  "change:zoom",
  "change:center",
  "change:rotation",
*/
function drawend (feature) {
    console.log('The user drew a feature:');
    console.log(feature);
}

function select (feature) {
    if (feature) {
        console.log('The user selected ' + feature.name);
    }
}

// this little hack keeps the map where it's at after (re-)loading the layers after a query
let currentZoom = 4.5;
const onChangeZoom = (newZoom) => {
  currentZoom = newZoom;
}
let currentCenter = [133.7751, -25.2744];
const onChangeCenter = (newCenter) => {
  currentCenter = newCenter;
}
let currentRotation = 0;
const onChangeRotation = (newRotation) => {
  currentRotation = newRotation;
}

// This sets the general styling of the Map.
// You can also override styling for individual features/layers through a function (see further below)
const mapStyle: MapStyle = {
    style: {
        strokeWidth: 2,
        strokeColor: "blue",
        fillColor: "rgba(125, 125, 255, 0.4)",
        pointRadius: 6,
        pointFillColor: "rgba(125, 125, 255, 0.4)",
        pointStrokeWidth: 1,
        pointStrokeColor: "black",
    },
    hoverStyle: {
        strokeWidth: 2,
        strokeColor: "blue",
        fillColor: "rgba(125, 125, 255, 0.4)",
        pointRadius: 6,
        pointFillColor: "rgba(125, 125, 255, 0.4)",
        pointStrokeWidth: 1,
        pointStrokeColor: "black",
    },
    selectStyle: {
        strokeWidth: 2,
        strokeColor: "blue",
        fillColor: "rgba(125, 125, 255, 0.4)",
        pointRadius: 6,
        pointFillColor: "rgba(125, 125, 255, 0.4)",
        pointStrokeWidth: 1,
        pointStrokeColor: "black",
    },
};

const drawStyle: MapStyleOptions = {
    strokeWidth: 2,
    strokeColor: "blue",
    fillColor: "rgba(125, 125, 255, 0.4)",
    pointRadius: 6,
    pointFillColor: "rgba(125, 125, 255, 0.4)",
    pointStrokeWidth: 1,
    pointStrokeColor: "black",
};

/* This allows us to override the styling for individual features.
  This should return an openlayers Style object. (https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html)
  Note that it differs a bit from vue3openlayers in that it doesn't provide the resolution as a 3rd argument,
  but rather the layer the feature was added to. See https://vue3openlayers.netlify.app/componentsguide/styles/style/#overridestylefunction

  The function provides 3 arguments.
  feature: the feature the Style will be applied to
  currentStyle: the current Style object for that feature
  layer: the layer that this feature belongs to (useful when styling individual FeatureCollections)

  Pay special attention when styling Polygons vs Points, as the latter needs a Circle Style object (example given below).
 */
function layersOverrideStyleFunction(
  feature: any,
  currentStyle: any,
  layer: any,
) {
  //Polygon styling
  if (feature.name === 'Broken Hill') {
    const fill = new Fill({
      color: "rgba(0,255,50,0.7)",
    });

    const stroke = new Stroke({
      color: "rgba(0, 100, 30, 1)",
    });

    return {
      fill,
      stroke,
    };
  }
  // Circle styling
  if (feature.data?.type == 'POI') {
    const fill = new Fill({
      color: "rgba(255, 100, 90, 0.3)",
    });

    const stroke = new Stroke({
      color: "rgba(255, 0, 0, 1)",
    });

    const circleStyle = new CircleStyle({
      radius: 6,
      fill,
      stroke
    });
    return {
      image: circleStyle,
      fill,
      stroke
    };
  }
  // if all else fails, just return the currentStyle, or your features won't show up on the map
  return currentStyle;
}
</script>

<template>
    <h2>OpenLayers Map</h2>
        <div class="flex flex-row gap-2 items-center">
            <p>Features:</p>
            <ul>
              <li>Select an area on the map by enabling draw mode using the polygon icon (&#9186;) at the top of the map.</li>
              <li><Button variant="outline" @click="loadMapData">Load data</Button></li>
              <li><Button variant="destructive" @click="clearMapData">Clear data</Button></li>
            </ul>
        </div>

        <Map class="kai-demo-map"
            :center="currentCenter"
            @change:center="onChangeCenter"
            :zoom="currentZoom"
            @change:zoom="onChangeZoom"
            :rotation="currentRotation"
            @change:rotation="onChangeRotation"
            :projection="'EPSG:4326'"
            :layers="layers"
            :loading="loading"
            :drawEnabled="drawEnabled"
            :clearDrawingsOnLayerChange="false"
            :fitAddedLayersToExtent="true"
            :animationDuration="1000"
            :enableCustomMapControls="true"
            :tooltipIriQueryString="'_profile=alt'"
            :layersOverrideStyleFunction="layersOverrideStyleFunction"
            @drawend="drawend"
            @select="select" />
</template>

<style lang="css" scoped>
    .kai-demo-map {
        height: 500px;
        width: 100%;
    }
</style>