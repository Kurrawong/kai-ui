<script lang="ts" setup>
import { ref } from "vue";
import { Button } from "../components/ui/button";
import type { MapStyle, MapStyleOptions } from "../types";
import Map from "../components/map/Map.vue";
import { featureCollection } from "../data/map-testdata.ts"

// OpenLayers Map

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
            @drawend="drawend"
            @select="select" />
</template>

<style lang="css" scoped>
    .kai-demo-map {
        height: 500px;
        width: 100%;
    }
</style>