<script lang="ts" setup>
import { ref, provide, watch } from "vue";
import { Map, Layers, Sources, Styles, MapControls, Interactions, type Vue3OpenlayersGlobalOptions } from "vue3-openlayers";
import { GeoJSON, WKT } from "ol/format";
import { bbox } from "ol/loadingstrategy";
import { click } from "ol/events/condition";
import { getCenter } from "ol/extent";
import { SelectEvent } from "ol/interaction/Select";
import Style from "ol/style/Style";
import { getArea } from "ol/sphere";
import { drawStyle } from "./mapstyles.ts";
import 'vue3-openlayers/dist/vue3-openlayers.css';
import MapTooltip from "./MapTooltip.vue";
import type { Extent } from "ol/extent";
import type { ProjectionLike } from "ol/proj";
import type { Type } from "ol/geom/Geometry";
interface Props {
    center?: number[];
    zoom?: number;
    rotation?: number;
    projection?: ProjectionLike;
    focusSourceRef?: any;
    layers?: any[];
    loading?: boolean;
    drawEnabled?: boolean;
    clearDrawingsOnLayerChange?: boolean;
    fitAddedLayersToExtent?: boolean;
    animationDuration?: number | undefined;
    enableCustomMapControls?: boolean;
    tooltipIriQueryString?: string;
}

const props = withDefaults(defineProps<Props>(), {
    center: () => [133.7751, -25.2744],
    zoom: 4,
    rotation: 0,
    projection: 'EPSG:4326',
    focusSourceRef: undefined,
    layers: () => [],
    loading: false,
    drawEnabled: false,
    clearDrawingsOnLayerChange: false,
    fitAddedLayersToExtent: false,
    animationDuration: undefined,
    enableCustomMapControls: false,
    // TODO: ideally, we just add a slot to the tooltip for customization
    tooltipIriQueryString: undefined
});
const emit = defineEmits(['drawstart', 'drawend', 'select', 'hover', 'change:zoom', 'change:center', 'change:rotation'])

const loading = ref(props.loading);
watch(() => props.loading, (newVal) => { loading.value = newVal; }, { immediate:true });

const zoom = ref(props.zoom);
watch(() => props.zoom, (newVal) => { zoom.value = newVal; }, { immediate:true });
const center = ref(props.center);
watch(() => props.center, (newVal) => { center.value = newVal; }, { immediate:true });
const rotation = ref(props.rotation);
watch(() => props.rotation, (newVal) => { rotation.value = newVal; }, { immediate:true });

const currentZoom = ref(zoom.value);
const currentCenter = ref(center.value);
const currentRotation = ref(rotation.value);
function resolutionChanged(event: any) {
  currentZoom.value = event.target.getZoom();
  emit('change:zoom', currentZoom.value);
}
function centerChanged(event: any) {
  currentCenter.value = event.target.getCenter();
  emit('change:center', currentCenter.value);
}
function rotationChanged(event: any) {
  currentRotation.value = event.target.getRotation();
  emit('change:rotation', currentRotation.value);
}

const mapRef = ref<InstanceType<typeof Map.OlMap> | null>(null);
const viewRef = ref<InstanceType<typeof Map.OlView> | null>(null);
const layersRef = ref<Array<InstanceType<typeof Layers.OlVectorLayer>>| null>(null);
const layerSourcesRef = ref<Array<InstanceType<typeof Sources.OlSourceVector>>| null>(null);
const clickSelectRef = ref<InstanceType<typeof Interactions.OlInteractionSelect> | null>(null);
const drawSourceRef = ref<InstanceType<typeof Sources.OlSourceVector> | null>(null);

const options: Vue3OpenlayersGlobalOptions = {
    debug: false,
};

provide("ol-options", options);

const selectedFeature = ref<any | undefined>(undefined);
const selectedFeatures = ref<Array<any>>([]);
const selectedPosition = ref<number[] | undefined>(undefined);

function getFeatureCenter(feature: any) {
  if (feature && feature.getGeometry) {
    return getCenter(feature.getGeometry()!.getExtent());
  }
  return undefined;
}

