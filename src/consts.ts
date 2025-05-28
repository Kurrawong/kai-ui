import type { MapStyle, MapStyleOptions } from "@/types";

// map colours
const defaultStroke = "rgb(44, 142, 197)";
const defaultFill = "rgba(255, 255, 255, 0.4)";
const defaultDrawStroke = "rgba(255, 255, 255, 0.8)";
const defaultDrawFill = "rgb(0, 143, 255)";

export const defaultMapStyle: MapStyle = {
    style: {
        strokeWidth: 1,
        strokeColor: defaultStroke,
        fillColor: defaultFill,
        pointRadius: 5,
        pointFillColor: defaultFill,
        pointStrokeWidth: 1,
        pointStrokeColor: defaultStroke,
    },
    hoverStyle: {
        strokeWidth: 2,
        strokeColor: defaultStroke,
        fillColor: "rgba(255, 255, 255, 0.8)",
        pointRadius: 5,
        pointFillColor: "rgba(255, 255, 255, 0.8)",
        pointStrokeWidth: 1,
        pointStrokeColor: defaultStroke,
    },
    selectStyle: {
        strokeWidth: 2,
        strokeColor: "blue",
        fillColor: "rgba(125, 125, 255, 0.4)",
        pointRadius: 5,
        pointFillColor: "rgba(125, 125, 255, 0.4)",
        pointStrokeWidth: 1,
        pointStrokeColor: "blue",
    },
};

export const defaultDrawStyle: MapStyleOptions = {
    strokeWidth: 2,
    strokeColor: defaultStroke,
    fillColor: defaultFill,
    pointRadius: 5,
    pointFillColor: defaultDrawFill,
    pointStrokeWidth: 2,
    pointStrokeColor: defaultDrawStroke,
};
