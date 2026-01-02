def verify_session_json(session_text: str):
    """
    Verify that the text looks like a parliament session.
    """

    keywords = ["جلسة", "مجلس", "نواب", "رئيس"]

    if not any(word in session_text for word in keywords):
        raise ValueError("Text does not appear to be a parliament session")

    return True
