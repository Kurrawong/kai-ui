<script lang="ts" setup>
import { computed, type HTMLAttributes, onMounted, ref } from "vue";
import { VisSingleContainer, VisGraph } from "@unovis/vue";
import { type GraphLinkLabel, type GraphConfigInterface, Graph, GraphNodeSelectionHighlightMode, type GraphNode as Node } from "@unovis/ts";
import { Eye, EyeClosed } from "lucide-vue-next";
import init, * as oxigraph from "oxigraph/web";
import type { GraphNode, GraphLink, GraphData, RDFFormat } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// elk layout for entity relationship diagram?

const props = defineProps<{
    /**
     * The RDF data to load & display
     */
    data: string;
    options?: {
        /**
         * The format of the data to load
         */
        format?: RDFFormat;
        /**
         * A map of prefixes to generate curies - e.g. `{"sdo": "https://schema.org/", ...}`
         */
        prefixes?: Record<string, string>;
        /**
         * Array of predicate IRIs to filter by
         */
        predicates?: string[];
        /**
         * Array of labelling predicates which label nodes instead of IRIs
         */
        labels?: string[];
        /**
         * A SPARQL CONSTRUCT query to filter results
         */
        query?: string;
        /**
         * Colour config for each node type - node, literal & bnode
         */
        style?: {
            node?: string;
            literal?: string;
            bnode?: string;
            nodeBorderColor?: string;
        };
    };
    /**
     * Additional options for Unovis Graph
     * 
     * @see https://unovis.dev/docs/networks-and-flows/Graph#component-props
     */
    graphOptions?: GraphConfigInterface<GraphNode, GraphLink>;
    class?: HTMLAttributes["class"];
}>();

const DEFAULT_PREFIXES: Record<string, string> = {
    "dcat": "http://www.w3.org/ns/dcat#",
    "dcterms": "http://purl.org/dc/terms/",
    "geo": "http://www.opengis.net/ont/geosparql#",
    "olis": "https://olis.dev",
    "owl": "http://www.w3.org/2002/07/owl#",
    "prez": "https://prez.dev",
    "prov": "http://www.w3.org/ns/prov#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "sdo": "https://schema.org/",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
};

const showLabels = defineModel("showLabels", { default: false });

const selectedNodeId = ref<string | number | undefined>(undefined);
const initialised = ref(false);

const data = computed(() => {
    return initialised.value ? rdfToChart(props.data, props.options?.format) : {nodes: [], links: []};
});

const nodeLabel = (n: GraphNode) => n.label;
const linkLabel = (l: GraphLink): GraphLinkLabel => ({ text: l.label });

const defaultGraphOptions: GraphConfigInterface<GraphNode, GraphLink> = {
    nodeSize: 30,
    linkWidth: 2,
    nodeFill: (n: GraphNode) => n.type === "node" ? props.options?.style?.node || "hsl(47.9, 95.8%, 53.1%)" : (n.type === "bnode" ? props.options?.style?.bnode || "grey" : props.options?.style?.literal || "#12100e"),
    linkArrow: true,
    forceLayoutSettings: {
        linkDistance: 80,
        linkStrength: 0.45,
        charge: -1000,
        forceXStrength: 0.15,
        forceYStrength: 0.4,
    },
    nodeSelectionHighlightMode: GraphNodeSelectionHighlightMode.GreyoutNonConnected,
};

const graphOptions: GraphConfigInterface<GraphNode, GraphLink> = {...defaultGraphOptions, ...props.graphOptions};

// Record<keyof Graph.selectors, Record<VisEventType, () => void>>

// {[key: Graph.selectors]: {[eventType: VisEventType]: () => void}}

const events = {
    [Graph.selectors.node]: {
        click: (n: Node<GraphNode>) => selectedNodeId.value = n.id,
        // mouseover: (n: Node<GraphNode>) => {
        //     console.log(n._index)
        // },
    },
    [Graph.selectors.background]: {
        click: () => selectedNodeId.value = undefined,
    }
};

