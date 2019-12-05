#!/bin/bash

API="http://localhost:4741"
URL_PATH="/phones"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
      "phone": {
        "model": "'"${MODEL}"'",
        "state": "'"${STATE}"'",
        "company": "'"${COMPANY}"'",
        "description": "'"${DESCRIPTION}"'",
        "price": "'"${PRICE}"'",
      }
    }'

echo
