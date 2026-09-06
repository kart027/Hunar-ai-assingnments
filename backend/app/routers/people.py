"""
People search & reachout router.
"""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_session
from app.models.schemas import (
    CampaignRecord,
    CallRecord,
    PeopleSearchRequest,
    PeopleSearchResponse,
    ReachoutRequest,
    ReachoutResponse,
)
from app.services.hunar import hunar
from app.services.people_search import search_people

router = APIRouter(prefix="/people", tags=["people"])

# In-memory candidate store (session-scoped for demo)
_candidate_store: dict[str, dict] = {}


@router.post("/search", response_model=PeopleSearchResponse)
async def people_search(body: PeopleSearchRequest):
    """Search for candidates matching the job description."""
    candidates = await search_people(body.job_description, body.max_results)

    # Store candidates for later reachout
    for c in candidates:
        _candidate_store[c.id] = c.model_dump()

    return PeopleSearchResponse(
        candidates=candidates,
        total=len(candidates),
        source="pdl" if any(c.id.startswith("pdl-") for c in candidates) else "mock",
    )


@router.post("/reachout", response_model=ReachoutResponse)
async def reachout(body: ReachoutRequest, db: AsyncSession = Depends(get_session)):
    """
    Initiate bulk Voice AI reachout calls for selected candidates.
    """
    selected = [_candidate_store[cid] for cid in body.candidate_ids if cid in _candidate_store]
    if not selected:
        raise HTTPException(status_code=400, detail="No valid candidates found. Run /people/search first.")

    campaign_id = str(uuid.uuid4())

    # Persist campaign
    campaign = CampaignRecord(
        id=campaign_id,
        name=body.campaign_name,
        job_description=body.job_description,
        total_candidates=len(selected),
        calls_initiated=0,
        created_at=datetime.utcnow(),
    )
    db.add(campaign)
    await db.commit()

    # Build bulk call payload
    call_data = []
    for cand in selected:
        call_data.append({
            "callee_name": cand["full_name"],
            "mobile_number": cand.get("phone") or "+919999999999",  # fallback for demo
            "custom_data": {
                "current_role": cand.get("title", ""),
                "company": cand.get("company", ""),
                "job_description_snippet": body.job_description[:200],
            },
        })

    hunar_payload: dict = {
        "agent_id": body.agent_id,
        "request_id": f"campaign-{campaign_id[:8]}",
        "data": call_data,
    }
    if body.from_phone_number:
        hunar_payload["from_phone_number"] = body.from_phone_number

    try:
        agent = await hunar.get_agent(body.agent_id)
        required_vars = agent.get("custom_variables", [])
        for item in call_data:
            for var in required_vars:
                if var not in item["custom_data"]:
                    item["custom_data"][var] = "Not provided"

        created_calls = await hunar.create_bulk_calls(hunar_payload)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hunar API error: {e}")

    # Persist call records
    call_ids = []
    for call_data_item in (created_calls if isinstance(created_calls, list) else [created_calls]):
        cid = call_data_item.get("id", str(uuid.uuid4()))
        call_ids.append(cid)
        record = CallRecord(
            id=cid,
            callee_name=call_data_item.get("callee_name", ""),
            mobile_number=call_data_item.get("mobile_number", ""),
            agent_id=body.agent_id,
            status=call_data_item.get("status", "NOT_STARTED"),
            lifecycle_status=call_data_item.get("lifecycle_status", "NOT_STARTED"),
            source="reachout",
            campaign_id=campaign_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(record)

    # Update campaign count
    campaign.calls_initiated = len(call_ids)
    await db.commit()

    return ReachoutResponse(
        campaign_id=campaign_id,
        campaign_name=body.campaign_name,
        calls_created=len(call_ids),
        call_ids=call_ids,
    )


@router.get("/campaigns")
async def list_campaigns(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(CampaignRecord).order_by(CampaignRecord.created_at.desc()))
    campaigns = result.scalars().all()
    return {
        "campaigns": [
            {
                "id": c.id,
                "name": c.name,
                "job_description": c.job_description[:100] + "..." if len(c.job_description) > 100 else c.job_description,
                "total_candidates": c.total_candidates,
                "calls_initiated": c.calls_initiated,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in campaigns
        ]
    }


@router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(CampaignRecord).where(CampaignRecord.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Get associated calls
    calls_result = await db.execute(
        select(CallRecord).where(CallRecord.campaign_id == campaign_id).order_by(CallRecord.created_at.desc())
    )
    calls = calls_result.scalars().all()

    return {
        "id": campaign.id,
        "name": campaign.name,
        "job_description": campaign.job_description,
        "total_candidates": campaign.total_candidates,
        "calls_initiated": campaign.calls_initiated,
        "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
        "calls": [
            {
                "id": r.id,
                "callee_name": r.callee_name,
                "mobile_number": r.mobile_number,
                "status": r.status,
                "lifecycle_status": r.lifecycle_status,
                "duration_minutes": r.duration_minutes,
                "engagement_status": r.engagement_status,
                "answered_by": r.answered_by,
                "result": r.result,
                "recording_url": r.recording_url,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in calls
        ],
    }
