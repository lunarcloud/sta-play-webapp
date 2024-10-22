#!/bin/sh

rm -r ./lib
mkdir -p ./lib || exit 1

# custom element polyfill for safari
cp ./node_modules/@ungap/custom-elements/es.js ./lib/custom-elements.js

# 3d model viewing
cp ./node_modules/three/build/three.module.min.js ./lib/
cp ./node_modules/@google/model-viewer/dist/model-viewer.min.js ./lib/

# file Saving
cp ./node_modules/jszip/dist/jszip.min.js ./lib/

# database
cp ./node_modules/idb/build/index.js ./lib/idb.js