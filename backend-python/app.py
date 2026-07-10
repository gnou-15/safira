import os
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer


# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="SAFIRA AI Microservice", version="1.0.0")

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    print("Warning: GROQ_API_KEY is not configured in environment variables.")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")  # Use service_role key to allow RAG database reads/writes
supabase: Optional[Client] = None
if supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)
else:
    print("Warning: Supabase credentials are not configured.")

# Initialize local embedding model for RAG (384 dimensions)
try:
    print("Loading SentenceTransformer model (all-MiniLM-L6-v2)...")
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading embedding model: {e}")
    embedding_model = None


# Helpers for Risk Assessment Calculations (5x5 matrix)
def calculate_risk_level(score: int) -> str:
    if 1 <= score <= 4:
        return "Low"
    elif 5 <= score <= 12:
        return "Medium"
    else:
        return "High"


# Request & Response Schemas
class HiracGenerationRequest(BaseModel):
    incident_prompt: str
    location: Optional[str] = "Mactan Cebu International Airport"
    department: Optional[str] = "Safety & Security"

class ChatRequest(BaseModel):
    message: str
    chat_history: List[Dict[str, str]]
    current_table: List[Dict[str, Any]]


# Helper: perform RAG search
def search_safety_guidelines(query: str, limit: int = 3) -> str:
    if not supabase or not embedding_model:
        return "No safety manuals connected."
    
    try:
        # Generate embedding locally
        query_vector = embedding_model.encode(query).tolist()
        
        # Call Supabase stored procedure (match_documents)
        # Raised match_threshold to 0.55 to filter out completely unrelated manuals
        response = supabase.rpc(
            "match_documents",
            {
                "query_embedding": query_vector,
                "match_threshold": 0.55,
                "match_count": limit
            }
        ).execute()
        
        if not response.data:
            return "No matching local safety guidelines found for this specific query."
        
        contexts = []
        for doc in response.data:
            contexts.append(f"Source: {doc['document_name']}\nContent: {doc['content']}")
            
        return "\n\n---\n\n".join(contexts)
    except Exception as e:
        print(f"RAG search error: {e}")
        return "Failed to query safety guidelines database."


@app.post("/generate-hirac")
async def generate_hirac(req: HiracGenerationRequest):
    if not groq_client:
        raise HTTPException(status_code=500, detail="Groq API client is not configured.")
    
    # 1. Fetch RAG context to enrich the safety logic
    rag_context = search_safety_guidelines(req.incident_prompt, limit=2)
    
    # 2. Build system prompt for Groq
    system_prompt = """You are a senior airport safety officer. Your task is to generate a comprehensive, highly-detailed Hazard Identification, Risk Assessment & Control (HIRAC) report in JSON format based on the user's description of an incident, activity, or hazard scenario.

Your output must be a valid JSON array of objects representing rows in the HIRAC table.
Each row object MUST follow this schema exactly:
{
  "operation_type": "The sector or type of activity (e.g. Passenger terminal operations, Aircraft Ground Handling, Baggage Area)",
  "generic_hazard": "The hazard trigger or general category (e.g. Earthquake, Typhoon, Fuel Spill, Power Outage)",
  "risks": "Consequences of the hazard (e.g. Structural collapse, personal injury, flight delays)",
  "existing_defenses": "Current safety barriers and SOPs active before further mitigations",
  "initial_likelihood": 1-5 integer representing likelihood,
  "initial_severity": 1-5 integer representing severity,
  "mitigating_actions": "Actions to further reduce risks. Each action MUST start with its corresponding Hierarchy of Controls category letter:
    - (a) for Elimination (removing hazard)
    - (b) for Substitution (replacing hazard)
    - (c) for Engineering controls (guards, barricades, isolation, design)
    - (d) for Administrative controls (SOPs, training, schedules, signs, briefings)
    - (e) for PPE (goggles, vests, gloves, boots)
    DO NOT use alphabetical lists (like f, g, h, i, j, k, l, m, n, o, p, etc.) to list mitigations. Every action must start with exactly one of: (a), (b), (c), (d), or (e).
    Example: \"(c) Install safety barriers (d) Conduct safety training (e) Wear safety boots\"",
  "residual_likelihood": 1-5 integer representing likelihood after mitigations,
  "residual_severity": 1-5 integer representing severity after mitigations,
  "remarks": "Additional notes, audit targets, or standard SOP codes",
  "target_date": "YYYY-MM-DD date or 'Ongoing'",
  "department_responsible": "The team or department in charge of execution"
}

Notes for scoring:
- Likelihood and Severity are integer scales of 1 to 5.
- Residual scores must be lower than or equal to initial scores.

Reference Safety Regulations (RAG Context):
""" + rag_context + """

Important Instruction for RAG Context:
If the RAG Context above states that no matching guidelines were found, or contains topics completely unrelated to the user's prompt (e.g. runway/airside topics for terminal/baggage queries), do NOT use them. Instead, rely on standard airport safety protocols, ICAO/FAA guidelines, and generic best practices corresponding to the user's requested scenario.

Provide exactly the JSON array. Do not wrap the JSON output in backticks, markdown markers, or write introductory/concluding remarks. Only output the JSON array.
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate a detailed HIRAC table for this scenario: {req.incident_prompt} at location {req.location} for {req.department} department."}
            ],
            temperature=0.2,
            max_tokens=2548,
        )
        
        content = response.choices[0].message.content.strip()
        
        # Sanitize markdown wrapper if LLM returned it anyway
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        rows = json.loads(content)
        
        # Compute Risk scores and indices on server side to guarantee mathematical correctness
        for i, row in enumerate(rows):
            # Safe parsing of ratings
            init_l = int(row.get("initial_likelihood", 3))
            init_s = int(row.get("initial_severity", 3))
            res_l = int(row.get("residual_likelihood", 2))
            res_s = int(row.get("residual_severity", 2))
            
            # Enforce 1-5 boundaries
            init_l = max(1, min(5, init_l))
            init_s = max(1, min(5, init_s))
            res_l = max(1, min(5, res_l))
            res_s = max(1, min(5, res_s))
            
            init_score = init_l * init_s
            res_score = res_l * res_s
            
            row["initial_likelihood"] = init_l
            row["initial_severity"] = init_s
            row["initial_risk_score"] = init_score
            row["initial_risk_index"] = calculate_risk_level(init_score)
            
            row["residual_likelihood"] = res_l
            row["residual_severity"] = res_s
            row["residual_risk_score"] = res_score
            row["residual_risk_index"] = calculate_risk_level(res_score)
            row["row_order"] = i + 1
            
            # Sanitize target_date: only keep YYYY-MM-DD, convert everything else to None
            td = row.get("target_date", "")
            if td and isinstance(td, str):
                import re
                if not re.match(r'^\d{4}-\d{2}-\d{2}$', td.strip()):
                    row["target_date"] = None
            
        return rows
        
    except json.JSONDecodeError as je:
        print(f"Failed to parse JSON from Groq: {content}")
        raise HTTPException(status_code=500, detail="The AI returned an invalid table format. Please try again.")
    except Exception as e:
        print(f"Error generating HIRAC: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat_agent(req: ChatRequest):
    if not groq_client:
        raise HTTPException(status_code=500, detail="Groq API client is not configured.")
    
    # 1. Fetch relevant manual contexts based on user's query
    rag_context = search_safety_guidelines(req.message, limit=2)
    
    # 2. Build system instruction
    system_prompt = """You are SAFIRA, an AI Safety Assistant at the airport. You help the safety officer review, modify, or verify the HIRAC (Hazard Identification, Risk Assessment & Control) report.

