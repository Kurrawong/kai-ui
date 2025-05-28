<script lang="ts" setup>
import { ref, provide, watch, computed, useTemplateRef } from "vue";
import { Map, Layers, Sources, MapControls, Interactions, type Vue3OpenlayersGlobalOptions } from "vue3-openlayers";
import type Feature from "ol/Feature";
import { GeoJSON, WKT } from "ol/format";
import { pointerMove, click } from "ol/events/condition";
import { getCenter } from "ol/extent";
import type { SelectEvent } from "ol/interaction/Select";
import type { DrawEvent } from "ol/interaction/Draw";
import type { Type as GeometryType } from "ol/geom/Geometry"
import { defaultDrawStyle, defaultMapStyle } from "@/consts";
import 'vue3-openlayers/dist/vue3-openlayers.css';
import SelectInput from "@/components/SelectInput.vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { MapLayer, MapStyle, MapStyleOptions, ProcessedFeature, ProcessedLayer } from "@/types";
import LayerStyle from "./LayerStyle.vue";

const props = withDefaults(defineProps<{
    center?: number[];
    zoom?: number;
    rotation?: number;
    projection?: string;
    focusSourceRef?: InstanceType<typeof Sources.OlSourceVector> | null;
    layers?: MapLayer[];
    loading?: boolean;
    drawEnabled?: boolean;
    mapStyle?: MapStyle;
    drawStyle?: MapStyleOptions;
}>(), {
    center: () => [133.7751, -25.2744], // Australia
    zoom: 4,
    rotation: 0,
    projection: "EPSG:4326",
    focusSourceRef: null,
    layers: () => [],
    loading: false,
    drawEnabled: false,
    mapStyle: () => defaultMapStyle,
    drawStyle: () => defaultDrawStyle,
});

const emit = defineEmits(['drawstart', 'drawend', 'select', 'hover'])

const loading = ref(props.loading);
watch(() => props.loading, (newVal) => { loading.value = newVal; }, { immediate:true });
const drawEnabled = ref(props.drawEnabled);
watch(() => props.drawEnabled, (newVal) => { drawEnabled.value = newVal; }, { immediate:true });

const wktFormat = new WKT();
const geoJSONFormat = new GeoJSON();

const processedLayers = computed(() => {
    let newProcessedLayers: ProcessedLayer[] = [];
    for (const layer of props.layers) {
        // check all features for WKT geometry and translate it to GeoJSON
        const features = layer.features;
        const geoJSONFeatures: ProcessedFeature[] = [];
        for (const feature of features) {
            let geoJSONFeature: ProcessedFeature = {} as ProcessedFeature;
            if (feature.geoJSON) {
                geoJSONFeature = geoJSONFormat.readFeature(feature.geoJSON, { dataProjection: props.projection })
            } else if (feature.wkt) {
                geoJSONFeature = wktFormat.readFeature(feature.wkt, { dataProjection: props.projection })
            }
            geoJSONFeature.name = feature.name;
            geoJSONFeatures.push(geoJSONFeature);
        }
        newProcessedLayers.push({...layer, geoJSONFeatures});
    }
    return newProcessedLayers;
});

const options: Vue3OpenlayersGlobalOptions = {
    debug: false,
};

provide("ol-options", options);

const hoveredFeature = ref<Feature | null>(null);
const selectedFeature = ref<Feature | null>(null);
const selectedPosition = ref<number[]>([]);

const mapRef = useTemplateRef<typeof Map.OlMap>("mapRef");
const viewRef = useTemplateRef<typeof Map.OlView>("viewRef");
const clickSelectRef = useTemplateRef<typeof Interactions.OlInteractionSelect>("clickSelectRef");
const drawSourceRef = useTemplateRef<typeof Sources.OlSourceVector>("drawSourceRef");

function featureHover(e: SelectEvent) {
    if (e.selected.length === 1) {
        hoveredFeature.value = e.selected[0];
    } else {
        hoveredFeature.value = null;
    }
    emit('hover', hoveredFeature.value);
}

function featureClick(e: SelectEvent) {
    if (e.selected.length === 1) {
        selectedFeature.value = e.selected[0];
        selectedPosition.value = getCenter(e.selected[0].getGeometry()!.getExtent());
    } else {
        selectedFeature.value = null;
    }
    emit('select', selectedFeature.value);
}

const drawnFeatures = ref<Feature[]>([]);

