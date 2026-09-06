"""Calls router — create, list, get calls; syncs with local DB."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.schemas import CallCreateRequest, CallRecord
from app.services.hunar import hunar

router = APIRouter(prefix="/calls", tags=["calls"])


def _map_hunar_to_record(data: dict, source: str = "hiring", job_role: str | None = None, campaign_id: str | None = None) -> dict:
    return {
        "id": data["id"],
        "callee_name": data.get("callee_name", ""),
        "mobile_number": data.get("mobile_number", ""),
        "agent_id": data.get("agent_id", ""),
        "status": data.get("status", "NOT_STARTED"),
        "lifecycle_status": data.get("lifecycle_status", "NOT_STARTED"),
        "duration_minutes": data.get("duration_minutes"),
        "engagement_status": data.get("engagement_status"),
        "answered_by": data.get("answered_by"),
        "recording_url": data.get("recording_url"),
        "result": data.get("result"),
        "custom_data": data.get("custom_data"),
        "request_id": data.get("request_id"),
        "source": source,
        "campaign_id": campaign_id,
        "job_role": job_role,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


@router.post("/")
async def create_call(body: CallCreateRequest, db: AsyncSession = Depends(get_session)):
    """Create a single outbound call and persist it locally."""
    hunar_payload = {
        "agent_id": body.agent_id,
        "callee_name": body.callee_name,
        "mobile_number": body.mobile_number,
        "custom_data": body.custom_data,
    }
    if body.request_id:
        hunar_payload["request_id"] = body.request_id
    if body.from_phone_number:
        hunar_payload["from_phone_number"] = body.from_phone_number

    try:
        # Fetch agent to get required custom variables, avoiding 422 errors
        agent = await hunar.get_agent(body.agent_id)
        required_vars = agent.get("custom_variables", [])
        for var in required_vars:
            if var not in hunar_payload["custom_data"]:
                hunar_payload["custom_data"][var] = "Not provided"

        data = await hunar.create_call(hunar_payload)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    record = CallRecord(**_map_hunar_to_record(data, source=body.source or "hiring", job_role=body.job_role))
    db.add(record)
    await db.commit()
    return data


@router.get("/")
async def list_calls(
    source: Optional[str] = None,
    campaign_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session),
):
    """List calls from local DB (fast) with optional filters."""
    stmt = select(CallRecord).order_by(CallRecord.created_at.desc())
    if source:
        stmt = stmt.where(CallRecord.source == source)
    if campaign_id:
        stmt = stmt.where(CallRecord.campaign_id == campaign_id)

    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)
    result = await db.execute(stmt)
    records = result.scalars().all()

    # Count
    from sqlalchemy import func
    count_stmt = select(func.count()).select_from(CallRecord)
    if source:
        count_stmt = count_stmt.where(CallRecord.source == source)
    if campaign_id:
        count_stmt = count_stmt.where(CallRecord.campaign_id == campaign_id)
    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one()

    return {
        "count": total,
        "results": [
            {
                "id": r.id,
                "callee_name": r.callee_name,
                "mobile_number": r.mobile_number,
                "agent_id": r.agent_id,
                "status": r.status,
                "lifecycle_status": r.lifecycle_status,
                "duration_minutes": r.duration_minutes,
                "engagement_status": r.engagement_status,
                "answered_by": r.answered_by,
                "recording_url": r.recording_url,
                "result": r.result,
                "custom_data": r.custom_data,
                "request_id": r.request_id,
                "source": r.source,
                "campaign_id": r.campaign_id,
                "job_role": r.job_role,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            }
            for r in records
        ],
    }


@router.get("/{call_id}")
async def get_call(call_id: str, db: AsyncSession = Depends(get_session)):
    """Get call details — fetches fresh data from Hunar and updates local DB."""
    try:
        data = await hunar.get_call(call_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    # Update local record
    await db.execute(
        update(CallRecord)
        .where(CallRecord.id == call_id)
        .values(
            status=data.get("status"),
            lifecycle_status=data.get("lifecycle_status"),
            duration_minutes=data.get("duration_minutes"),
            engagement_status=data.get("engagement_status"),
            answered_by=data.get("answered_by"),
            recording_url=data.get("recording_url"),
            result=data.get("result"),
            updated_at=datetime.utcnow(),
        )
    )
    await db.commit()
    return data


@router.post("/{call_id}/refresh")
async def refresh_call(call_id: str, db: AsyncSession = Depends(get_session)):
    """Manually refresh a call's status from Hunar."""
    return await get_call(call_id, db)
