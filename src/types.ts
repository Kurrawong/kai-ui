import { languageOptionsUntyped } from "@/components/editor";

export type Language = (typeof languageOptionsUntyped)[number]["id"];
