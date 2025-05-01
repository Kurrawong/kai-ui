<script lang="ts" setup>
import { shallowRef, useTemplateRef, onMounted, onUnmounted, watchEffect, nextTick, watch, computed, type HTMLAttributes } from "vue";
import { Copy, X } from "lucide-vue-next";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { loadWASM } from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";
import { wireTmGrammars } from "monaco-editor-textmate";
import { useMonaco } from "@/composables/useMonaco";
import SelectInput from "@/components/SelectInput.vue";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { languageOptions, setupGrammars, type Language } from ".";
import darkModernTheme from "./themes/dark_modern.json";
import lightModernTheme from "./themes/light_modern.json";

const props = defineProps<{
    languages?: Language[];
    hideToolbar?: boolean;
    options?: Omit<monaco.editor.IStandaloneEditorConstructionOptions, "value" | "language" | "theme">;
    hideTheme?: boolean;
    hideCopyButton?: boolean;
    hideClearButton?: boolean;
    readonly?: boolean;
    class?: HTMLAttributes["class"];
}>();

const themes = [{ label: "Light", value: "light-tm" }, { label: "Dark", value: "dark-tm" }];

const { monacoRef, unload } = useMonaco();

const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);
const containerRef = useTemplateRef("editorContainer");
const cursorPosition = shallowRef({ lineNumber: 1, column: 1 });

const model = defineModel<string>();
const language = defineModel<Language>("language", { default: "sparql" });
const theme = defineModel<"light-tm" | "dark-tm" | "unknown">("theme", { default: "unknown" });

const isEditorReady = computed(() => !!monacoRef.value && !!editor.value);

const filteredLanguageOptions = computed(() => {
    if (props.languages) {
        return languageOptions.filter(l => props.languages?.includes(l.value));
    } else return languageOptions;
});

const defaultOptions: Omit<monaco.editor.IStandaloneEditorConstructionOptions, "value" | "language" | "theme"> = {
    readOnly: !!props.readonly,
    domReadOnly: !!props.readonly,
    automaticLayout: true,
    minimap: {
        renderCharacters: false,
    },
};

async function createEditor() {
    if (!containerRef.value || !monacoRef.value || editor.value) {
        return;
    }

    await loadWASM(onigasmWasm);

    const { registry, grammars } = setupGrammars(monacoRef.value);

    // monaco's built-in themes aren't powerful enough to handle TM tokens
    // https://github.com/Nishkalkashyap/monaco-vscode-textmate-theme-converter#monaco-vscode-textmate-theme-converter
    monacoRef.value.editor.defineTheme("dark-tm", darkModernTheme as monaco.editor.IStandaloneThemeData);
    monacoRef.value.editor.defineTheme("light-tm", lightModernTheme as monaco.editor.IStandaloneThemeData);

    editor.value = monacoRef.value.editor.create(containerRef.value, {...defaultOptions, ...props.options, value: model.value, language: language.value, theme: theme.value});
    
    editor.value.onDidChangeModelContent(() => {
        const value = editor.value!.getValue();
        if (model.value !== value) {
            model.value = value;
        }
    });

    editor.value.onDidChangeCursorPosition(e => {
        cursorPosition.value = e.position;
    });

    await wireTmGrammars(monacoRef.value, registry, grammars, editor.value);
}

function copyText() {
    navigator.clipboard.writeText(editor.value!.getValue());
}

watch(model, (newValue) => {
    if (editor.value!.getValue() !== newValue) {
        editor.value!.setValue(newValue!);
    }
});

watch(language, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        monacoRef.value!.editor.setModelLanguage(editor.value!.getModel()!, newValue as string);
    }
});

watch(theme, (newValue) => {
    monacoRef.value!.editor.setTheme(newValue as string);
});

onMounted(() => {
    const stop = watchEffect(() => {
        if (monacoRef.value && containerRef.value) {
            if (theme.value === "unknown") {
                theme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark-tm" : "light-tm";
            }
            nextTick(() => stop());
            createEditor();
        }
    });
});

onUnmounted(() => {
    if (editor.value) {
        editor.value.getModel()?.dispose();
        editor.value.dispose();
    } else {
        unload();
    }
});
</script>

<template>
    <div :class="cn('border h-[400px] flex flex-col', props.class)">
        <div v-if="!isEditorReady" class="h-full">
            <div v-if="!props.hideToolbar" class="h-10 p-1 flex flex-row items-center gap-1 border-b">
                <Skeleton class="rounded-lg h-full w-26" />
                <Skeleton class="rounded-lg h-full w-20" />
                <Skeleton class="rounded-lg h-full w-8" />
                <Skeleton class="rounded-lg h-4 w-24 ml-auto mr-2" />
                <Skeleton class="rounded-lg h-4 w-32" />
            </div>
            <div class="h-full flex flex-row gap-6 px-6">
                <div class="flex flex-col gap-2">
                    <Skeleton class="rounded size-4" />
                    <Skeleton class="rounded size-4" />
                    <Skeleton class="rounded size-4" />
                    <Skeleton class="rounded size-4" />
                </div>
                <div class="flex flex-col gap-2">
                    <Skeleton class="rounded h-4 w-60" />
                    <Skeleton class="rounded h-4 w-20" />
                    <Skeleton class="rounded h-4 w-32" />
                    <Skeleton class="rounded h-4 w-24" />
                </div>
            </div>
        </div>
        <div v-if="isEditorReady && !props.hideToolbar" :class="`editor-toolbar flex flex-row items-center gap-1 text-foreground border-b p-1 ${theme === 'dark-tm' ? 'dark bg-[#181818]' : 'bg-[#f8f8f8]'}`">
            <SelectInput v-if="!props.languages || props.languages.length > 1" :options="filteredLanguageOptions" v-model="language" placeholder="Language" :dark="theme === 'dark-tm'" />
            <span class="text-xs text-muted-foreground" v-else>{{ languageOptions.find(o => o.value === language)?.label }}</span>
            <SelectInput v-if="!hideTheme" :options="themes" v-model="theme" placeholder="Theme" :dark="theme === 'dark-tm'" />
            <Button v-if="!props.hideCopyButton" variant="outline" size="sm" class="size-8" title="Copy to clipboard" @click="copyText"><Copy class="size-4" /></Button>
            <Button v-if="!props.hideClearButton && !props.readonly" variant="outline" size="sm" class="size-8 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground dark:border-destructive dark:text-destructive dark:hover:bg-destructive dark:hover:text-destructive-foreground" title="Clear content" @click="model = ''"><X class="size-4" /></Button>
            <span class="text-xs text-muted-foreground ml-auto mr-2">Ln {{ cursorPosition.lineNumber }}, Col {{ cursorPosition.column }}</span>
            <span class="text-xs text-muted-foreground">F1 for Command Palette</span>
            <slot name="buttons" />
        </div>
        <div class="editor grow" ref="editorContainer"></div>
    </div>
</template>
