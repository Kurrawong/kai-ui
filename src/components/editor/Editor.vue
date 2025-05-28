<script lang="ts" setup>
import { shallowRef, useTemplateRef, onMounted, onUnmounted, watchEffect, nextTick, watch, computed, type HTMLAttributes, ref } from "vue";
import { Copy, X, Upload, Download, Sun, Moon, SunMoon } from "lucide-vue-next";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { loadWASM } from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";
import { wireTmGrammars } from "monaco-editor-textmate";
import { useMonaco } from "@/composables/useMonaco";
import SelectInput from "@/components/SelectInput.vue";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { languageOptions, setupGrammars } from ".";
import darkModernTheme from "./themes/dark_modern.json";
import lightModernTheme from "./themes/light_modern.json";
import type { Language } from "@/types";

const props = defineProps<{
    languages?: Language[];
    hideToolbar?: boolean;
    options?: Omit<monaco.editor.IStandaloneEditorConstructionOptions, "value" | "language" | "theme">;
    hideLanguage?: boolean;
    hideTheme?: boolean;
    hideCopyButton?: boolean;
    hideClearButton?: boolean;
    hideUploadButton?: boolean;
    hideDownloadButton?: boolean;
    disableDrag?: boolean;
    readonly?: boolean;
    downloadFilename?: string;
    promptFilename?: boolean;
    class?: HTMLAttributes["class"];
}>();

const themeMap = { light: "light-tm", dark: "dark-tm", system: "system" };

const { monacoRef, unload } = useMonaco();

const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);
const containerRef = useTemplateRef("editorContainer");
const cursorPosition = shallowRef({ lineNumber: 1, column: 1 });
const isDownloading = ref(false);
const isDragging = ref(false);

const model = defineModel<string>();
const language = defineModel<Language>("language", { default: "text" });
const theme = defineModel<"light" | "dark" | "system">("theme", { default: "system" });

const isEditorReady = computed(() => !!monacoRef.value && !!editor.value);

const filteredLanguageOptions = computed(() => {
    if (props.languages) {
        return languageOptions.filter(l => props.languages?.includes(l.id as Language));
    } else return languageOptions;
});

const filteredLanguageDropdown = computed(() => {
    return filteredLanguageOptions.value.map(l => {return {value: l.id, label: l.label}}).sort((a, b) => a.label.localeCompare(b.label));
});

const defaultFilename = computed(() => {
    const currentLanguage = filteredLanguageOptions.value.find(l => l.id === language.value)!;
    const filename = props.downloadFilename || "output";
    const extension = currentLanguage.extensions[0] || "txt";
    return `${filename}.${extension}`;
});

const filename = ref(defaultFilename.value);

const defaultOptions: Omit<monaco.editor.IStandaloneEditorConstructionOptions, "value" | "language" | "theme"> = {
    readOnly: !!props.readonly,
    domReadOnly: !!props.readonly,
    automaticLayout: true,
    minimap: { enabled: false },
    stickyScroll: { enabled: false },
    scrollBeyondLastLine: false,
};

async function createEditor() {
    if (!containerRef.value || !monacoRef.value || editor.value) {
        return;
    }
    try {
        await loadWASM(onigasmWasm);
    } catch {
        // Wasm already loaded 
    }
    const { registry, grammars } = setupGrammars(monacoRef.value);

    // monaco's built-in themes aren't powerful enough to handle TextMate tokens
    // https://github.com/Nishkalkashyap/monaco-vscode-textmate-theme-converter#monaco-vscode-textmate-theme-converter
    monacoRef.value.editor.defineTheme("dark-tm", darkModernTheme as monaco.editor.IStandaloneThemeData);
    monacoRef.value.editor.defineTheme("light-tm", lightModernTheme as monaco.editor.IStandaloneThemeData);

    editor.value = monacoRef.value.editor.create(containerRef.value, {
        ...defaultOptions,
        ...props.options,
        value: model.value,
        language: language.value,
        theme: themeMap[theme.value],
    });

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

async function handleFiles(files: FileList) {
    const file = files[0];
    const splitFilename = file.name.split(".")
    const fileExtension = splitFilename[splitFilename.length - 1];
    const index = filteredLanguageOptions.value.findIndex(l => l.extensions.includes(fileExtension));
    
    model.value = await file.text();
    language.value = index >= 0 ? filteredLanguageOptions.value[index].id as Language : "text";
}

async function uploadFile(e: InputEvent) {
    await handleFiles((e.target as HTMLInputElement).files!);
}

async function drop(e: DragEvent) {
    handleFiles(e.dataTransfer!.files);
    isDragging.value = false;
}

function downloadFile() {
    isDownloading.value = true;
    const currentLanguage = filteredLanguageOptions.value.find(l => l.id === language.value)!;
    const blob = new Blob([model.value || ""], { type: currentLanguage.mimetypes[0] });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename.value;
    link.click();
    URL.revokeObjectURL(link.href);

    setTimeout(() => {
        isDownloading.value = false;
    }, 1500);
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
    if (newValue === "system") {
        theme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
        monacoRef.value!.editor.setTheme(themeMap[newValue] as string);
    }
});

