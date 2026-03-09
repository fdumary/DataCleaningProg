from fastapi import FastAPI
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from db import db
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import csv
import io
import json

# helper logic for cleaning and summary
from services.cleaner import calculate_summary, apply_operations

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


# new preview endpoint that echoes data back and includes a summary

class PreviewRequest(BaseModel):
    headers: List[str]
    rows: List[Dict[str, Any]]
    operations: List[str] = []


class ExportRequest(BaseModel):
    headers: List[str]
    rows: List[Dict[str, Any]]
    format: str = "csv"
    base_name: str = "data"

@app.post("/preview")
async def preview(request: PreviewRequest):
    # apply any requested operations (currently a stub)
    cleaned_rows = apply_operations(request.headers, request.rows, request.operations)
    summary = calculate_summary(request.headers, cleaned_rows)

    return {
        "headers": request.headers,
        "rows": cleaned_rows,
        "operations_applied": request.operations,
        "original_row_count": len(request.rows),
        "preview_row_count": len(cleaned_rows),
        "source": "backend",
        "summary": summary,
    }


@app.post("/export")
async def export_data(request: ExportRequest):
    headers = request.headers or []
    rows = request.rows or []
    file_format = (request.format or "csv").lower()

    if file_format not in ["csv", "json"]:
        file_format = "csv"

    safe_base = "".join(ch if ch.isalnum() or ch in ["-", "_"] else "_" for ch in request.base_name)
    safe_base = safe_base.strip("_") or "data"
    timestamp = datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
    filename = f"{safe_base}_cleaned_{timestamp}.{file_format}"

    if file_format == "json":
        file_bytes = json.dumps(rows, ensure_ascii=False, indent=2).encode("utf-8")
        media_type = "application/json"
    else:
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow({header: row.get(header, "") for header in headers})
        file_bytes = output.getvalue().encode("utf-8")
        media_type = "text/csv"

    return Response(
        content=file_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )