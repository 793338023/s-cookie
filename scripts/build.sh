#!/bin/bash

node scripts/build.js

rm -rf ./s-cookie.zip

cd ./s-cookie

zip -r ../s-cookie.zip *

cd ../


