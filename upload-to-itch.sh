#!/bin/bash
CURRENT_DIR=$(dirname "$(readlink -f "$0")")
EXPORT="$CURRENT_DIR/export/"

echo Preparing...
rm -r $EXPORT
mkdir $EXPORT
cp index.html $EXPORT
cp sta-play-webapp.webmanifest $EXPORT
cp -r audio $EXPORT
cp -r controllers $EXPORT
cp -r css $EXPORT
cp -r gltf $EXPORT
cp -r img $EXPORT
cp -r input-progress $EXPORT

echo Uploading to Itch...
butler -v push $EXPORT "samsarette/sta-play:web"

echo Done.
