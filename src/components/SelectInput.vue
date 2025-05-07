<script lang="ts" setup>
import { HTMLAttributes } from "vue";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils"

const props = defineProps<{
    options: {label?: string; value: string;}[];
    placeholder?: string;
    dark?: boolean;
    class?: HTMLAttributes["class"];
}>();

const emit = defineEmits<{
    select: [value: string];
}>();

const model = defineModel<string>();
</script>

<template>
    <Select v-model="model" @update:modelValue="emit('select', $event as string)">
        <SelectTrigger size="sm" :class="cn('bg-background cursor-pointer hover:bg-accent hover:text-accent-foreground', props.class)">
            <SelectValue :placeholder="props.placeholder" />
        </SelectTrigger>
        <SelectContent :class="props.dark ? 'dark' : ''">
            <SelectGroup>
                <SelectItem v-for="option in props.options" :value="option.value" class="cursor-pointer">
                    {{ option.label || option.value }}
                </SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>
</template>