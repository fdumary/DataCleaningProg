from fastapi import FastAPI
from db import db

app = FastAPI()

@app.get("/health")
async def health():
    names = await db.list_collection_names()
    return {"ok": True, "collections": names}

@app.post("/seed")
async def seed():
    result = await db["test_records"].insert_one(
        {"source": "fastapi", "status": "connected", "timestamp": "seeded"}
    )
    return {"inserted_id": str(result.inserted_id)}