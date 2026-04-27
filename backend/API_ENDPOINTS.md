# API Endpoints

## Health Check
GET /health
Returns server status and database collections.

## File Upload
POST /upload
Accepts CSV, Excel, or JSON file (max 10MB).
Returns filename and confirmation.

## Preview Data
POST /preview
Accepts a file.
Returns first 50 rows and summary of detected issues.

## Clean Data
POST /clean
Accepts a file and config JSON of selected cleaning operations.
Returns cleaned dataset and cleaning report.

## Export Data
POST /export
Accepts cleaned data and format (csv, xlsx, json, pdf).
Returns downloadable file.

## Get Job History
GET /jobs
Returns list of past cleaning jobs from MongoDB.

## Create Job Record
POST /jobs
Saves a cleaning job record to MongoDB.
