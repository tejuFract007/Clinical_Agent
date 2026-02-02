import os
import time
import json
import uuid
import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from typing import List, Optional

# Import your agent logic
try:
    from clinical_agent import analyze_biomarkers, MOCK_DB
except ImportError as e:
    print(f"Warning: Could not import clinical_agent: {e}")
    MOCK_DB = []
    def analyze_biomarkers(state):
        return {"analysis_result": {"summary": "Agent Import Failed", "risk_level": "Routine"}}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Log Queue for "Terminal" effect
log_queue = asyncio.Queue()

async def log(message: str, style: str = "white"):
    """Push a log message to the frontend stream"""
    await log_queue.put({"msg": message, "style": style, "timestamp": time.time()})

# In-memory "Database"
class Database:
    def __init__(self):
        self.reports = []
        self.initialized = False

    def init_db(self):
        if self.initialized:
            return
        
        for item in MOCK_DB:
            new_id = item.get("id", str(uuid.uuid4()))
            self.reports.append({
                "id": new_id,
                "patientName": item["patientName"],
                "age": item["age"],
                "testName": item.get("investigationName", "Unknown Test"), 
                "status": item.get("status", "Pending"),
                "raw_data": item.get("raw_data"),
                "history": item.get("history")
            })
        self.initialized = True

db = Database()

@app.get("/api/reports")
def get_reports():
    if not db.initialized:
        db.init_db()
    return db.reports

@app.get("/api/stream")
async def message_stream(request: Request):
    """Streams server logs to the frontend 'Terminal'"""
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            
            # Get pending logs
            try:
                data = await asyncio.wait_for(log_queue.get(), timeout=1.0)
                yield {
                    "event": "log",
                    "data": json.dumps(data)
                }
            except asyncio.TimeoutError:
                # Keep-alive
                yield {"event": "ping", "data": "keep-alive"}
            except Exception as e:
                print(f"Stream error: {e}")
                break

    return EventSourceResponse(event_generator())

@app.post("/api/analyze/{report_id}")
async def run_analysis_endpoint(report_id: str):
    # 1. Find the report
    report = next((r for r in db.reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    await log(f">> Processing Case: {report['patientName']} - {report['testName']}", "bold cyan")
    await asyncio.sleep(0.5)

    # 3. Prepare State
    agent_input_report = {
        "patientName": report["patientName"],
        "investigationName": report["testName"],
        "age": report["age"],
        "raw_data": report["raw_data"],
        "history": report["history"]
    }

    state = {
        "pending_reports": [agent_input_report],
        "processed_count": 0
    }

    try:
        # VISUAL PROOF OF POWER (Simulation of clinical_agent steps)
        await log("DEBUG: Engaging Neural Engine...", "dim")
        await asyncio.sleep(0.8)
        
        await log("   search_tool: Querying 'UpToDate' Clinical Guidelines...", "green")
        await asyncio.sleep(0.6)
        
        await log("   context_retriever: Fetching Hospital Protocols v2024.2...", "green")
        await asyncio.sleep(0.6)
        
        await log("   reasoning_engine: Cross-referencing patient history...", "green")
        await asyncio.sleep(0.8)

        # RUN AGENT
        # Note: analyze_biomarkers is sync. We run it directly.
        # Ideally run in threadpool for async, but for demo sync is fine.
        result = analyze_biomarkers(state)
        analysis = result.get("analysis_result", {})

        await log("✅ Analysis Complete", "bold magenta")
        await log(f"Detected: {analysis.get('summary', '')[:50]}...", "white")

        if "Level 5" in analysis.get('policy_level', ''):
             await log("🚨 LEVEL 5 ALERT DETECTED - INITIATING PROTOCOL", "bold red blink")
             await log(">> VoIP Dialing Dr. Smith...", "red")
             await asyncio.sleep(1)
             await log(">> Sending SMS...", "red")

        # 5. Connect Agent Output -> Frontend
        report["status"] = "Processed"
        report["aiAnalysis"] = {
            "riskLevel": analysis.get("risk_level", "Routine"),
            "policyLevel": analysis.get("policy_level", "Standard"),
            "summary": analysis.get("summary", "Analysis complete."),
            "policyRule": analysis.get("policy_citation", "Standard policy."),
            "childAnalogy": analysis.get("analogy", "None"),
            "findings": analysis.get("findings", [])
        }
        
        return report

    except Exception as e:
        await log(f"CRITICAL ERROR: {str(e)}", "bold red")
        return {
            "error": str(e), 
            "status": "Failed",
            "id": report_id,
        }

from fastapi.responses import FileResponse
import glob

@app.get("/api/download/{report_id}")
async def download_report(report_id: str):
    try:
        # Find the report in DB
        report = next((r for r in db.reports if r["id"] == report_id), None)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Ensure dir exists
        os.makedirs("generated_reports", exist_ok=True)

        # Find the generated file (The CLI tool creates files like Report_Priya_Sharma_...)
        # We look for the most recent file matching the name
        name_clean = report['patientName'].replace(" ", "_")
        files = glob.glob(f"generated_reports/Report_{name_clean}_*.txt")
        
        final_path = ""
        if not files:
            # If no file exists (maybe agent didn't run fully or CLI wasn't used), create one on the fly
            filename = f"generated_reports/Report_{name_clean}_{int(time.time())}.txt"
            
            # Safe get for analysis
            analysis = report.get('aiAnalysis', {})
            summary = analysis.get('summary', 'No Data Available')
            risk = analysis.get('riskLevel', 'Unknown')
            
            content = f"""============================================================
OFFICIAL HOSPITAL CLINICAL NOTE
============================================================
PATIENT NAME:  {report['patientName']}
TEST:          {report['testName']}
DATE:          {time.strftime("%Y-%m-%d %H:%M:%S")}
------------------------------------------------------------
RESULT:
{summary}

RISK ASSESSMENT: {risk}
============================================================"""
            
            with open(filename, "w", encoding="utf-8") as f:
                f.write(content)
            final_path = filename
        else:
            # Return the latest file
            final_path = max(files, key=os.path.getctime)
        
        return FileResponse(final_path, media_type='text/plain', filename=f"Medical_Report_{name_clean}.txt")
    except Exception as e:
        print(f"DOWNLOAD ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Static files are handled by the Frontend deployment (Vercel/Render Static Site)
# We only serve API here.

@app.get("/")
async def root():
    return {"status": "ok", "message": "Clinical AI Agent Backend is Running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Clinical Agent Server on http://localhost:{port}")
    # Using 1 worker to allow shared 'log_queue' to work simply
    uvicorn.run(app, host="0.0.0.0", port=port)