watch(defaultFilename, (newValue) => {
    filename.value = newValue;
});

onMounted(() => {
    const stop = watchEffect(() => {
        if (monacoRef.value && containerRef.value) {
            if (theme.value === "system") {
                theme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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
    <div
        :class="cn(`border h-[400px] flex flex-col ${isDragging ? 'border-eye shadow' : ''}`, props.class)"
        @dragenter.prevent="isDragging = true"
        @dragover.prevent="isDragging = true"
        @dragend.prevent="isDragging = false"
        @dragleave.prevent="isDragging = false"
        @drop.stop.prevent="drop"
    >
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
        <div v-if="isEditorReady && !props.hideToolbar" :class="`editor-toolbar flex flex-row items-center gap-1 text-foreground border-b p-1 ${theme === 'dark' ? 'dark bg-[#181818]' : 'bg-[#f8f8f8]'}`">
            <SelectInput
                v-if="!props.hideLanguage && filteredLanguageOptions.length > 1"
                :options="filteredLanguageDropdown"
                v-model="language"
                placeholder="Language"
                :dark="theme === 'dark'"
            />
            <span class="text-xs text-muted-foreground" v-else>{{ languageOptions.find(o => o.id === language)?.label }}</span>
            <Button
                v-if="!props.hideTheme"
                variant="outline"
                size="sm"
                class="size-8"
                :title="theme !== 'system' ? theme === 'dark' ? 'Set to light theme' : 'Set to dark theme' : undefined"
                @click="theme !== 'system' ? theme === 'dark' ? theme = 'light' : theme = 'dark' : undefined"
            >
                <SunMoon v-if="theme === 'system'" class="size-4" />
                <Sun v-else-if="theme === 'light'" class="size-4" />
                <Moon v-else="theme === 'dark'" class="size-4" />
            </Button>
            <Button v-if="!props.hideUploadButton && !props.readonly" variant="outline" size="sm" as-child>
                <Label for="upload" class="font-normal">Upload
                    <Upload class="size-4" />
                    <Input id="upload" type="file" class="hidden" @change="uploadFile" :accept="filteredLanguageOptions.map(l => l.extensions).flat().map(ext => `.${ext}`).join(',')" />
                </Label>
            </Button>
            <Button v-if="!props.hideCopyButton" variant="outline" size="sm" class="size-8" title="Copy to clipboard"
                @click="copyText">
                <Copy class="size-4" />
            </Button>
            <template v-if="!props.hideDownloadButton">
                <Popover v-if="props.promptFilename" class="sm:max-w-[600px]">
                    <PopoverTrigger>
                        <Button variant="outline" size="sm" class="size-8" title="Download file" :disabled="isDownloading">
                            <Download class="size-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent class="flex flex-col gap-2">
                        <Label>Filename</Label>
                        <Input v-model="filename" placeholder="Download filename" />
                        <div class="flex flex-row gap-2 items-center justify-end">
                            <Button variant="default" @click="downloadFile" :disabled="isDownloading">
                                Download <Download class="size-4" />
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Button v-else variant="outline" size="sm" class="size-8" title="Download file" @click="downloadFile" :disabled="isDownloading">
                    <Download class="size-4" />
                </Button>
            </template>
            <Button
                v-if="!props.hideClearButton && !props.readonly"
                variant="outline"
                size="sm"
                class="size-8 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground dark:border-destructive dark:text-destructive dark:hover:bg-destructive dark:hover:text-destructive-foreground"
                title="Clear content"
                @click="model = ''"
            >
                <X class="size-4" />
            </Button>
            <slot name="toolbar-left" />

            <span v-if="!disableDrag && !props.hideUploadButton && !props.readonly" class="text-xs text-muted-foreground">Drag and drop</span>

            <span class="text-xs text-muted-foreground ml-auto mr-2">Ln {{ cursorPosition.lineNumber }}, Col {{ cursorPosition.column }}</span>
            <span class="text-xs text-muted-foreground">F1 for Command Palette</span>
            <slot name="toolbar-right" />
        </div>
        <div class="editor grow" ref="editorContainer"></div>
    </div>
</template>
