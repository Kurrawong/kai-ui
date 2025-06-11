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
import javaGrammar from "./grammars/java.tmLanguage.json";
import xmlGrammar from "./grammars/xml.tmLanguage.json";
import n3Grammar from "./grammars/n3.tmLanguage.json";
// import markdownGrammar from "./grammars/markdown.tmLanguage.json";
// import yamlGrammar from "./grammars/yaml.tmLanguage.json";

export { default as Editor } from "./Editor.vue";

type Grammar = {
    id: string;
    label: string;
    extensions: string[];
    mimetypes: string[];
    default: boolean;
    scopeName?: string;
    grammar?: any;
};

export const languageOptionsUntyped = [
    // custom
    {
        // requires turtle
        id: "n3",
        label: "N3",
        extensions: ["n3"],
        mimetypes: ["text/n3"],
        default: false,
        scopeName: "source.n3",
        grammar: n3Grammar,
    },
    // stardog https://github.com/stardog-union/stardog-vsc/blob/master/stardog-rdf-grammars/syntaxes
    {
        id: "turtle",
        label: "Turtle",
        extensions: ["ttl"],
        mimetypes: ["text/turtle"],
        default: false,
        scopeName: "source.turtle",
        grammar: turtleGrammar,
    },
    {
        // requires turtle
        id: "trig",
        label: "TriG",
        extensions: ["trig"],
        mimetypes: ["application/trig"],
        default: false,
        scopeName: "source.trig",
        grammar: trigGrammar,
    },
    {
        // requires turtle
        id: "sparql",
        label: "SPARQL",
        extensions: ["sparql", "rq"],
        mimetypes: ["application/sparql"],
        default: false,
        scopeName: "source.sparql",
        grammar: sparqlGrammar,
    },
    {
        // requires turtle
        id: "shacl",
        label: "SHACL",
        extensions: ["shacl"],
        mimetypes: ["application/shacl"],
        default: false,
        scopeName: "source.shacl",
        grammar: shaclGrammar,
    },
    // rdfox https://github.com/OxfordSemantic/vscode-rdfox-rdf/tree/main/syntaxes
    {
        // modified to use turtle grammar, requires turtle
        id: "n-triples",
        label: "N-Triples",
        extensions: ["nt"],
        mimetypes: ["application/n-triples"],
        default: false,
        scopeName: "source.n-triples",
        grammar: ntGrammar,
    },
    {
        // modified to use turtle grammar, requires turtle
        id: "n-quads",
        label: "N-Quads",
        extensions: ["nq"],
        mimetypes: ["application/n-quads"],
        default: false,
        scopeName: "source.n-quads",
        grammar: nqGrammar,
    },
    // vscode https://github.com/microsoft/vscode/blob/main/extensions
    {
        id: "javascript",
        label: "JavaScript",
        extensions: ["js"],
        mimetypes: ["text/javascript"],
        default: true,
        scopeName: "source.js",
        grammar: jsGrammar,
    },
    {
        id: "css",
        label: "CSS",
        extensions: ["css"],
        mimetypes: ["text/css"],
        default: true,
        scopeName: "source.css",
        grammar: cssGrammar,
    },
    {
        id: "html",
        label: "HTML",
        extensions: ["html"],
        mimetypes: ["text/html"],
        default: true,
        scopeName: "text.html.basic",
        grammar: htmlGrammar,
    },
    {
        id: "typescript",
        label: "TypeScript",
        extensions: ["ts"],
        mimetypes: ["text/typescript"],
        default: true,
        scopeName: "source.ts",
        grammar: tsGrammar,
    },
    {
        id: "python",
        label: "Python",
        extensions: ["py"],
        mimetypes: ["application/python"],
        default: true,
        scopeName: "source.python",
        grammar: pythonGrammar,
    },
    {
        id: "java",
        label: "Java",
        extensions: ["java"],
        mimetypes: ["application/java"],
        default: true,
        scopeName: "source.java",
        grammar: javaGrammar,
    },
    {
        // requires java
        id: "xml",
        label: "XML",
        extensions: ["xml", "rdf"],
        mimetypes: ["application/xml", "application/rdf+xml"],
        default: true,
        scopeName: "source.xml",
        grammar: xmlGrammar,
    },
    {
        id: "markdown",
        label: "Markdown",
        extensions: ["md"],
        mimetypes: ["text/markdown"],
        default: true,
        // scopeName: "text.html.markdown",
        // grammar: markdownGrammar,
    },
    {
        id: "yaml",
        label: "YAML",
        extensions: ["yaml", "yml"],
        mimetypes: ["application/yaml"],
        default: true,
        // scopeName: "source.yaml",
        // grammar: yamlGrammar,
    },
    {
        id: "json",
        label: "JSON",
        extensions: ["json", "jsonld"],
        mimetypes: ["application/json", "application/ld+json"],
        default: true,
    },
    {
        id: "text",
        label: "Text",
        extensions: ["txt"],
        mimetypes: ["text/plain"],
        default: true,
    },
] as const;

export const languageOptions = languageOptionsUntyped as unknown as Grammar[];

export function setupGrammars(monacoInstance: Monaco): { registry: Registry, grammars: Map<string, string> } {
    const registry = new Registry({
        // @ts-ignore
        getGrammarDefinition: async (scopeName) => {
            const matchedGrammar = languageOptions.filter(l => l.scopeName && l.grammar).find(l => l.scopeName === scopeName);
            if (matchedGrammar) {
                return {
                    format: "json",
                    content: matchedGrammar.grammar,
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

    languageOptions.filter(l => l.scopeName).filter(g => !g.default).forEach(g => {
        monacoInstance.languages.register({ id: g.id });
    });

    const grammars = new Map<string, string>();

    languageOptions.filter(l => l.scopeName).forEach(l => {
        grammars.set(l.id, l.scopeName!);
    });

    return { registry, grammars };
};
