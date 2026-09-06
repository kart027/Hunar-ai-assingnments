"""
Async Hunar Voice AI API client.
All requests go through this service — the API key never reaches the browser.
"""
from __future__ import annotations

import httpx
from typing import Any, Dict, List, Optional

from app.config import settings


class HunarClient:
    """Thin async wrapper around the Hunar external API."""

    def __init__(self) -> None:
        self._base = settings.HUNAR_BASE_URL.rstrip("/")
        self._headers = {
            "X-API-Key": settings.HUNAR_API_KEY,
            "Content-Type": "application/json",
        }

    # ------------------------------------------------------------------
    # Agents
    # ------------------------------------------------------------------

    async def list_agents(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                f"{self._base}/agents/",
                headers=self._headers,
                params={"page": page, "page_size": page_size},
            )
            r.raise_for_status()
            return r.json()

    async def get_agent(self, agent_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                f"{self._base}/agents/{agent_id}/",
                headers=self._headers,
            )
            r.raise_for_status()
            return r.json()

    # ------------------------------------------------------------------
    # Calls
    # ------------------------------------------------------------------

    async def create_call(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{self._base}/calls/",
                headers=self._headers,
                json=payload,
            )
            r.raise_for_status()
            return r.json()

    async def create_bulk_calls(self, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(
                f"{self._base}/calls/bulk/",
                headers=self._headers,
                json=payload,
            )
            r.raise_for_status()
            return r.json()

    async def get_call(self, call_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                f"{self._base}/calls/{call_id}/",
                headers=self._headers,
            )
            r.raise_for_status()
            return r.json()

    async def list_calls(
        self,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        params: Dict[str, Any] = {"page": page, "page_size": page_size}
        if status:
            params["status"] = status
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                f"{self._base}/calls/",
                headers=self._headers,
                params=params,
            )
            r.raise_for_status()
            return r.json()

    # ------------------------------------------------------------------
    # Phone Numbers
    # ------------------------------------------------------------------

    async def list_numbers(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                f"{self._base}/numbers/",
                headers=self._headers,
                params={"page": page, "page_size": page_size},
            )
            r.raise_for_status()
            return r.json()


# Singleton instance
hunar = HunarClient()
