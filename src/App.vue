<script lang="ts" setup>
import { ref } from "vue";
import CodeEditor from "./components/CodeEditor.vue";
import Map from "./components/Map.vue";
import { featureCollection } from "./data/map-testdata.ts"

const data = ref("");

// Code editor
function setData() {
    data.value = `SELECT *
WHERE {
    ?s ?p ?o .
}`;
}

// OpenLayers Map

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
    <h1>Kurrawong Component Library</h1>
    <h2>Code Editor</h2>

    <pre>{{ data }}</pre>
    <button @click="setData">Set data</button>
    <CodeEditor v-model="data" language="sparql" />

    <hr />

    <h2>OpenLayers Map</h2>
    <button @click="loadMapData">Load data</button>
    <button @click="clearMapData">Clear data</button>
    <div>
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
