<script lang="ts" setup>
import { RouterView, RouterLink, useRoute } from "vue-router";
import { Sun, Moon, SunMoon } from "lucide-vue-next";
import { Button } from "./components/ui/button";
import { useColorMode } from "@vueuse/core";

const route = useRoute();
const colorMode = useColorMode();

const links = [
    {
        title: "Home",
        path: "/",
    },
    {
        title: "Editor",
        path: "/editor",
    },
    {
        title: "Map",
        path: "/map",
    },
    {
        title: "Graph",
        path: "/graph",
    },
];
</script>

<template>
    <div class="min-h-dvh">
        <nav class="px-4 flex flex-row gap-2 items-center">
            <Button v-for="link in links" :variant="route.path === link.path ? 'default' : 'secondary'" as-child>
                <RouterLink :to="link.path">{{ link.title }}</RouterLink>
            </Button>
            <Button size="icon" variant="ghost" class="ml-auto" @click="colorMode = (colorMode === 'dark' ? 'light' : 'dark')">
                <Moon v-if="colorMode === 'light'" class="size-4" />
                <Sun v-else-if="colorMode === 'dark'" class="size-4" />
                <SunMoon v-else class="size-4" />
            </Button>
        </nav>
        <div class="p-2">
            <RouterView></RouterView>
        </div>
    </div>
</template>
