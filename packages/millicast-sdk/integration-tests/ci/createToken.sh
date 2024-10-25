#!/bin/bash

RANDOM_STR=$(openssl rand -hex 3)
TOKEN_LABEL=token_$RANDOM_STR
STREAM_NAME=stream_$RANDOM_STR
API_URL=$1
BEARER=$2

curl --request POST --url $API_URL/publish_token \
     --header 'accept: application/json' \
     --header 'authorization: Bearer '$BEARER \
     --header 'content-type: application/json' \
     --data '{"streams": [{"streamName": "'$STREAM_NAME'"}],"label": "'$TOKEN_LABEL'"}'
