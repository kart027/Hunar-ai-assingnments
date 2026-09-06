import asyncio
import httpx

async def main():
    payload = {
        "agent_id": "988fea71-362a-4208-a54a-3940f2973200",
        "callee_name": "Test User",
        "mobile_number": "+919999999999",
        "custom_data": {}
    }
    # from app.config import settings
    # assuming we can grab key from env
    import os
    from dotenv import load_dotenv
    load_dotenv('.env')
    key = os.environ.get("HUNAR_API_KEY")
    
    headers = {
        "X-API-Key": key,
        "Content-Type": "application/json",
    }
    
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "https://api.voice.hunar.ai/external/v1/calls/",
            headers=headers,
            json=payload,
        )
        print("Status Code:", r.status_code)
        try:
            print("Response:", r.json())
        except Exception:
            print("Response:", r.text)

asyncio.run(main())
