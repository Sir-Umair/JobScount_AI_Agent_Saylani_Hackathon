import asyncio
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

async def test_anthropic():
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    print(f"Testing with key: {api_key[:10]}...")
    
    client = anthropic.AsyncAnthropic(api_key=api_key)
    
    models = ["claude-3-haiku-20240307", "claude-3-sonnet-20240229", "claude-3-opus-20240229", "claude-2.1"]
    
    for model in models:
        try:
            print(f"\nAttempting model: {model}")
            response = await client.messages.create(
                model=model,
                max_tokens=10,
                messages=[{"role": "user", "content": "Hi"}]
            )
            print(f"SUCCESS with {model}: {response.content[0].text}")
            return
        except Exception as e:
            print(f"FAILED {model}: {e}")

if __name__ == "__main__":
    asyncio.run(test_anthropic())
