#!/usr/bin/env bash

# TODO: It's not handling any error flow

TARGET_DIRECTORY="${TARGET_DIRECTORY:-/tmp}"

mkdir -p "${TARGET_DIRECTORY}"
git clone git@github.com:brauxpilot/brauxpilot.git "${TARGET_DIRECTORY}/brauxpilot"
cd "${TARGET_DIRECTORY}/brauxpilot"
./setup.sh