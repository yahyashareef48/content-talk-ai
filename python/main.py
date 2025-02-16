import sys
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import JSONFormatter
def main(video_id: str, languages: list[str] = ["en"]) -> None:
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
        formatter = JSONFormatter()
        json_transcript = formatter.format_transcript(transcript, indent=2)
        print(json_transcript)
    except Exception as e:
        print("Error:", e)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py <video_id> [language1 language2 ...]")
        sys.exit(1)
    video_id = sys.argv[1]
    # Use additional arguments as languages if provided
    languages = sys.argv[2:] if len(sys.argv) > 2 else ["en"]
    main(video_id, languages)