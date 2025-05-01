import { onMounted, shallowRef, ref } from "vue";
import loader from "@monaco-editor/loader";
import { type Monaco } from "@monaco-editor/loader";

export function useMonaco() {
    const monacoRef = shallowRef<Monaco | null>(loader.__getMonacoInstance());
    const loadError = ref<boolean>(false);
    let promise: ReturnType<(typeof loader)["init"]>;

    onMounted(() => {
        if (monacoRef.value) return;

        promise = loader.init();
        promise.then(monacoInstance => {
            monacoRef.value = monacoInstance;
        }).catch(error => {
            if (error?.type !== "cancelation") {
                loadError.value = true;
                console.error("Monaco initialization error:", error);
            }
        });
    });

    const unload = () => promise?.cancel();

    return {
        monacoRef,
        unload,
        loadError,
    }
}