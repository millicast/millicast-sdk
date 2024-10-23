#!/bin/bash

. ${PWD}/${0%/*}/utils.sh

CONFIG_PATH=$1

if [[ -z "$CONFIG_PATH" ]]; then
    echo "Must provide a path to the pm2 config file in environment" 1>&2
    exit 1
fi

CONFIG_FILE=${PWD}/${CONFIG_PATH}

# Check if OS is supported
checkOS osType

# Stop events and api-proxy if running
stopApp ${CONFIG_FILE}

# Start events and api-proxy app locally
cleanUpPm2Logs ${CONFIG_FILE}
runApp ${CONFIG_FILE}

# Verify events and api-proxy started successfully
verifyAppState ${CONFIG_FILE}
