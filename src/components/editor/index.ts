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
import type { Language } from "@/types";

export { default as Editor } from "./Editor.vue";

export const languageOptions: {
    label: string;
    value: Language;
    extension: string;
    mimetype: string;
}[] = [
    {
        label: "CSS",
        value: "css",
        extension: "css",
        mimetype: "text/css",
    },
    {
        label: "HTML",
        value: "html",
        extension: "html",
        mimetype: "text/html",
    },
    {
        label: "JavaScript",
        value: "javascript",
        extension: "js",
        mimetype: "text/javascript",
    },
    {
        label: "JSON",
        value: "json",
        extension: "json",
        mimetype: "application/json",
    },
    {
        label: "N-Quads",
        value: "n-quads",
        extension: "nq",
        mimetype: "application/n-quads",
    },
    {
        label: "N-Triples",
        value: "n-triples",
        extension: "nt",
        mimetype: "application/n-triples",
    },
    {
        label: "Python",
        value: "python",
        extension: "py",
        mimetype: "application/python",
    },
    {
        label: "SHACL",
        value: "shacl",
        extension: "shacl",
        mimetype: "application/shacl",
    },
    {
        label: "SPARQL",
        value: "sparql",
        extension: "rq",
        mimetype: "application/sparql",
    },
    {
        label: "TriG",
        value: "trig",
        extension: "trig",
        mimetype: "application/trig",
    },
    {
        label: "Turtle",
        value: "turtle",
        extension: "ttl",
        mimetype: "text/turtle",
    },
    {
        label: "TypeScript",
        value: "typescript",
        extension: "ts",
        mimetype: "text/typescript",
    },
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

    // overrides default languages from monaco if they conflict with syntax highlighting
    const overrideLanguages = ["sparql"];
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
