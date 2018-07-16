#!/bin/bash

if [ ! -f ./config.txt ]; then
    touch ./config.txt
fi

address="$( cat ./config.txt )"

./erc891-miner-macos -a $address