function curie(s: string, prefixes?: Record<string, string>): string | undefined {
    if (s === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") return "a";
    const mergedPrefixes = {...DEFAULT_PREFIXES, ...prefixes};
    const prefixMatches = Object.keys(mergedPrefixes).filter(p => s.startsWith(mergedPrefixes[p]));
    if (prefixMatches.length === 0) {
        return undefined;
    } else {
        // use longest prefix
        const prefix = prefixMatches.reduce((acc, curr) => mergedPrefixes[curr].length > mergedPrefixes[acc].length ? curr : acc, prefixMatches[0]);
        return `${prefix}:${s.split(mergedPrefixes[prefix])[1]}`;
    }
}

function rdfToChart(s: string, format: RDFFormat = "text/turtle"): GraphData {
    const store = new oxigraph.Store();
    store.load(s, { format: format });

    const links: GraphLink[] = [];
    const nodeMap: Record<string, GraphNode> = {};

    const nodeTypes: Record<oxigraph.Quad_Object["termType"], GraphNode["type"]> = {
        "Literal": "literal",
        "BlankNode": "bnode",
        "NamedNode": "node",
        "Variable": "node",
        "Quad": "node",
    };

    const quads = props.options?.query ? (store.query(props.options.query) as oxigraph.Quad[]) : store.match(null, null, null, null);

    quads.forEach(q => {
        if (!(props.options?.predicates && !props.options?.predicates.includes(q.predicate.value))) {
            nodeMap[q.subject.value] ??= {
                id: q.subject.value,
                type: "node",
                label: q.subject.value,
            };

            if (props.options?.labels && props.options.labels.includes(q.predicate.value)) {
                nodeMap[q.subject.value].label = q.object.value;
            } else {
                nodeMap[q.object.value] ??= {
                    id: q.object.value,
                    type: nodeTypes[q.object.termType],
                    label: q.object.termType === "Literal" ? `"${q.object.value}"` : q.object.value,
                };

                links.push({
                    id: q.predicate.value,
                    source: q.subject.value,
                    target: q.object.value,
                    label: curie(q.predicate.value, props.options?.prefixes) || q.predicate.value,
                });   
            }
        }
    });

    const nodes = Object.values(nodeMap);
    return { nodes, links };
}

onMounted(() => {
    init("https://cdn.jsdelivr.net/npm/oxigraph@0.4.9/web_bg.wasm").then(() => {
        initialised.value = true;
    });
});
 </script>

<template>
    <VisSingleContainer v-if="initialised" :data="data" :class="cn('kai-graph relative', props.class)">
        <VisGraph
            v-bind="graphOptions"
            :nodeLabel="showLabels ? nodeLabel : undefined"
            :linkLabel="showLabels ? linkLabel : undefined"
            :selectedNodeId="selectedNodeId"
            :events="events"
        />
        <Button variant="ghost" size="icon" @click="showLabels = !showLabels" title="Toggle labels" class="absolute right-4 bottom-4">
            <EyeClosed v-if="showLabels" class="size-4" />
            <Eye v-else class="size-4" />
        </Button>
    </VisSingleContainer>
</template>

<style>
/* dark theme overrides until Unovis supports configuring the target class for detecting dark theme */
html.dark {
    --vis-graph-node-stroke-color: var(--vis-dark-graph-node-stroke-color);
    --vis-graph-node-fill-color: var(--vis-dark-graph-node-fill-color);
    --vis-graph-node-gauge-color: var(--vis-dark-graph-node-gauge-color);
    --vis-graph-node-selection-color: var(--vis-dark-graph-node-selection-color);
    --vis-graph-node-icon-fill-color: var(--vis-dark-graph-node-icon-fill-color);
    --vis-graph-node-bottom-icon-fill-color: var(--vis-dark-graph-node-bottom-icon-fill-color);
    --vis-graph-node-bottom-icon-stroke-color: var(--vis-dark-graph-node-bottom-icon-stroke-color);
    --vis-graph-node-label-background: var(--vis-dark-graph-node-label-background);
    --vis-graph-node-label-text-color: var(--vis-dark-graph-node-label-text-color);
    --vis-graph-node-sublabel-text-color: var(--vis-dark-graph-node-sublabel-text-color);
    --vis-graph-node-side-label-background-fill-color: var(--vis-dark-graph-node-side-label-background-fill-color);
    --vis-graph-node-side-label-background-stroke-color: var(--vis-dark-graph-node-side-label-background-stroke-color);
    --vis-graph-node-side-label-fill-color-bright: var(--vis-dark-graph-node-side-label-fill-color-bright);
    --vis-graph-node-side-label-fill-color-dark: var(--vis-dark-graph-node-side-label-fill-color-dark);
    --vis-graph-node-greyout-color: var(--vis-dark-graph-node-greyout-color);
    --vis-graph-node-icon-greyout-color: var(--vis-dark-graph-node-icon-greyout-color);
    --vis-graph-node-side-label-background-greyout-color: var(--vis-dark-graph-node-side-label-background-greyout-color);
    --vis-graph-link-stroke-color: var(--vis-dark-graph-link-stroke-color);
    --vis-graph-link-label-background: var(--vis-dark-graph-link-label-background);
    --vis-graph-link-label-text-color: var(--vis-dark-graph-link-label-text-color);
    --vis-graph-panel-border-color: var(--vis-dark-graph-panel-border-color);
    --vis-graph-panel-fill-color: var(--vis-dark-graph-panel-fill-color);
    --vis-graph-panel-label-color: var(--vis-dark-graph-panel-label-color);
    --vis-graph-panel-label-background: var(--vis-dark-graph-panel-label-background);
    --vis-graph-panel-side-icon-symbol-color: var(--vis-dark-graph-panel-side-icon-symbol-color);
    --vis-graph-panel-side-icon-shape-fill-color: var(--vis-dark-graph-panel-side-icon-shape-fill-color);
    --vis-graph-panel-border-color: var(--vis-dark-graph-panel-border-color);
}
</style>