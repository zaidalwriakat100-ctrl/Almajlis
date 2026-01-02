def analyze_parties(blocks):
    """
    Analyze parties/speakers directly from session blocks.
    No external files required.
    """

    speakers_count = {}

    for block in blocks:
        speaker = block.get("speaker")
        if not speaker:
            continue

        speakers_count[speaker] = speakers_count.get(speaker, 0) + 1

    return [
        {
            "name": speaker,
            "interventions": count
        }
        for speaker, count in speakers_count.items()
    ]
