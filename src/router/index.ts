import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import EditorView from "@/views/EditorView.vue";
import MapView from "@/views/MapView.vue";
import GraphView from "@/views/GraphView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
        },
        {
            path: "/editor",
            name: "editor",
            component: EditorView,
        },
        {
            path: "/map",
            name: "map",
            component: MapView,
        },
        {
            path: "/graph",
            name: "graph",
            component: GraphView,
        },
    ]
});

export default router;
