<script lang="ts" setup>
import { ref } from "vue";
import { Button } from "./components/ui/button";
import SelectInput from "./components/SelectInput.vue";
import { Editor, languageOptions } from "./components/editor";
import type { Language } from "./types";
import Map from "./components/map/Map.vue";
import { featureCollection } from "./data/map-testdata.ts"

// Code editor
const examples: Record<Language, string> = {
    json: `{
    "key": "value"
}`,
    sparql: `SELECT *
WHERE {
    ?s ?p ?o .
}
# comment`,
    turtle: `PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

<https://example.com> skos:prefLabel "label"@en ;
    <https://example.com/predicate> "literal"^^<https://example.com/datatype> ;
    skos:something [
        skos:x _:blanknode ;
    ] ;
.
# comment`,
    shacl: `PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
<https://example.com> skos:prefLabel "label"@en .
# comment`,
    trig: `PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
<https://example.com/graph> {
    <https://example.com/subject> skos:prefLabel "label"@en .
}
# comment`,
    "n-triples": `<https://example.com/subject> <https://example.com/predicate> "label"^^<https://example.com/datatype> .
<https://example.com/subject> <https://example.com/predicate> "label"@en .
<https://example.com/subject> <https://example.com/predicate2> _:blanknode .
# comment`,
    "n-quads": `<https://example.com/subject> <https://example.com/predicate> "label"^^<https://example.com/datatype> <https://example.com/graph> .
<https://example.com/subject> <https://example.com/predicate> "label"@en <https://example.com/graph> .
<https://example.com/subject> <https://example.com/predicate2> _:blanknode <https://example.com/graph> .
# comment`,
    javascript: `var x = "something";
// comment`,
    css: `.class {
    color: red;
}
/* comment */`,
    html: `<div class="oijsndfo">sjlksdfmksf</div>
<!-- comment -->`,
    typescript: `const x: string = "something";
// comment`,
    xml: `<element>value</element>
<!-- comment -->`,
    python: `arr2: list[str] = [x for x in arr1]
# comment`,
    java: `public static void`,
    n3: `@prefix dc: <http://purl.org/dc/elements/1.1/>.

<https://en.wikipedia.org/wiki/Tony_Benn>
  dc:title "Tony Benn";
  dc:publisher "Wikipedia".`,
//     yaml: `prop:
//   prop2:
//     - array item`,
};

const options = languageOptions.map(l => {return {value: l.id, label: l.label}}).sort((a, b) => a.label.localeCompare(b.label));

const data = ref(`PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT *
WHERE {
    ?s skos:prefLabel "sdlkfjlskdfsdf"^^<https://example.com/datatype> .
}`);
const language = ref("sparql");

function loadExample(lang: string) {
    language.value = lang;
    data.value = examples[lang];
}

function clear() {
    language.value = "sparql";
    data.value = "";
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
    <div class="min-h-dvh">
        <h1>Kurrawong Component Library</h1>
        <h2>Code Editor</h2>
        <div class="flex flex-row gap-2 items-center">
            <SelectInput @select="loadExample" :options="options" placeholder="Load example" />
            <Button variant="destructive" @click="clear">Clear</Button>
        </div>
        <!-- <pre>{{ data }}</pre>
        <textarea name="" id="" v-model="data" class="w-full border h-[100px] my-4"></textarea> -->
        <Editor v-model="data" v-model:language="language" />

        <hr />

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
            @drawend="drawend"
            @select="select"
        />

    </div>
</template>

<style lang="css" scoped>
    .kai-demo-map {
        height: 500px;
        width: 100%;
    }
</style>
