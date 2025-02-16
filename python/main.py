from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import JSONFormatter

app = FastAPI(
    title="YouTube Transcript API", 
    description="API for retrieving YouTube video transcripts."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production for specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/transcript")
def get_transcript(video_id: str, languages: list[str] = Query(["en"])):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
        full_text = " ".join([item['text'] for item in transcript])
        return {"video_id": video_id, "transcript": full_text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)