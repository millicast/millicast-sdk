#!/bin/bash

API_URL=$1
BEARER=$2
TOKEN_ID=$3

curl --request DELETE \
     --url $API_URL/publish_token/$TOKEN_ID \
     --header 'accept: application/json' \
     --header 'authorization: Bearer '$BEARER
