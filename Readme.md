# elm-node-webgl

This is an experiment that renders the Elm WebGL code on node using
[gl](https://www.npmjs.com/package/gl).

<img src="crate.png">

The only purpose of this, is to be able to test the WebGL in Elm.

## Installation

```
elm package install --y
npm i
```

## Running

This will start rendering the images in the project folder,
press Ctrl+C to stop.

```
elm make crate.elm --output elm.js
node render.js
```
