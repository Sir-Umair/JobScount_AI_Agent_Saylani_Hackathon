import requests
import os
from dotenv import load_dotenv

load_dotenv()

def test_legacy_endpoint():
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    print(f"Testing LEGACY endpoint with key: {api_key[:10]}...")
    
    url = "https://api.anthropic.com/v1/complete"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    payload = {
        "model": "claude-2.1",
        "prompt": "\n\nHuman: Hello\n\nAssistant:",
        "max_tokens_to_sample": 10
    }
    
    try:
        print(f"Trying {payload['model']} via LEGACY /v1/complete...")
        response = requests.post(url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"SUCCESS: {response.json()['completion']}")
        else:
            print(f"FAILED: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_legacy_endpoint()
