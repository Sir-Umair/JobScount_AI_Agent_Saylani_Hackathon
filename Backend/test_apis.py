import os
import asyncio
from dotenv import load_dotenv
import anthropic
from tavily import TavilyClient

async def test_apis():
    load_dotenv()
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    tavily_key = os.getenv("TAVILY_API_KEY")
    
    print(f"Anthropic Key present: {bool(anthropic_key)}")
    print(f"Tavily Key present: {bool(tavily_key)}")
    
    if anthropic_key:
        try:
            client = anthropic.AsyncAnthropic(api_key=anthropic_key)
            # Short test
            print("Testing Anthropic...")
            # We don't want to waste tokens, just check initialization
            print("Anthropic client initialized.")
        except Exception as e:
            print(f"Anthropic check failed: {e}")
            
    if tavily_key:
        try:
            client = TavilyClient(api_key=tavily_key)
            print("Testing Tavily...")
            # We don't want to waste tokens, just check initialization
            print("Tavily client initialized.")
        except Exception as e:
            print(f"Tavily check failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_apis())
