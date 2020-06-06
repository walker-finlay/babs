#!/bin/bash

export UPDATE=4 
node capture/app.js >> changes.log 2>>changes.log &
