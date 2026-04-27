MAX_FILE_SIZE_MB = 10

def validate_file(filename: str, contents: bytes):
    allowed_extensions = [".csv", ".xlsx", ".json"]
    ext = "." + filename.split(".")[-1].lower()

    if ext not in allowed_extensions:
        raise ValueError(f"Unsupported file type: {ext}")

    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise ValueError(f"File too large. Max size is {MAX_FILE_SIZE_MB}MB.")

    if len(contents) == 0:
        raise ValueError("File is empty.")
