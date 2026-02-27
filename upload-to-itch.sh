#!/bin/bash
CURRENT_DIR=$(dirname "$(readlink -f "$0")")
EXPORT="$CURRENT_DIR/export/"

echo Preparing...
rm -r $EXPORT
mkdir $EXPORT
cp index.* $EXPORT
cp *.webmanifest $EXPORT
cp -r components $EXPORT
cp -r fonts $EXPORT
cp -r gltf $EXPORT
cp -r img $EXPORT
cp -r js $EXPORT
cp -r themes $EXPORT

echo Uploading to Itch...
butler -v push $EXPORT "samsarette/sta-play:web"

echo Cleanup...
rm -r $EXPORT

echo Done.
