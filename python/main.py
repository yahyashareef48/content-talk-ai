from fastapi import FastAPI, HTTPException, Query
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import JSONFormatter

app = FastAPI(
    title="YouTube Transcript API", 
    description="API for retrieving YouTube video transcripts."
)

@app.get("/transcript")
def get_transcript(video_id: str, languages: list[str] = Query(["en"])):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
        formatter = JSONFormatter()
        json_transcript = formatter.format_transcript(transcript, indent=2)
        return {"video_id": video_id, "transcript": json_transcript}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="8000")