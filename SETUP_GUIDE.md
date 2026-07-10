# SAFIRA Setup & Configuration Guide

Welcome to the SAFIRA HIRAC Report Generator project. Since you are using Supabase and Groq for the first time, this guide will walk you through setting up both platforms step-by-step.

---

## 1. Getting Your Groq API Key

Groq provides extremely fast Llama-3 inference which powers SAFIRA's report generation and conversational chatbot.

1. Go to the **[Groq Console](https://console.groq.com/)**.
2. Log in or create an account if you haven't already.
3. In the left navigation sidebar, click on **API Keys**.
4. Click the **Create API Key** button.
5. In the dialog, give your key a friendly name (e.g., `SAFIRA_Local`).
6. Click **Generate**.
7. **Important**: Copy the generated API key immediately (it looks like `gsk_...`). You will not be able to see it again. Store it temporarily in a text editor.

---

## 2. Setting Up Your Supabase Database

Supabase is your PostgreSQL database. Follow these steps to set up the database tables and enable the vector search extension (used for searching safety manuals in the RAG chatbot).

1. Go to the **[Supabase Dashboard](https://supabase.com/)**.
2. Click **New Project** and select your organization.
3. Fill in the project details:
   - **Name**: `safira-safety`
   - **Database Password**: (Create a secure password and save it)
   - **Region**: Select the region closest to you.
   - Click **Create new project**. It will take a minute or two to provision the database.
4. Once the database is ready, look at the left sidebar menu and click on the **SQL Editor** icon (represented by `>_` or a page with a play button).
5. Click **New query** (or **New blank query**).
6. Open the file [migrations.sql](file:///d:/Coding/Client%20Kearck/migrations.sql) in this repository, select all text, and copy it.
7. Paste the copied SQL code into the Supabase SQL editor.
8. Click the **Run** button at the top right of the editor.
9. Verify that the output shows `Success`. This created:
   - The vector search extension.
   - The `hirac_reports` table (meta information).
   - The `hirac_rows` table (hazard data).
   - The `safety_documents` table (embedded manuals).

---

## 3. Configuring Environment Variables (`.env` Files)

Environment variables are configuration settings that keep your API keys and secrets safe. We use them so you don't hardcode keys into your source files.

We will create `.env` files for each service. Here is how they should look:

### A. Python AI Service (`backend-python/.env`)
Create a file named `.env` inside the `backend-python/` folder and paste the following:

```env
GROQ_API_KEY=your_copied_groq_api_key_here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_service_role_key_here
```
> **How to get Supabase keys**: In Supabase, go to **Project Settings** (gear icon) -> **API**. Copy the **Project URL** and the **service_role** key (secret key used for inserting vector database chunks).

### B. Node.js Gateway (`backend-node/.env`)
Create a file named `.env` inside the `backend-node/` folder and paste the following:

```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
PYTHON_SERVICE_URL=http://localhost:8000
```
> **Anon Key**: In Supabase under **Project Settings** -> **API**, copy the **anon / public** key.

### C. React Frontend (`frontend/.env`)
Create a file named `.env` inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

---

## 4. How to Upload Documents for the Chatbot (RAG)

The RAG chatbot retrieves context from airport safety manuals. To import these:
1. Put any safety manual files (in Text or PDF format) into the folder `backend-python/documents/` (we will create this folder).
2. We will provide a Python script `ingest.py` inside `backend-python/`.
3. You can run `python ingest.py` from your terminal to read those documents, split them into chunks, convert them into vector embeddings, and save them automatically to Supabase.
4. Once completed, your chatbot will know everything about your airport rules and SOPs!