You have access to the current state of the HIRAC table.
The current table has the following data (represented in JSON format):
""" + json.dumps(req.current_table, indent=2) + """

We also queried our airport safety manuals (RAG Context):
""" + rag_context + """

When suggesting edits, generating new rows, or modifying mitigating actions, you MUST prefix each mitigation action with its corresponding Hierarchy of Controls category letter:
- (a) for Elimination (removing hazard)
- (b) for Substitution (replacing hazard)
- (c) for Engineering controls (guards, barricades, isolation, design)
- (d) for Administrative controls (SOPs, training, schedules, signs, briefings)
- (e) for PPE (goggles, vests, gloves, boots)
DO NOT use alphabetical lists (like f, g, h, i, j, k, l, m, n, o, p, etc.) to list mitigations. Every action must start with exactly one of: (a), (b), (c), (d), or (e).

Your responses can:
1. Explain safety rules, ICAO/FAA regulations, or risk classifications.
2. Suggest edits to the table rows.
3. Generate direct table modification payloads. If the user asks you to change information in the table (e.g. "change residual risk of row 1 to Low", "add a new row for bird strikes", "modify mitigating actions for row 2", "fix control letters on row 1"), you must answer the user, and ALSO include a special JSON command block at the end of your message.

The JSON command block should look like this (starts and ends with unique boundary tags):
[TABLE_UPDATE_PAYLOAD]
{
  "action": "modify_row" | "add_row" | "delete_row",
  "row_index": 0-indexed index of row (for modify_row or delete_row),
  "data": {
    ... (fields you want to update in the row, e.g. "residual_likelihood": 2, or full fields for add_row, with mitigating_actions correctly prefixed as described above)
  }
}
[/TABLE_UPDATE_PAYLOAD]

If they just ask a general question, do NOT include the [TABLE_UPDATE_PAYLOAD] block.
Be helpful, professional, and precise. Always reference standard procedures from the RAG context if applicable.
"""

    messages = [{"role": "system", "content": system_prompt}]
    
    # Add conversation history
    for msg in req.chat_history[-6:]:  # Keep last 6 exchanges for context
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    # Add current query
    messages.append({"role": "user", "content": req.message})

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.3,
            max_tokens=1500,
        )
        
        reply = response.choices[0].message.content
        return {"response": reply}
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "ok", "supabase_connected": supabase is not None, "groq_connected": groq_client is not None}
