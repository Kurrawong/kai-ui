import type Feature from "ol/Feature";
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
