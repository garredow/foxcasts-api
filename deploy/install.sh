#!/usr/bin/env bash

export DOCKER_IMAGE=$1

if [[ -z "${DOCKER_IMAGE}" ]]; then
    echo "DOCKER_IMAGE is required"
    exit 1
fi

cd ~/apps/foxcasts-api

docker-compose down && docker-compose up -d

cd -