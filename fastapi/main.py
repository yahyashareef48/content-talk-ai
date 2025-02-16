from fastapi import FastAPI
import uvicorn


app = FastAPI()

@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Hello"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)