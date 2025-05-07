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
npm install kai-ui
```
or
```bash
pnpm add kai-ui
```

## Components
### Editor
A base Monaco code editor with support for multiple languages, including RDF languages.

![Editor component](/docs/Editor.png)

### OpenLayers Map
An interactive OpenLayers Map that supports loading WKT & geoJSON features.

#### Supported languages
- SPARQL
- Turtle
- TriG
- SHACL
- N-Triples
- N-Quads
- JSON
- JavaScript
- TypeScript
- Python
- HTML
- CSS

#### Props
prop|description|type|required|default
-|-|-|:-:|:-:
languages|What languages are available to choose from|`string[]`, see above for supported languages||all are enabled by default
hideToolbar|Hides the tool bar at the top of the editor|`boolean`||`false`

#### Models
model|description|type|required|default
-|-|-|:-:|:-:
-|The value or content of the editor|`string`||
lang|The current language of the editor|`string`, see above||"sparql"
theme|The color theme of the editor|`"light-tm" \| "dark-tm"`||system preference

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
