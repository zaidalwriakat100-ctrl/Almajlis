def validate_sessions(session_text: str):
    """
    Validate session text coming directly from API (no files).
    """

    if not session_text:
        raise ValueError("Session text is empty")

    if len(session_text.strip()) < 50:
        raise ValueError("Session text is too short to be a valid parliament session")

    return True
