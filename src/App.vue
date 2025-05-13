<script lang="ts" setup>
import { ref } from "vue";
import { Button } from "./components/ui/button";
import SelectInput from "./components/SelectInput.vue";
import { Editor, languageOptions } from "./components/editor";
import type { Language } from "./types";

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
//     xml: `<element>value</element>
// <!-- comment -->`,
    python: `arr2: list[str] = [x for x in arr1]
# comment`,
//     yaml: `prop:
//   prop2:
//     - array item`,
};

const data = ref(`PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT *
WHERE {
    ?s skos:prefLabel "sdlkfjlskdfsdf"^^<https://example.com/datatype> .
}`);
const language = ref<Language>("sparql");

function loadExample(lang: Language) {
    language.value = lang;
    data.value = examples[lang];
}

function clear() {
    language.value = "sparql";
    data.value = "";
}
</script>

<template>
    <div class="min-h-dvh">
        <h1>Kurrawong Component Library</h1>
        <h2>RDF Editor</h2>
        <div class="flex flex-row gap-2 items-center">
            <SelectInput @select="loadExample($event as Language)" :options="languageOptions" placeholder="Load example" />
            <Button variant="destructive" @click="clear">Clear</Button>
        </div>
        <!-- <pre>{{ data }}</pre>
        <textarea name="" id="" v-model="data" class="w-full border h-[100px] my-4"></textarea> -->
        <Editor v-model="data" v-model:language="language" />
    </div>
</template>