import os
import sys
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from supabase import create_client, Client
# pyrefly: ignore [missing-import]
from sentence_transformers import SentenceTransformer
# pyrefly: ignore [missing-import]
from pypdf import PdfReader

# Load environment variables
load_dotenv()

# Check credentials
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")  # Needs service_role key to bypass RLS and insert data

if not supabase_url or not supabase_key:
    print("Error: SUPABASE_URL and SUPABASE_KEY (service_role) must be set in .env file.")
    sys.exit(1)

# Initialize Supabase
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize Embeddings model
print("Loading sentence-transformers/all-MiniLM-L6-v2...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Create documents directory if it doesn't exist
DOCS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "documents")
if not os.path.exists(DOCS_DIR):
    os.makedirs(DOCS_DIR)
    print(f"Created documents directory at: {DOCS_DIR}")
    print("Place PDF or TXT safety manuals in this directory and re-run ingest.py")
    sys.exit(0)


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> list:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks


def process_pdf(file_path: str) -> str:
    print(f"Reading PDF: {os.path.basename(file_path)}")
    try:
        reader = PdfReader(file_path)
        full_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                full_text.append(text)
        return "\n".join(full_text)
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
        return ""


def process_txt(file_path: str) -> str:
    print(f"Reading Text: {os.path.basename(file_path)}")
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception as e:
        print(f"Error reading Text file {file_path}: {e}")
        return ""


def main():
    files = [f for f in os.listdir(DOCS_DIR) if f.lower().endswith(('.pdf', '.txt'))]
    
    if not files:
        print(f"No PDF or TXT files found in: {DOCS_DIR}")
        print("Please add your airport safety SOPs or manual files here.")
        return

    print(f"Found {len(files)} files to process in {DOCS_DIR}")
    
    for filename in files:
        file_path = os.path.join(DOCS_DIR, filename)
        
        # 1. Extract text based on extension
        if filename.lower().endswith('.pdf'):
            text_content = process_pdf(file_path)
        else:
            text_content = process_txt(file_path)
            
        if not text_content.strip():
            print(f"Skipping {filename}: No text content extracted.")
            continue
            
        # 2. Split into chunks
        chunks = chunk_text(text_content)
        print(f"Split {filename} into {len(chunks)} chunks.")
        
        # 3. Clear existing chunks for this file to prevent duplicates
        try:
            print(f"Clearing old database chunks for {filename}...")
            supabase.table("safety_documents").delete().eq("document_name", filename).execute()
        except Exception as e:
            print(f"Warning: Failed to clear old chunks for {filename}: {e}")

        # 4. Create embeddings and upload to Supabase
        uploaded_count = 0
        for i, chunk in enumerate(chunks):
            try:
                # Compute embedding vector (384 dimensions)
                embedding_vector = embedding_model.encode(chunk).tolist()
                
                # Insert into Supabase safety_documents table
                data = {
                    "document_name": filename,
                    "content": chunk,
                    "embedding": embedding_vector,
                    "metadata": {"chunk_index": i, "file_path": file_path}
                }
                
                response = supabase.table("safety_documents").insert(data).execute()
                uploaded_count += 1
            except Exception as e:
                print(f"Error uploading chunk {i} of {filename}: {e}")
                
        print(f"Successfully ingested {uploaded_count}/{len(chunks)} chunks for {filename}.")


if __name__ == "__main__":
    main()
