"""Agents router — proxies Hunar /agents endpoints."""
from fastapi import APIRouter, HTTPException, Query

from app.services.hunar import hunar

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/")
async def list_agents(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)):
    try:
        return await hunar.list_agents(page=page, page_size=page_size)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    try:
        return await hunar.get_agent(agent_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