const drawstart = (event: DrawEvent) => {
    emit('drawstart', geoJSONFormat.writeFeature(event.feature, { dataProjection: props.projection }));
};

const drawend = (event: DrawEvent) => {
    drawnFeatures.value.push(event.feature);
    emit('drawend', geoJSONFormat.writeFeature(event.feature, { dataProjection: props.projection }));
};

const drawOptions: { label: string; value: GeometryType; }[] = [
    { label: "Point", value: "Point" },
    { label: "LineString", value: "LineString" },
    { label: "Polygon", value: "Polygon" },
    { label: "Circle", value: "Circle" }
];
const drawType = ref<GeometryType>('Polygon');

const clearDrawings = () => {
    if (drawSourceRef.value) {
        let s = drawSourceRef.value.source;
        for (const drawnFeature of drawnFeatures.value) {
            s.removeFeature(drawnFeature);
        }
        drawnFeatures.value = [];
    }
}
</script>

<template>
    <div class="kai-map" ref="mapRef">
        <div class="draw-controls flex flex-row gap-2 items-center" v-if="drawEnabled">
            <Label for="type">Geometry Type</Label>
            <SelectInput :options="drawOptions" v-model="drawType" id="type" />
            <Button variant="destructive" @click="clearDrawings">Clear</Button>
        </div>
        <Map.OlMap
            :loadTilesWhileAnimating="true"
            :loadTilesWhileInteracting="true"
            style="height: 100%; width: 100%; min-height: 400px; min-width: 400px;">
            <Map.OlView ref="viewRef" :center="props.center" :rotation="props.rotation" :zoom="zoom" :projection="props.projection" />

            <!-- base maps -->
            <Layers.OlTileLayer title="OpenStreetMap" :visible="true" :displayInLayerSwitcher="false">
                <Sources.OlSourceOsm />
            </Layers.OlTileLayer>

            <!-- layers -->
            <Layers.OlVectorLayer v-for="layer in processedLayers" :title="layer.title" :visible="true">
                <Sources.OlSourceVector
                    :features="(layer.geoJSONFeatures as Feature[])"
                    :format="geoJSONFormat"
                >
                </Sources.OlSourceVector>
                <LayerStyle :mapStyle="layer.mapStyle?.style" :defaultStyle="props.mapStyle.style!" />
            </Layers.OlVectorLayer>

            <Interactions.OlInteractionSelect :condition="pointerMove" @select="featureHover">
                <LayerStyle :mapStyle="props.mapStyle?.hoverStyle" :defaultStyle="props.mapStyle.style!" />
            </Interactions.OlInteractionSelect>

            <Interactions.OlInteractionSelect :condition="click" @select="featureClick" ref="clickSelectRef">
                <LayerStyle :mapStyle="props.mapStyle?.selectStyle" :defaultStyle="props.mapStyle.style!" />
            </Interactions.OlInteractionSelect>

            <Layers.OlVectorLayer :displayInLayerSwitcher="false">
                <Sources.OlSourceVector :projection="props.projection" ref="drawSourceRef">
                    <Interactions.OlInteractionDraw
                        v-if="drawEnabled"
                        :type="drawType"
                        @drawend="drawend"
                        @drawstart="drawstart"
                    >
                        <LayerStyle :mapStyle="props.drawStyle" :defaultStyle="props.mapStyle.style!" />
                    </Interactions.OlInteractionDraw>
                </Sources.OlSourceVector>
                <LayerStyle :mapStyle="props.mapStyle?.style" :defaultStyle="props.mapStyle.style!" />
            </Layers.OlVectorLayer>

            <LayerStyle :mapStyle="props.mapStyle?.style" :defaultStyle="props.mapStyle.style!" />

            <slot></slot>

            <MapControls.OlLayerswitcherControl />
            <MapControls.OlFullscreenControl />
            <MapControls.OlScalelineControl />
            <MapControls.OlZoomsliderControl />

            <Map.OlOverlay v-if="loading" :position="center" positioning="center-center">
                <div class="overlay-content loading">
                    Loading...
                </div>
            </Map.OlOverlay>
        </Map.OlMap>
    </div>
</template>

<style scoped>
.kai-map {
    height: 100%;
    width: 100%;
}
.overlay-content {
    background-color: white;
    border: 1px solid #cccccc;
    padding: 12px;
    border-radius: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>