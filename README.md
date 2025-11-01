# RAG-QA-PDF

**LangChain-inspired Retrieval-Augmented Generation (RAG) System for PDF Question Answering**

This project implements a complete retrieval-augmented generation (RAG) pipeline that extracts text from uploaded PDF documents, stores semantic embeddings in a vector database, and answers user questions grounded in the retrieved context.  
The entire stack operates locally using open-source transformer models, ensuring full data privacy and reproducibility.

## System Architecture

The application is structured as three containerized services orchestrated through Docker Compose.

| Service | Description | Port |
|----------|--------------|------|
| **Frontend (React + Vite)** | Interactive UI for uploading PDFs and querying the system. | 5173 |
| **Backend (Node.js + Express)** | Handles document parsing, embedding generation, retrieval, and answer synthesis. | 4000 |
| **Qdrant** | Vector database for storing and retrieving embeddings using cosine similarity. | 6333 |

All inference runs locally via **@xenova/transformers** with no external API dependencies.

## Key Features

1. **Document Ingestion**  
   - Accepts multiple PDF files.  
   - Extracts text using `pdf-parse` and chunks it for vectorization.  
   - Each chunk is stored in Qdrant with metadata for traceability.

2. **Embedding and Retrieval**  
   - Generates embeddings using `all-MiniLM-L6-v2` (384 dimensions).  
   - Performs similarity search through the Qdrant REST API.  
   - Returns relevant context passages ranked by semantic proximity.

3. **Answer Generation**  
   - Uses `flan-t5-base` to synthesize grounded responses from retrieved text.  
   - Provides fallback “I don’t know.” responses when evidence is insufficient.

4. **Frontend Experience**  
   - Clean, centered, responsive UI built with React + Vite.  
   - Displays uploaded documents, generated answers, and cited sources.  
   - Fully local operation—no remote API calls or data sharing.

5. **Containerized Execution**  
   - Reproducible builds using Docker Compose.  
   - Isolation of backend, frontend, and database services.

## Directory Overview
```bash
RAG-QA-PDF/
│
├── docker-compose.yml
│
├── backend/
│ ├── Dockerfile
│ ├── package.json
│ └── src/
│ ├── server.js
│ ├── store.js
│ ├── cache.js
│ ├── pipeline.js
│ ├── chunk.js
│ ├── log.js
│ └── .env.example
│
└── frontend/
├── Dockerfile
├── vite.config.js
├── index.html
├── package.json
└── src/
├── components/
│ ├── Header.jsx
│ ├── QueryForm.jsx
│ ├── AnswerCard.jsx
│ ├── SourceList.jsx
│ └── Analytics.jsx
├── App.jsx
├── main.jsx
├── api.js
└── styles.css
```

## Installation and Execution

### Prerequisites
- Docker Desktop (v4.25 or later)  
- Node.js (v20+) (optional, if running without containers)

### Setup
```bash
git clone https://github.com/<your-username>/RAG-QA-PDF.git
cd RAG-QA-PDF
docker compose up --build
```
Access points:

- Frontend → http://localhost:5173

- Backend health → http://localhost:4000/api/health

- Qdrant Dashboard → http://localhost:6333/dashboard

To stop all containers:
```
docker compose down -v
```
## Results Gallery

Below are representative screenshots from the deployed system demonstrating retrieval-augmented question answering, multi-PDF handling, and vector database integration.

### 1. Deadline Query – Context-Grounded Answer Generation
The system accurately extracts and returns project milestones from the uploaded **Deadlines.pdf**, showing successful text parsing, embedding retrieval, and generative response.

![Deadline Query](./assets/Screenshot-2025-11-01-132205.png)


### 2. Conceptual QA – Domain Understanding Across Multiple PDFs
The second example shows a conceptual query (*“cloud storage advantages and disadvantages”*) combining knowledge from **CC-Data Storage.pdf** and **Deadlines.pdf**.  
This illustrates multi-document retrieval and coherent summarization using the local FLAN-T5 model.

![Cloud Storage QA](./assets/Screenshot-2025-11-01-132247.png)


### 3. Qdrant Vector Store – Embedded Knowledge Base
The **Qdrant Dashboard** confirms that embeddings were successfully created and stored under the `pdf_docs` collection (384-dimensional vectors, cosine similarity).  
This verifies that the backend indexing pipeline and retrieval operations are functioning correctly.

![Qdrant Dashboard](./assets/Screenshot-2025-11-01-132327.png)


### Summary of Demonstrated Capabilities
- End-to-end retrieval-augmented pipeline operating entirely locally  
- Accurate extraction and response synthesis from domain PDFs  
- Seamless React interface with indexed document tracking  
- Verified vector persistence within Qdrant for reproducible queries


## Usage

1. Open the interface at **[http://localhost:5173](http://localhost:5173)**.  
2. Upload one or more text-based PDF documents.  
3. Enter a natural-language question (e.g., *“What are the project deliverables?”*).  
4. The backend will parse, embed, retrieve, and generate a response using the uploaded material.  
5. The interface displays the synthesized answer along with the referenced source documents.


## Technical Highlights

- Fully local RAG pipeline using **@xenova/transformers** for both embedding and generation  
- **Qdrant** vector storage with cosine similarity search  
- **LRU-based caching** layer for repeated queries  
- Modular **React component** architecture  
- Production-grade **Docker environment** for consistent deployment


## Potential Extensions

- OCR support for scanned documents using `tesseract.js`  
- Persistent volume for long-term vector storage  
- Session management for multi-user environments  
- Integration with alternative local models or **Ollama** runtime  
- Advanced reranking of retrieval results with **cross-encoders**



## License

Open-source for academic and demonstrative use.  
Models and dependencies remain subject to their respective open licenses (**Qdrant**, **FLAN-T5**, **all-MiniLM**).
