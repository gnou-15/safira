# Safira

### Description
Safira is an AI-powered Airport Safety & HIRAC (Hazard Identification, Risk Assessment & Control) Report Generator and Aviation Incident Investigation platform. It features RAG (Retrieval-Augmented Generation) trained on airport safety manuals, real-time live document synchronization via AI chat action payloads, passwordless mnemonic key authentication (`AAA-000`), multi-layer prompt injection defense, automated 5x5 matrix risk calculations, and an interactive 3D perspective backdrop.

---

## ⏱️ Development Time
> **~38 hours** of active development across 6 coding sessions *(July 10 – July 20, 2026)*

---

## 🛠️ Technologies
*   **Frontend:** React 19, Vite 8, JavaScript (ES6+), Vanilla CSS, `html2pdf.js`
*   **Backend (Node.js Gateway):** Node.js, Express, Axios, CORS, Dotenv, Supabase JS Client
*   **Backend (Python AI Service):** FastAPI, Uvicorn, Pydantic, Groq SDK (Llama 3.3 70B Versatile), `sentence-transformers` (`all-MiniLM-L6-v2`), `pypdf`
*   **Database & RAG:** Supabase (PostgreSQL), `pgvector` extension, PL/pgSQL Stored Procedures (`match_documents`)
*   **Auth & Security:** Custom Mnemonic Key Generator (`AAA-000`), bcrypt password hashing, JWT authentication, Regex Prompt Injection Filters, Response Guardrails

---

## 🌟 Features
1.  **Automated HIRAC & Incident Investigation Generation:** Instantly creates structured 12-column HIRAC tables and complete 6-section Aviation Incident Investigation reports tailored to airport operations using Groq Llama 3.3 70B.
2.  **Vector-Embedded RAG Safety Manual Context:** Ingests PDF and TXT airport safety manuals, chunking and embedding them locally into a 384-dimensional `pgvector` database to ground AI suggestions in real regulatory SOPs.
3.  **Real-Time Live Document Synchronization via Chat:** An interactive AI safety assistant (SAFIRA) capable of outputting structured JSON payload blocks (`[TABLE_UPDATE_PAYLOAD]` & `[INVESTIGATION_UPDATE_PAYLOAD]`) that modify rows and fields directly inside the active document.
4.  **Multi-Layer Prompt Injection & Guardrail Defense:** 4-layer defense system combining strict XML system directives, zero-width unicode input sanitization, vector thresholding, and output allowlist validation against jailbreak attempts.
5.  **Passwordless Mnemonic Key Authentication (`AAA-000`):** Zero-trust account access using generated 6-character mnemonic keys with smooth key cylinder turning animations, input auto-formatting, and persistent keyhole quick-login widgets.
6.  **Hierarchy of Controls & 5x5 Risk Matrix Enforcement:** Automatically validates mitigation actions against Hierarchy of Controls prefixes `(a)` to `(e)` while calculating initial and residual 5x5 matrix risk codes (`Extreme`, `High`, `Moderate`, `Low`) server-side.

---

## ⌨️ Keyboard Shortcuts & Input Masking
*   `Auto-formatting Key Input` — Automatically capitalizes input and injects a hyphen after the 3rd character (`AAA-000`) for seamless key entry.
*   `Print / PDF Export` — Automatically hides UI navigation, borders, and controls to generate print-ready PDF reports matching official aviation authority formats.

---

## 🔄 The Process
1.  **Full-Stack Architecture:** Architected a dual-backend model using a Node.js Express API Gateway for state/auth management paired with a high-performance Python FastAPI service dedicated to AI generation, embedding extraction, and output validation.
2.  **RAG Manual Ingestion Pipeline:** Built a document processing script that parses aviation manuals into semantic chunks, generates vector embeddings via `SentenceTransformer`, and stores them in Supabase vector tables.
3.  **Chat-to-Document Action Bridge:** Designed a bidirectional event pattern where AI chat responses serialize target operations into custom tags, allowing the frontend to mutate document state non-destructively in real-time.
4.  **Hardened AI Security:** Implemented multi-tiered input sanitization and output validation pipelines to prevent context stuffing, system prompt leaking, and off-topic AI responses.

---

## 🧠 What I Learned

🔐 **Prompt Injection Defense & LLM Security:**
*   **Multi-Layer Guardrail Engineering**: Implemented a 4-tier defense architecture using XML system directive boundaries (`<SYSTEM_DIRECTIVE>`), unicode character stripping in Python (`unicodedata`), regex intent detectors (`prompt_guard.py`), and post-generation response validators (`response_validator.py`) to restrict AI output strictly to safety topics.

