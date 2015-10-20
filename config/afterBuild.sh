#!/bin/bash

cd landing
rm -rf  assets config dbpedia example evaluation
cp -r ../config config 
cp -r ../dist assets 
cp -r assets evaluation
find evaluation -type d ! -path evaluation | xargs rm -rf
find assets -type f -maxdepth 1 | xargs rm -rf 
cat evaluation/index.html | sed -E 's#(src|href)(=["'"'"']?)(styles|scripts)#\1\2../assets/\3#g' >foobar.html
mv foobar.html evaluation/index.html
cp -r evaluation dbpedia
cp config/evaluation.js evaluation/overwrite.js
cp config/dbpedia.js dbpedia/overwrite.js
cd ..
rm -rf dist/config
cp config/bower.json dist
cp -r config dist/config
rm -rf dist/config/bower.json