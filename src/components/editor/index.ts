import { type Monaco } from "@monaco-editor/loader";
import { Registry } from "monaco-textmate";
import turtleGrammar from "./grammars/turtle.tmLanguage.json";
import trigGrammar from "./grammars/trig.tmLanguage.json";
import sparqlGrammar from "./grammars/sparql.tmLanguage.json";
import shaclGrammar from "./grammars/shacl.tmLanguage.json";
import jsGrammar from "./grammars/JavaScript.tmLanguage.json";
import cssGrammar from "./grammars/css.tmLanguage.json";
import htmlGrammar from "./grammars/html.tmLanguage.json";
import tsGrammar from "./grammars/TypeScript.tmLanguage.json";
import pythonGrammar from "./grammars/MagicPython.tmLanguage.json";
import ntGrammar from "./grammars/n-triples.tmLanguage.json";
import nqGrammar from "./grammars/n-quads.tmLanguage.json";

export { default as Editor } from "./Editor.vue";

export type Language = "css" | "html" | "javascript" | "json" | "n-quads" | "n-triples" | "python" | "shacl" | "sparql" | "trig" | "turtle" | "typescript";

export const languageOptions: { label: string; value: Language; }[] = [
    { label: "CSS", value: "css" },
    { label: "HTML", value: "html" },
    { label: "JavaScript", value: "javascript" },
    { label: "JSON", value: "json" },
    { label: "N-Quads", value: "n-quads" },
    { label: "N-Triples", value: "n-triples" },
    { label: "Python", value: "python" },
    { label: "SHACL", value: "shacl" },
    { label: "SPARQL", value: "sparql" },
    { label: "TriG", value: "trig" },
    { label: "Turtle", value: "turtle" },
    { label: "TypeScript", value: "typescript" },
    // { label: "XML", value: "xml" },
    // { label: "YAML", value: "yaml" },
];

export const grammarDefs: {
    id: Language;
    scopeName: string;
    default: boolean;
    content: any;
}[] = [
    // stardog https://github.com/stardog-union/stardog-vsc/blob/master/stardog-rdf-grammars/syntaxes
    {
        id: "turtle",
        scopeName: "source.turtle",
        default: false,
        content: turtleGrammar,
    },
    {
        id: "trig",
        scopeName: "source.trig",
        default: false,
        content: trigGrammar,
    },
    {
        id: "sparql",
        scopeName: "source.sparql",
        default: false,
        content: sparqlGrammar,
    },
    {
        id: "shacl",
        scopeName: "source.shacl",
        default: false,
        content: shaclGrammar,
    },
    // rdfox https://github.com/OxfordSemantic/vscode-rdfox-rdf/tree/main/syntaxes
    {
        id: "n-triples",
        scopeName: "source.n-triples",
        default: false,
        content: ntGrammar,
    },
    {
        id: "n-quads",
        scopeName: "source.n-quads",
        default: false,
        content: nqGrammar,
    },
    // vscode https://github.com/microsoft/vscode/blob/main/extensions
    {
        id: "javascript",
        scopeName: "source.js",
        default: true,
        content: jsGrammar,
    },
    {
        id: "css",
        scopeName: "source.css",
        default: true,
        content: cssGrammar,
    },
    {
        id: "html",
        scopeName: "text.html.basic",
        default: true,
        content: htmlGrammar,
    },
    {
        id: "typescript",
        scopeName: "source.ts",
        default: true,
        content: tsGrammar,
    },
    {
        id: "python",
        scopeName: "source.python",
        default: true,
        content: pythonGrammar,
    },
];

export function setupGrammars(monacoInstance: Monaco): { registry: Registry, grammars: Map<string, string> } {
    const registry = new Registry({
        // @ts-ignore
        getGrammarDefinition: async (scopeName) => {
            const matchedGrammar = grammarDefs.find(g => g.scopeName === scopeName);
            if (matchedGrammar) {
                return {
                    format: "json",
                    content: matchedGrammar.content,
                }
            } else return null;
        },
    });

    const overrideLanguages = [
        "sparql",
    ];

    monacoInstance.languages.getLanguages().forEach(lang => {
        if (overrideLanguages.includes(lang.id)) {
            // @ts-ignore
            lang.loader = function () {
                return { then: function () {} };
            };
        }
    });

    grammarDefs.filter(g => !g.default).forEach(g => {
        monacoInstance.languages.register({ id: g.id });
    });

    
    const grammars = new Map<string, string>();

    grammarDefs.forEach(g => {
        grammars.set(g.id, g.scopeName);
    });

    return { registry, grammars };
};
