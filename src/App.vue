<script lang="ts" setup>
import { ref } from "vue";
import CodeEditor from "./components/CodeEditor.vue";

const data = ref("");

function setData() {
    data.value = `SELECT *
WHERE {
    ?s ?p ?o .
}`;
}
</script>

<template>
    <h1>Kurrawong Component Library</h1>
    <h2>Code Editor</h2>

    <pre>{{ data }}</pre>
    <button @click="setData">Set data</button>
    <CodeEditor v-model="data" language="sparql" />
</template>