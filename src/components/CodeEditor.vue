<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import * as monaco from "monaco-editor";

const props = defineProps<{
    language: string;
}>();

const model = defineModel<string>();

// const emit = defineEmits<{

// }>();

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    value: model.value,
    language: props.language,
    automaticLayout: true,
};

let editor: monaco.editor.IStandaloneCodeEditor;
const editorRef = ref<InstanceType<typeof HTMLElement> | null>(null);
// const viewState = ref<monaco.editor.ICodeEditorViewState | null>(null);

watch(model, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        // const selection = editor.getSelections();
        
        const viewState = editor.saveViewState();
        // editor.setValue(newValue);
        const range = editor.getModel()?.getFullModelRange();
        // @ts-ignore
        editor.executeEdits("source", [{ range: range, text: newValue! }]);
        editor.restoreViewState(viewState)
    }
});

onMounted(() => {
    if (editorRef.value) {
        editor = monaco.editor.create(editorRef.value, monacoOptions);
        editor.onDidChangeModelContent(() => {
            const value = editor.getValue();
            if (model.value !== value) {
                model.value = value;
            }
        });
    }
});

onBeforeUnmount(() => {
    editor.dispose();
});
</script>

<template>
    <div class="rdf-editor" ref="editorRef" />
</template>

<style scoped>
.rdf-editor {
    height: 400px;
}
</style>