function selectFeature(feature: any, fitToFeatureExtent: boolean) {
  selectedFeatures.value = [];
  selectedFeature.value = feature;
  let selection = getFeatureCenter(feature);
  selectedPosition.value = selection;
  if (clickSelectRef.value) {
    clickSelectRef.value.select.getFeatures().clear();
    clickSelectRef.value.select.getFeatures().push(feature);
  }
  if (fitToFeatureExtent && feature.getGeometry()) {
    const extent = feature.getGeometry()!.getExtent();
    fitToExtent(extent);
  }
  if ((selectedFeature.value as any)?.name) {
    emit('select', selectedFeature.value);
  }
}

function featureClick(e: SelectEvent) {
    let selection = undefined;

    if (e.selected.length > 0) {
        // depending on props.clickThroughOverlappingFeatures, we handle 1 selected feature, or all of the features at the clicked location
        // 1. handle the feature on top
        selectedFeature.value = e.selected[0];
        selection = getFeatureCenter(e.selected[0]);
        selectedPosition.value = selection;
        // 2. handle all features at the clicked location
        let clickLocation = e.mapBrowserEvent.pixel;

        let overlappingFeatures: any[] = [];
        if (mapRef.value) {
          mapRef.value.forEachFeatureAtPixel(clickLocation, function (feature: any) {
            if (feature.name) {
              overlappingFeatures.push(feature);
            }
          });
        }
        selectedFeatures.value = overlappingFeatures;
    } else {
        selectedFeature.value = undefined;
        selectedFeatures.value = [];
    }
    if ((selectedFeature.value as any)?.name) {
      emit('select', selectedFeature.value);
    }
}

function escapeOverlay(selectedFeatureIndex: number) {
    if (clickSelectRef.value && selectedFeature.value) {
        clickSelectRef.value.select.getFeatures().clear();
        selectedFeature.value = undefined;
    }
    if (selectedFeatureIndex > -1) {
      selectedFeatures.value.splice(selectedFeatureIndex, 1);
    } else {
      selectedFeatures.value = [];
    }
}

const drawEnabled = ref(props.drawEnabled);
const drawType = ref<Type>('Polygon');
watch(() => props.drawEnabled, (newVal) => { drawEnabled.value = newVal; }, { immediate:true });

const drawModeEnabled = ref(drawEnabled.value);

function enableDrawMode () {
  drawModeEnabled.value = !drawModeEnabled.value;
}

const drawnFeatures = ref<any[]>([]);

const drawstart = (event: any) => {
    emit('drawstart', geoJSONFormat.writeFeature(event.feature, { dataProjection: props.projection }));
};

const drawend = (event: any) => {
    const geoJSON = geoJSONFormat.writeFeature(event.feature, { dataProjection: props.projection })
    const wkt = wktFormat.writeFeature(event.feature, { dataProjection: props.projection })
    drawnFeatures.value.push(event.feature);
    emit('drawend', { geoJSON, wkt });
    drawModeEnabled.value = false;
};

const clearDrawings = () => {
    if (drawSourceRef.value) {
        let s = drawSourceRef.value.source;
        for (const drawnFeature of drawnFeatures.value) {
            s.removeFeature(drawnFeature);
        }
    }
    drawnFeatures.value = [];
}

const clearAll = () => {
    processedLayers.value = [];
    if (drawSourceRef.value) {
        let s = drawSourceRef.value.source;
        for (const drawnFeature of drawnFeatures.value) {
            s.removeFeature(drawnFeature);
        }
    }
    drawnFeatures.value = [];
    selectedFeatures.value = [];
    escapeOverlay(-1);
};

const clickThroughModeEnabled = ref<Boolean>(false);

function toggleClickThroughMode() {
  clickThroughModeEnabled.value = !clickThroughModeEnabled.value;
}

let processedLayers = ref<any[]>([]);
const wktFormat = new WKT();
const geoJSONFormat = new GeoJSON();