📡 **Vector Search & RAG Architectures:**
*   **Supabase pgvector & Semantic Search**: Built an end-to-end Retrieval-Augmented Generation pipeline using `sentence-transformers` (`all-MiniLM-L6-v2`) to generate 384-dimensional vector embeddings of airport safety manuals, querying them in Supabase via custom PL/pgSQL cosine similarity functions (`match_documents`).

⚡ **State Synchronization & AI Payloads:**
*   **Structured Action Payload Parsing**: Engineered a live document mutation pattern where LLM responses deliver tagged JSON action blocks (`[TABLE_UPDATE_PAYLOAD]`), enabling the React frontend to parse and apply granular CRUD updates to specific HIRAC rows or investigation fields without full re-renders.

📊 **Risk Matrix & Hierarchy Heuristics:**
*   **ICAO 5x5 Safety Calculation Engine**: Developed server-side risk evaluation logic mapping 5x5 Likelihood x Severity matrices into standardized risk indices (`5A` to `1E`) while validating mitigating actions against strict Hierarchy of Controls standards (`(a)` Elimination through `(e)` PPE).

🎨 **Interactive 3D UI & Micro-Interactions:**
*   **Perspective Canvas & Particle Physics**: Created a mouse-tracking 3D perspective grid (`InteractiveAuthPattern`) featuring dynamic spotlight gradients, 14-degree tilt calculations, click ripple waves, and smooth key cylinder turn animations during authentication.

🔑 **Mnemonic Key Authentication:**
*   **Passwordless Mnemonic Identity Systems**: Designed a lightweight zero-trust authentication mechanism generating unique formatted alphanumeric key pairs (`AAA-000`), storing hashed credentials in Supabase while managing session tokens via JWT.

---

## 📈 Overall Growth
Developing Safira expanded my full-stack capabilities into AI engineering, vector databases, and real-time state synchronization. Building RAG pipelines, hardening LLM microservices against prompt injection, and binding AI action payloads directly to live document interfaces equipped me with deep expertise in designing secure, production-grade AI web applications.

---

## 💡 How Can It Be Improved
*   **Multi-User Real-Time Collaboration:** Integrate Supabase Realtime / WebSockets so safety officers and airport managers can edit HIRAC reports simultaneously.
*   **OCR Manual Ingestion:** Add optical character recognition (Tesseract / EasyOCR) for scanned paper manuals and physical incident photos.
*   **Custom Risk Matrix Configuration:** Allow administrators to customize matrix severity rules, color themes, and departmental SOP taxonomies per airport authority.

---

## 🚀 How to Run the Project

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   Supabase Account
*   Groq API Key

### 1. Database Setup
1. Log in to your **Supabase Console**.
2. Open the **SQL Editor** and execute the schema definitions inside [migrations.sql](file:///d:/Coding/Client%20Kearck/migrations.sql) to enable `pgvector` and provision tables (`safira_users`, `hirac_reports`, `hirac_rows`, `investigation_reports`, `safety_documents`) and vector match procedures (`match_documents`).

### 2. Python AI Service Setup
1. Navigate to the `backend-python/` directory:
    ```bash
    cd backend-python
    ```
2. Create a virtual environment and install dependencies:
    ```bash
    python -m venv .venv
    # Windows:
    .venv\Scripts\activate
    pip install -r requirements.txt
    ```
3. Create a `.env` file inside `backend-python/`:
    ```env
    GROQ_API_KEY=your_groq_api_key
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_KEY=your_supabase_service_role_key
    ```
4. Start the FastAPI microservice:
    ```bash
    uvicorn app:app --reload --port 8000
    ```

### 3. Node.js API Gateway Setup
1. Navigate to the `backend-node/` directory:
    ```bash
    cd backend-node
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file inside `backend-node/`:
    ```env
    PORT=5000
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_ANON_KEY=your_supabase_anon_public_key
    PYTHON_SERVICE_URL=http://localhost:8000
    JWT_SECRET=your_jwt_secret_key
    ```
4. Start the API Gateway:
    ```bash
    npm run dev
    ```

### 4. Frontend Setup
1. Navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2. Create a `.env` file inside `frontend/`:
    ```env
    VITE_API_URL=http://localhost:5000
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
    ```
3. Install dependencies and start the dev server:
    ```bash
    npm install
    npm run dev
    ```

---
## 🍿Video
