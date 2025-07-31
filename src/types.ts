import type Feature from "ol/Feature";
import type { GraphInputNode, GraphInputLink } from "@unovis/ts";
import { languageOptionsUntyped } from "@/components/editor";

export type Language = (typeof languageOptionsUntyped)[number]["id"];

export type MapStyleOptions = {
    strokeWidth?: number;
    strokeColor?: string;
    fillColor?: string;
    pointRadius?: number;
    pointStrokeWidth?: number;
    pointStrokeColor?: string;
    pointFillColor?: string;
};

export type MapStyle = {
    style?: MapStyleOptions;
    hoverStyle?: MapStyleOptions;
    selectStyle?: MapStyleOptions;
};

export type MapFeature = {
    type: "Feature";
    name: string;
    wkt?: string;
    geoJSON?: any;
    data?: any;
};

export type MapLayer = {
    type: "FeatureCollection";
    title: string;
    features: MapFeature[];
    mapStyle?: MapStyle;
};

export type ProcessedFeature = Feature & {
    name?: string;
};

export type ProcessedLayer = Omit<MapLayer, "features"> & {
    geoJSONFeatures: ProcessedFeature[];
};

export type GraphNode = GraphInputNode & {
    type: "node" | "literal" | "bnode";
    label: string;
};

export type GraphLink = GraphInputLink & {
    // curie?: string;
    label: string;
};

export type GraphData = {
    nodes: GraphNode[];
    links: GraphLink[];
};

export type RDFFormat = "application/ld+json" | "jsonld" |
    "text/turtle" | "ttl" |
    "application/trig" | "trig" |
    "application/n-triples" | "nt" |
    "application/n-quads" | "nq" |
    "text/n3" | "n3" |
    "application/rdf+xml" | "rdf";
