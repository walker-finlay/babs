#!/bin/bash

export UPDATE=4 
node backend/app.js >> changes.log 2>>changes.log &
