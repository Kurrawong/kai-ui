<script lang="ts" setup>
import GraphDiagram from "../components/diagram/GraphDiagram.vue";
import { KURRAWONG_DATA, TEST_VOCAB } from "../data/diagram-testdata";

const options: InstanceType<typeof GraphDiagram>["$props"]["options"] = {
    predicates: [
        "http://www.w3.org/2004/02/skos/core#prefLabel",
        "http://www.w3.org/2004/02/skos/core#narrower",
        "http://www.w3.org/2004/02/skos/core#broader",
        "http://www.w3.org/2004/02/skos/core#hasTopConcept",
        "http://www.w3.org/2004/02/skos/core#topConceptOf",
        //  "http://www.w3.org/2004/02/skos/core#inScheme",
    ],
    labels: [
        "http://www.w3.org/2004/02/skos/core#prefLabel",
        // "https://schema.org/name"
    ],
    query: `PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    CONSTRUCT {
        ?s ?p ?o .
    }
    WHERE {
        VALUES ?class { skos:Concept skos:ConceptScheme }
        ?s a ?class ;
            ?p ?o .
    }`,
    // query: `PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    
    // CONSTRUCT {
    //     ?cs a skos:ConceptScheme ;
    //         skos:prefLabel ?cslabel .
    //     ?c a skos:Concept ;
    //         skos:inScheme ?cs ;
    //         skos:prefLabel ?label .
    // }
    // WHERE {
    //     ?cs a skos:ConceptScheme ;
    //         skos:prefLabel ?cslabel .
    //     ?c a skos:Concept ;
    //         skos:inScheme ?cs ;
    //         skos:prefLabel ?label .
    // }`
    // style: {
    //     literal: "red"
    // }
}
</script>

<template>
    <h2>Graph visualiser</h2>
    <GraphDiagram :data="TEST_VOCAB" :options="options" :showLabels="true" />
</template>
