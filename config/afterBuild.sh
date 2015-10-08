#!/bin/bash

cd landing
rm -rf  assets config dbpedia example 
cp -r ../config config 
cp -r ../dist assets 
cp -r assets example 
find example -type d ! -path example | xargs rm -rf 
find assets -type f -maxdepth 1 | xargs rm -rf 
cat example/index.html | sed -E 's#(src|href)(=["'"'"']?)(styles|scripts)#\1\2../assets/\3#g' >foobar.html 
mv foobar.html example/index.html 
cp -r example dbpedia 
cp config/exampleOntology.js example/overwrite.js 
cp config/dbpedia.js dbpedia/overwrite.js
cd ..
rm -rf dist/config
cp config/bower.json dist
cp -r config dist/config
rm -rf dist/config/bower.json