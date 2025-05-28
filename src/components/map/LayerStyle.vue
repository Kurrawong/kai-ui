<script lang="ts" setup>
import { Styles } from "vue3-openlayers";
import type { MapStyleOptions } from "@/types";

const props = defineProps<{
    mapStyle?: MapStyleOptions;
    defaultStyle: MapStyleOptions;
}>();
</script>

<template>
    <Styles.OlStyle>
        <Styles.OlStyleStroke
            :color="props.mapStyle?.strokeColor || props.defaultStyle.strokeColor"
            :width="props.mapStyle?.strokeWidth || props.defaultStyle.strokeWidth"
        ></Styles.OlStyleStroke>
        <Styles.OlStyleFill :color="props.mapStyle?.fillColor || props.defaultStyle.fillColor"></Styles.OlStyleFill>
        <Styles.OlStyleCircle :radius="props.mapStyle?.pointRadius || props.defaultStyle.pointRadius!">
            <Styles.OlStyleFill :color="props.mapStyle?.pointFillColor || props.defaultStyle.pointFillColor"></Styles.OlStyleFill>
            <Styles.OlStyleStroke
                :color="props.mapStyle?.pointStrokeColor || props.defaultStyle.pointStrokeColor"
                :width="props.mapStyle?.pointStrokeWidth || props.defaultStyle.pointStrokeWidth"
            ></Styles.OlStyleStroke>
        </Styles.OlStyleCircle>
    </Styles.OlStyle>
</template>