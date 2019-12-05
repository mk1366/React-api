#!/bin/bash

API="http://localhost:4741"
URL_PATH="/phones"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
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
