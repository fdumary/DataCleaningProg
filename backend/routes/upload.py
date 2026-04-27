import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.validator import validate_file

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        try:
            validate_file(file.filename, contents)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_path, "wb") as f:
            f.write(contents)

        return {
            "message": "File received successfully",
            "filename": file.filename,
            "saved_path": file_path
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
