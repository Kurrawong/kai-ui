# KAI UI
A Vue.js component library for use in Kurrawong tools.

## Contents
- [Install](#install)
- [Components](#components)
- [Development](#development)
- [License](#license)

## Install
To add `kai-ui` to your project, simply run:

```bash
npm install @kurrawongai/kai-ui
```
or
```bash
pnpm add @kurrawongai/kai-ui
```

You may also need to import KAI-UI's stylesheet (`"kai-ui/kai-ui.css"`).

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
- Markdown
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
- YAML

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
directDownload|Downloads the file directly instead of a popup for renaming the downloaded file name|`boolean`||`false`
class|Passthrough for applying CSS classes|`string`||

#### Models
model|description|type|required|default
-|-|-|:-:|:-:
-|The value or content of the editor|`string`||
language|The current language of the editor|`string`, see above||`"text"`
theme|The color theme of the editor|`"light" \| "dark" \| "system"`||`"system"`

### OpenLayers Map
An interactive OpenLayers Map that supports loading WKT & geoJSON features.

![Map component](/docs/Map.png)
#### Props
prop|description|type|required|default
-|-|-|:-:|-
center|Where to center the map|`number[]`, array of 2 coordinates||[133.7751, -25.2744] (Australia)
zoom|Zoom level|`number`||4
rotation|Map rotation|`number`||0
projection|Projection to use, make sure this matches the data|`string`||'EPSG:4326'
focusSourceRef|Passed through to vue3-openlayers|`Sources.OlSourceVector`||null
layers|Layers of GeoJSON FeatureCollections to include in the map on load|<pre lang="typescript">{&#13;  type: "FeatureCollection";&#13;  title: string;&#13;  features: {&#13;    type: "Feature";&#13;    name: string;&#13;    wkt?: string;&#13;    geoJSON?: any;&#13;  }[];&#13;  mapStyle?: MapStyle;&#13;}[]<pre> see drawStyle type for `MapStyleOptions`||[]
loading|Display a "Loading" modal on the map, useful when loading data|`boolean`||false
drawEnabled|Enable "Draw mode", allowing the user to draw on the Map|`boolean`||false
mapStyle|Sets the default layer styles for view, hover & select states|<pre lang="typescript">{&#13;  style?: MapStyleOptions;&#13;  hoverStyle?: MapStyleOptions;&#13;  selectStyle?: MapStyleOptions;&#13;}<pre> see drawStyle type for `MapStyleOptions`||see `consts.ts` for default styles
drawStyle|Sets the layer style for drawing geometries|<pre lang="typescript">{&#13;  strokeWidth?: number;&#13;  strokeColor?: string;&#13;  fillColor?: string;&#13;  pointRadius?: number;&#13;  pointStrokeWidth?: number;&#13;  pointStrokeColor?: string;&#13;  pointFillColor?: string;&#13;}<pre>||see `consts.ts` for default styles

#### Events
event|description|parameters
-|-|-
select|Fired when the user selects (clicks) a feature|feature
hover|Fired when the user hovers over a feature|feature
drawstart|Fired when the user starts drawing|feature
drawend|Fired when a feature is fully drawn by the user|feature

### Graph Diagram
A reactive node-edge graph diagram that renders data from RDF.

![Graph diagram](/docs/GraphDiagram.png)

#### Props
prop|description|type|required|default
-|-|-|:-:|-
data|The RDF data to load & display|`string`|&check;|
options|Options for customisation|See the [options table](#options) below||
graphOptions|Additional options from Unovis' graph to pass through|See [the available options from Unovis](https://unovis.dev/docs/networks-and-flows/Graph#component-props)||<pre lang="javascript">{&#13;  nodeSize: 30,&#13;  linkWidth: 2,&#13;  nodeFill: () => ... // colours nodes using style options below,&#13;  linkArrow: true,&#13;  forceLayoutSettings: {&#13;    linkDistance: 80,&#13;    linkStrength: 0.45,&#13;    charge: -1000,&#13;    forceXStrength: 0.15,&#13;    forceYStrength: 0.4,&#13;  },&#13;  nodeSelectionHighlightMode: GraphNodeSelectionHighlightMode.GreyoutNonConnected,&#13;}<pre>
class|Passthrough for applying CSS classes|`string`||

##### Options
prop|description|type|required|default
-|-|-|:-:|-
format|The format of the RDF data to display|`"application/ld+json" \| "jsonld" \| "text/turtle" \| "ttl" \| "application/trig" \| "trig" \| "application/n-triples" \| "nt" \| "application/n-quads" \| "nq" \| "text/n3" \| "n3" \| "application/rdf+xml" \| "rdf"`||`"text/turtle"`
prefixes|A map of prefixes to generate curies - e.g. `{"sdo": "https://schema.org/", ...}`|`Record<string, string>`||A small object of default prefixes are supplied to extend upon
predicates|An array of predicate IRIs to filter by|`string[]`||
labels|An array of labelling predicates which will label nodes instead of IRIs|`string[]`||
query|A SPARQL CONSTRUCT query to filter results|`string`||
style||<pre lang="typescript">{&#13;  node?: string;&#13;  literal?: string;&#13;  bnode?: string;&#13;  nodeBorderColor?: string;&#13;}<pre>||

#### Models
model|description|type|required|default
-|-|-|:-:|:-:
showLabels|Flag whether to display labels for nodes & edges|`boolean`||`false`

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

This code is available for reuse according to the [BSD 3-Clause License](https://opensource.org/license/bsd-3-clause).

&copy; 2025 KurrawongAI
