#!/bin/bash
API_KEY="AQ.Ab8RN6LDmsHv1bFLHXlvSC_02ifN8JSZfr2tNELHd-Vamss8Sg"
MODEL="gemini-3.5-flash"
curl -s -w "\nHTTP_CODE: %{http_code}\n" -X POST "https://generativelanguage.googleapis.com/v1beta/models/$MODEL:generateContent?key=$API_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "contents": [
    {
      "parts": [
        {
          "text": "Hello"
        }
      ]
    }
  ],
  "generationConfig": {
    "thinkingConfig": {
        "thinkingLevel": "high"
    }
  }
}'
