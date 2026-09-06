"""Webhook handler — receives real-time call events from Hunar."""
from __future__ import annotations

import hashlib
import hmac
import json
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.models.schemas import CallRecord

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# Webhook signing secret — set HUNAR_WEBHOOK_SECRET in .env
WEBHOOK_SECRET = getattr(settings, "HUNAR_WEBHOOK_SECRET", "")


def _verify_signature(payload: bytes, signature: str) -> bool:
    """Validate HMAC-SHA256 signature if secret is configured."""
    if not WEBHOOK_SECRET:
        return True  # Skip validation in dev
    expected = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/hunar")
async def hunar_webhook(
    request: Request,
    db: AsyncSession = Depends(get_session),
    x_hunar_signature: str = Header(default=""),
):
    """Receive Hunar call lifecycle events and update local DB."""
    body = await request.body()

    if not _verify_signature(body, x_hunar_signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    call_id = event.get("call_id") or event.get("id")
    if not call_id:
        return {"ok": True, "message": "No call_id in payload"}

    # Update the local record
    await db.execute(
        update(CallRecord)
        .where(CallRecord.id == call_id)
        .values(
            status=event.get("status", "UNKNOWN"),
            lifecycle_status=event.get("lifecycle_status"),
            duration_minutes=event.get("duration_minutes"),
            engagement_status=event.get("engagement_status"),
            answered_by=event.get("answered_by"),
            recording_url=event.get("recording_url"),
            result=event.get("result"),
            updated_at=datetime.utcnow(),
        )
    )
    await db.commit()

    return {"ok": True, "call_id": call_id}