const processLayers = (newLayers: any[]) => {
  let newProcessedLayers = [];
  for (const layer of newLayers) {
      // check all features for WKT geometry and translate it to GeoJSON
      const features = layer.features;
      const geoJSONFeatures = [];
      for (const feature of features) {
          let geoJSONFeature : any = {};
          if (feature.geoJSON) {
              geoJSONFeature = geoJSONFormat.readFeature(feature.geoJSON, { dataProjection: props.projection })
          } else if (feature.wkt) {
              geoJSONFeature = wktFormat.readFeature(feature.wkt, { dataProjection: props.projection })
          }
          geoJSONFeature.name = feature.name;
          geoJSONFeature.data = feature.data;
          geoJSONFeatures.push(geoJSONFeature);
      }
      //sort the features by area large to small, which makes clicking around easier for overlapping areas
      layer.geoJSONFeatures = geoJSONFeatures.sort((a, b) => {
        let extentA = a.getGeometry();
        let extentB = b.getGeometry();
        let areaA = getArea(extentA);
        let areaB = getArea(extentB);
        return areaB - areaA;
      });

      newProcessedLayers.push(layer);
  }
  processedLayers.value = newProcessedLayers;
};

const fitToExtent = (extent: Extent) => {
  if (viewRef.value && extent && extent[0] !== Infinity) {
    viewRef.value.view.fit(extent, {
        maxZoom: 20,
        padding: [32, 32, 32, 32],
        duration: props.animationDuration
    });
  }
};

// Fits the view to the extent of the last added layer
const fitToLayerExtent = () => {
  setTimeout(() => {
    const layersArray = layerSourcesRef.value;
    if (layersArray?.length) {
      const extent = layersArray[layersArray.length - 1].source.getExtent();
      fitToExtent(extent);
    }
  }, 0);
};

watch(
    () => props.layers,
    (newVal) => {
        processLayers(newVal);
        if (props.fitAddedLayersToExtent) {
          fitToLayerExtent();
        }
        if (props.clearDrawingsOnLayerChange) {
          clearDrawings();
        }
        escapeOverlay(-1);
    },
    {
        immediate: true
    }
);

// this ensures that when the tooltip for an underlying feature is clicked, the feature is brought to the foreground of the map
function overrideStyleFunction(feature: any, currentStyle: any) {
  if (feature.data?.iri && feature.data?.iri === selectedFeature.value?.data?.iri) {
    return new Style({
      fill: currentStyle.fill_,
      stroke: currentStyle.stroke_,
      image: currentStyle.image_,
      // geometryFunction: currentStyle.geometryFunction_,
      zIndex: 1
    });
  }
  return currentStyle
}
</script>

