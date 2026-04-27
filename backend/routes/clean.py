from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.cleaner import run_cleaning_pipeline
from services.validator import validate_file
import pandas as pd
import io
import json

router = APIRouter()

@router.post("/clean")
async def clean_file(file: UploadFile = File(...), config: str = Form(...)):
    try:
        contents = await file.read()

        try:
            validate_file(file.filename, contents)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        config_dict = json.loads(config)

        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(contents))
        elif file.filename.endswith('.json'):
            df = pd.read_json(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type.")

        cleaned_df, report = run_cleaning_pipeline(df, config_dict)
        return {
            "cleaned_data": cleaned_df.fillna("").to_dict(orient="records"),
            "report": report
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")