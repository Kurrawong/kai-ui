# KAI UI
A Vue.js component library for use in Kurrawong tools.

## Contents
- [Install](#install)
- [Components](#components)
- [Development](#development)
- [License](#license)

## Install
To add `kai-ui` to your project, simply run (coming soon):

```bash
npm install @kurrawongai/kai-ui
```
or
```bash
pnpm add @kurrawongai/kai-ui
```

## Components
### Editor
A base Monaco code editor with support for multiple languages, including RDF languages.

![Editor component](/docs/Editor.png)

### OpenLayers Map
An interactive OpenLayers Map that supports loading WKT & geoJSON features.

#### Supported Languages
- CSS
- HTML
- Java
- JavaScript
- JSON
- N3
- N-Quads
- N-Triples
- Python
- SHACL
- SPARQL
- TriG
- Turtle
- TypeScript
- XML

#### Props
prop|description|type|required|default
-|-|-|:-:|-
languages|What languages are available to choose from|`string[]`, see above for supported languages||all are enabled by default
hideToolbar|Hides the tool bar at the top of the editor|`boolean`||`false`
options|Monaco editor options|See [the available options from Monaco](https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IStandaloneEditorConstructionOptions.html)||<pre lang="javascript">{&#13;  automaticLayout: true,&#13;  minimap: { enabled: false },&#13;  stickyScroll: { enabled: false },&#13;  scrollBeyondLastLine: false,&#13;}<pre>
hideLanguage|Hides the language selector|`boolean`||`false`
hideTheme|Hides the theme selector|`boolean`||`false`
hideCopyButton|Hides the copy button|`boolean`||`false`
hideClearButton|Hides the clear button|`boolean`||`false`
hideUploadButton|Hides the upload button|`boolean`||`false`
hideDownloadButton|Hides the download selector|`boolean`||`false`
disableDrag|Disabled drag and drop|`boolean`||`false`
readonly|Sets the editor to read only. Also hides the upload & clear buttons|`boolean`||`false`
downloadFilename|Sets the name of the file for download|`string`||`"output"`
class|Passthrough for applying CSS classes|`string`||

#### Models
model|description|type|required|default
-|-|-|:-:|:-:
-|The value or content of the editor|`string`||
language|The current language of the editor|`string`, see above||`"text"`
theme|The color theme of the editor|`"light-tm" \| "dark-tm"`||system preference

### OpenLayers Map
An interactive OpenLayers Map that supports loading WKT & geoJSON features.

## Development
To install:

```bash
pnpm install
```
To run locally:
```bash
pnpm dev
```

## License
...
