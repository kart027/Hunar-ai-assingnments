import asyncio
import httpx

async def main():
    # Payload provided by user
    payload = {
        "agent_id": "60a7e1bb-320d-4b5e-998f-005cd8b7da35",
        "callee_name": "kartik",
        "mobile_number": "8963089123",
        "custom_data": {"job_role": "engineer"},
        "job_role": "engineer",
        "source": "hiring",
        "request_id": "hiring-1788680228028"
    }
    
    # We need to construct the payload exactly as the backend would send it to Hunar
    # The backend extracts agent_id, callee_name, mobile_number, custom_data, request_id
    hunar_payload = {
        "agent_id": payload["agent_id"],
        "callee_name": payload["callee_name"],
        "mobile_number": payload["mobile_number"],
        "custom_data": payload["custom_data"],
        "request_id": payload["request_id"]
    }
    
    import os
    from dotenv import load_dotenv
    load_dotenv('.env')
    key = os.environ.get("HUNAR_API_KEY")
    
    headers = {
        "X-API-Key": key,
        "Content-Type": "application/json",
    }
    
    async with httpx.AsyncClient() as client:
        # First, simulate the backend fetching the agent to pad variables
        r = await client.get(
            f"https://api.voice.hunar.ai/external/v1/agents/{payload['agent_id']}/",
            headers=headers,
        )
        agent = r.json()
        required_vars = agent.get("custom_variables", [])
        print("Required custom variables for this agent:", required_vars)
        for var in required_vars:
            if var not in hunar_payload["custom_data"]:
                hunar_payload["custom_data"][var] = "Not provided"

        # Now make the actual call
        print("Sending to Hunar API:", hunar_payload)
        r = await client.post(
            "https://api.voice.hunar.ai/external/v1/calls/",
            headers=headers,
            json=hunar_payload,
        )
        print("Status Code:", r.status_code)
        try:
            print("Response:", r.json())
        except Exception:
            print("Response:", r.text)

asyncio.run(main())
