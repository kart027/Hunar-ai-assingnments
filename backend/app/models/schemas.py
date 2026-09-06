"""
Pydantic models and SQLAlchemy ORM models for Hunar AI Assignment.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import JSON, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase


# ---------------------------------------------------------------------------
# SQLAlchemy ORM
# ---------------------------------------------------------------------------

class Base(AsyncAttrs, DeclarativeBase):
    pass


class CallRecord(Base):
    """Local mirror of a Hunar call for fast dashboard queries."""
    __tablename__ = "call_records"

    id = Column(String, primary_key=True)           # Hunar call UUID
    callee_name = Column(String, nullable=False)
    mobile_number = Column(String, nullable=False)
    agent_id = Column(String, nullable=False)
    status = Column(String, default="NOT_STARTED")
    lifecycle_status = Column(String, default="NOT_STARTED")
    duration_minutes = Column(Float, nullable=True)
    engagement_status = Column(String, nullable=True)
    answered_by = Column(String, nullable=True)
    recording_url = Column(String, nullable=True)
    result = Column(JSON, nullable=True)
    custom_data = Column(JSON, nullable=True)
    request_id = Column(String, nullable=True)
    # Source: 'hiring' | 'reachout'
    source = Column(String, default="hiring")
    # For people-search campaigns
    campaign_id = Column(String, nullable=True)
    job_role = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CampaignRecord(Base):
    """A people-search reachout campaign."""
    __tablename__ = "campaign_records"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    total_candidates = Column(Integer, default=0)
    calls_initiated = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Pydantic Schemas — Hunar API shapes
# ---------------------------------------------------------------------------

class AgentSchema(BaseModel):
    id: str
    name: str
    voice_persona: Optional[str] = None
    persona_name: Optional[str] = None
    language: Optional[str] = None
    custom_variables: Optional[List[str]] = []
    summary: Optional[str] = None
    status: Optional[str] = None
    logo: Optional[str] = None
    agent_code: Optional[str] = None
    required_variables: Optional[List[str]] = []
    result_variables: Optional[List[str]] = []
    result_schema: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None


class AgentListResponse(BaseModel):
    count: int
    next: Optional[str] = None
    previous: Optional[str] = None
    results: List[AgentSchema]


class CallCreateRequest(BaseModel):
    agent_id: str
    callee_name: str
    mobile_number: str
    custom_data: Dict[str, Any] = Field(default_factory=dict)
    request_id: Optional[str] = None
    from_phone_number: Optional[str] = None
    job_role: Optional[str] = None          # local meta, not sent to Hunar
    source: Optional[str] = "hiring"        # local meta


class BulkCallItem(BaseModel):
    callee_name: str
    mobile_number: str
    custom_data: Dict[str, Any] = Field(default_factory=dict)


class BulkCallRequest(BaseModel):
    agent_id: str
    request_id: Optional[str] = None
    from_phone_number: Optional[str] = None
    data: List[BulkCallItem]
    # Local meta
    campaign_id: Optional[str] = None
    job_role: Optional[str] = None


class CallSchema(BaseModel):
    id: str
    callee_name: str
    mobile_number: str
    agent_id: Optional[str] = None
    status: Optional[str] = None
    lifecycle_status: Optional[str] = None
    duration_minutes: Optional[float] = None
    duration_seconds: Optional[float] = None
    engagement_status: Optional[str] = None
    answered_by: Optional[str] = None
    call_ended_by: Optional[str] = None
    recording_url: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    custom_data: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    # local extras
    source: Optional[str] = None
    campaign_id: Optional[str] = None
    job_role: Optional[str] = None


class CallListResponse(BaseModel):
    count: int
    next: Optional[str] = None
    previous: Optional[str] = None
    results: List[CallSchema]


# ---------------------------------------------------------------------------
# Pydantic Schemas — People Search
# ---------------------------------------------------------------------------

class Candidate(BaseModel):
    id: str
    full_name: str
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    experience_years: Optional[int] = None
    skills: Optional[List[str]] = []
    match_score: Optional[int] = None


class PeopleSearchRequest(BaseModel):
    job_description: str
    max_results: int = Field(default=20, le=50)


class PeopleSearchResponse(BaseModel):
    candidates: List[Candidate]
    total: int
    source: str = "mock"


class ReachoutRequest(BaseModel):
    agent_id: str
    candidate_ids: List[str]
    job_description: str
    campaign_name: str
    from_phone_number: Optional[str] = None


class ReachoutResponse(BaseModel):
    campaign_id: str
    campaign_name: str
    calls_created: int
    call_ids: List[str]


class CampaignSchema(BaseModel):
    id: str
    name: str
    job_description: str
    total_candidates: int
    calls_initiated: int
    created_at: Optional[str] = None
