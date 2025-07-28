<script lang="ts" setup>
import { ref } from "vue";
import { Button } from "../components/ui/button";
import type { MapStyle, MapStyleOptions } from "../types";
import Map from "../components/map/Map.vue";
import { featureCollection } from "../data/map-testdata.ts"

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
</script>

<template>
    <h2>OpenLayers Map</h2>
    <div class="flex flex-row gap-2 items-center">
        <Button variant="outline" @click="loadMapData">Load data</Button>
        <Button variant="destructive" @click="clearMapData">Clear data</Button>
    </div>
    <div class="flex flex-row gap-2 items-center">
        <label for="checkbox">Enable Draw Mode</label>
        <input type="checkbox" id="checkbox" v-model="drawEnabled" />
    </div>

    <Map class="kai-demo-map"
        :center="[133.7751, -25.2744]"
        :zoom="4"
        :rotation="0"
        :projection="'EPSG:4326'"
        :layers="layers"
        :loading="loading"
        :drawEnabled="drawEnabled"
        :mapStyle="mapStyle"
        :drawStyle="drawStyle"
        @drawend="drawend"
        @select="select"
    />
</template>

<style lang="css" scoped>
    .kai-demo-map {
        height: 500px;
        width: 100%;
    }
</style>