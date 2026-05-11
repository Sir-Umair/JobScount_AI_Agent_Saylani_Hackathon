import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

def test_raw_request():
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    print(f"Testing RAW request with key: {api_key[:10]}...")
    
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    # Try the most likely active models in 2026
    models = [
        "claude-4-6-sonnet", 
        "claude-4-5-haiku", 
        "claude-3-5-sonnet-latest", 
        "claude-3-haiku-latest",
        "claude-3-5-sonnet-20240620"
    ]
    
    for model in models:
        payload = {
            "model": model,
            "max_tokens": 10,
            "messages": [{"role": "user", "content": "Hello"}]
        }
        
        try:
            print(f"\nTrying {model} via RAW request...")
            response = requests.post(url, headers=headers, json=payload)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print(f"SUCCESS: {response.json()['content'][0]['text']}")
                return
            else:
                print(f"FAILED: {response.text}")
        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    test_raw_request()
