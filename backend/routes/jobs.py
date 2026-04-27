from fastapi import APIRouter, HTTPException
from db import db
from datetime import datetime

router = APIRouter()

@router.get("/jobs")
async def get_jobs():
    try:
        jobs = await db["cleaning_jobs"].find().sort("timestamp", -1).to_list(100)
        for job in jobs:
            job["_id"] = str(job["_id"])
        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/jobs")
async def create_job(job: dict):
    try:
        job["timestamp"] = datetime.utcnow().isoformat()
        result = await db["cleaning_jobs"].insert_one(job)
        return {"inserted_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