<template>
    <div class="kai-map">
        <Map.OlMap ref="mapRef"
            :loadTilesWhileAnimating="true"
            :loadTilesWhileInteracting="true"
            style="height: 100%; width: 100%; min-height: 400px; min-width: 400px;">
            <Map.OlView ref="viewRef"
              :projection="props.projection"
              :center="center"
              :rotation="rotation"
              :zoom="zoom"
              @change:center="centerChanged"
              @change:resolution="resolutionChanged"
              @change:rotation="rotationChanged"
              />

            <!-- base maps -->
            <Layers.OlTileLayer title="OpenStreetMap" :visible="true" :displayInLayerSwitcher="false">
                <Sources.OlSourceOsm />
            </Layers.OlTileLayer>

            <!-- layers -->
            <Layers.OlVectorLayer v-for="layer in processedLayers" :title="layer.title" :visible="true" ref="layersRef">
                <Sources.OlSourceVector
                    :features="layer.geoJSONFeatures"
                    :strategy="bbox"
                    ref="layerSourcesRef"
                >
                </Sources.OlSourceVector>
                <Styles.OlStyle>
                    <Styles.OlStyleStroke :color="layer.strokeColor || drawStyle.strokeColor" :width="layer.strokeWidth || drawStyle.strokeWidth"></Styles.OlStyleStroke>
                    <Styles.OlStyleFill :color="layer.fillColor || drawStyle.fillColor"></Styles.OlStyleFill>
                    <Styles.OlStyleCircle :radius="layer.radius || drawStyle.radius">
                      <Styles.OlStyleFill :color="layer.circleColor || drawStyle.circleColor"></Styles.OlStyleFill>
                    </Styles.OlStyleCircle>
                </Styles.OlStyle>
            </Layers.OlVectorLayer>

            <Layers.OlVectorLayer :displayInLayerSwitcher="false">
                <Sources.OlSourceVector :projection="props.projection" ref="drawSourceRef">
                    <Interactions.OlInteractionDraw
                        v-if="drawModeEnabled"
                        :type="drawType"
                        @drawend="drawend"
                        @drawstart="drawstart"
                    >
                        <Styles.OlStyle>
                            <Styles.OlStyleStroke color="blue" :width="2"></Styles.OlStyleStroke>
                            <Styles.OlStyleFill color="rgba(255, 255, 0, 0.4)"></Styles.OlStyleFill>
                            <Styles.OlStyleCircle :radius="5">
                                <Styles.OlStyleFill color="#00dd11" />
                                <Styles.OlStyleStroke color="blue" :width="2" />
                            </Styles.OlStyleCircle>
                        </Styles.OlStyle>
                    </Interactions.OlInteractionDraw>
                </Sources.OlSourceVector>
            </Layers.OlVectorLayer>

            <Interactions.OlInteractionSelect :condition="click" @select="featureClick" ref="clickSelectRef">
                <Styles.OlStyle :overrideStyleFunction="overrideStyleFunction">
                    <Styles.OlStyleStroke color="blue" :width="2"></Styles.OlStyleStroke>
                    <Styles.OlStyleFill color="rgba(0, 190, 110, 0.4)"></Styles.OlStyleFill>
                    <Styles.OlStyleCircle :radius="5">
                        <Styles.OlStyleFill color="#00dd11" />
                        <Styles.OlStyleStroke color="blue" :width="2" />
                    </Styles.OlStyleCircle>
                </Styles.OlStyle>
            </Interactions.OlInteractionSelect>

            <MapControls.OlLayerswitcherControl />
            <MapControls.OlFullscreenControl />
            <MapControls.OlScalelineControl />
            <MapControls.OlZoomsliderControl />

            <div class="custom-map-controls ol-unselectable ol-control ol-bar ol-group flex flex-row"
                v-if="props.enableCustomMapControls">
              <button type="button" name="drawButton" title="Draw an area on the map" :className="drawModeEnabled ? 'active' : ''" @click="enableDrawMode">&#9186;</button>
              <button type="button" name="clearDrawingsButton" title="Clear all drawn features from the map" @click="clearDrawings">&#9003;</button>
              <button v-if="clickThroughModeEnabled" type="button" class="active" name="clickThroughButton" title="Disable to only select top feature on click" @click="toggleClickThroughMode">&DoubleDownArrow;</button>
              <button v-else type="button" name="clickThroughButton" title="Enable to select all overlapping features on click" @click="toggleClickThroughMode">&DoubleDownArrow;</button>
              <button type="button" name="clearButton" title="Clear all features from the map" @click="clearAll">&#10060;</button>
            </div>

            <Map.OlOverlay v-if="loading" :position="center" positioning="center-center">
                <div class="overlay-content loading">
                    Loading...
                </div>
            </Map.OlOverlay>


            <Map.OlOverlay v-if="clickThroughModeEnabled && selectedFeatures && selectedFeatures.length"
              v-for="(clickedFeature, index) in selectedFeatures"
              :position="getFeatureCenter(clickedFeature)"
              positioning="bottom-center"
              :stopEvent="true">
              <template v-slot="">
                <MapTooltip
                  :selectedFeature="clickedFeature"
                  :queryString="props.tooltipIriQueryString"
                  @select="selectFeature"
                  @deselect="() => { escapeOverlay(index) }"
                />
              </template>
            </Map.OlOverlay>

            <Map.OlOverlay v-else-if="selectedFeature && selectedFeature.name" :position="selectedPosition || center" positioning="bottom-center" :stopEvent="true">
              <template v-slot="">
                <MapTooltip
                  :selectedFeature="selectedFeature"
                  @select="selectFeature"
                  @deselect="escapeOverlay(-1)"
                />
              </template>
            </Map.OlOverlay>
        </Map.OlMap>
    </div>
</template>

<style scoped>
.kai-map {
    position: relative;
    min-height: 400px;
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
.custom-map-controls {
  z-index: 1;
}
button.active {
  background-color: lightgrey;
}
</style>
