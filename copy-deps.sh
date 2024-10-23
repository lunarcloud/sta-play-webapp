#!/bin/sh

shx rm -rf ./lib
shx mkdir ./lib || exit 1

# custom element polyfill for safari
shx cp ./node_modules/@ungap/custom-elements/es.js ./lib/custom-elements.js

# 3d model viewing
shx cp ./node_modules/three/build/three.module.min.js ./lib/
shx cp ./node_modules/@google/model-viewer/dist/model-viewer.min.js ./lib/

# file Saving
shx cp ./node_modules/jszip/dist/jszip.min.js ./lib/

# database
shx cp ./node_modules/idb/build/index.js ./lib/idb.js