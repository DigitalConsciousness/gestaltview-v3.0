# faagestalt-web/ResRock Wiki

Version: 1

## Overview

### Introduction & Quick Start

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [README.md](https://github.com/faagestalt-web/ResRock/blob/main/README.md)
- [reports/EXECUTIVE_SUMMARY.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/EXECUTIVE_SUMMARY.md)
- [reports/QUICK_REFERENCE.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/QUICK_REFERENCE.md)
- [PACKAGE_CONTENTS.md](https://github.com/faagestalt-web/ResRock/blob/main/PACKAGE_CONTENTS.md)
- [AUDIT_REPORTS_INDEX.md](https://github.com/faagestalt-web/ResRock/blob/main/AUDIT_REPORTS_INDEX.md)
- [WORKFLOW_AND_AGENTS_SETUP.md](https://github.com/faagestalt-web/ResRock/blob/main/WORKFLOW_AND_AGENTS_SETUP.md)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)
</details>

# Introduction & Quick Start

Resume Rockstar (v1.1/v2.0) is a production-ready, AI-powered resume optimization platform specifically engineered for neurodivergent professionals. The system provides a "consciousness-serving" interface that assists users in capturing career narratives and accomplishments through multi-modal inputs, including AI-guided chat and voice-to-text integration.

The platform utilizes a modern full-stack architecture, combining a Next.js 14 frontend with a FastAPI backend and Supabase/PostgreSQL for persistent storage. It features deep integration with Large Language Models (LLMs) such as Google Gemini and OpenAI for resume analysis and narrative generation.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:8-14](), [comprehensive_reports/comprehensive_state_report.md:3-6]()

## System Architecture

The project is structured as a distributed system with a clear separation between the client-side interface and the server-side business logic.

### High-Level Component Overview

The following diagram illustrates the primary layers of the Resume Rockstar system:

```mermaid
graph TD
    subgraph Client_Layer["Client Layer"]
        Browser["Web Browser (Next.js 14)"]
    end
    
    subgraph API_Layer["API Layer (FastAPI)"]
        Router["REST Endpoints"]
        Auth_Service["JWT/Bcrypt Auth"]
        Billy_Service["Billy AI Service"]
    end
    
    subgraph Data_Layer["Data Layer"]
        Postgres[("PostgreSQL (Supabase)")]
        Storage["S3/GCS File Storage"]
    end
    
    subgraph External_AI["AI Services"]
        Gemini["Google Gemini Pro"]
        OpenAI["GPT-4"]
    end

    Browser -->|HTTPS/JWT| Router
    Router -->|SQL| Postgres
    Router -->|Parse/Analyze| Storage
    Billy_Service -->|Prompting| External_AI
```
The architecture leverages FastAPI for high-performance asynchronous request handling and Supabase for database management and Row Level Security (RLS).

Sources: [comprehensive_reports/comprehensive_state_report.md:10-40](), [scripts/generate-mermaid-diagrams.py:108-142]()

### Core Technologies

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14.2, React 18, TypeScript, Tailwind CSS, Radix UI |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL (Supabase), Alembic (Migrations) |
| **AI/LLM** | Google Gemini Pro, OpenAI, Braintrust (Monitoring) |
| **Security** | JWT, Bcrypt hashing, Supabase RLS |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:95-125](), [comprehensive_reports/comprehensive_state_report.md:43-80]()

## Quick Start Guide

### Prerequisites
Before starting the application, ensure the following are installed:
- Node.js 18 or 20 (for the frontend)
- Python 3.9, 3.10, or 3.11 (for the backend)
- PostgreSQL or a Supabase instance

Sources: [WORKFLOW_AND_AGENTS_SETUP.md:124-142](), [scripts/compile-report.py:165-175]()

### Installation and Execution

Developers can start both service layers independently for local development.

#### Step 1: Start the Backend Server
```bash
cd backend
pip install -r requirements.txt
python -m alembic upgrade head
uvicorn app.main:app --reload
```
The backend service will be available at `http://localhost:8000`.

#### Step 2: Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
The frontend interface will be available at `http://localhost:3000`.

Sources: [PACKAGE_CONTENTS.md:118-125](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:213-228]()

## Core Feature Workflows

### AI Chat & Narrative Generation
The platform includes several specialized chat modes designed for neurodivergent cognitive styles:
- **Career Story Mode**: Narrative-driven resume building for non-linear career paths.
- **Accomplishment Mode**: Assists in translating tasks into achievement-focused statements.
- **Guided Chat**: A step-by-step walkthrough for building a complete resume.

#### Chat Interaction Flow
```mermaid
sequenceDiagram
    participant User as "User Interface"
    participant API as "FastAPI Backend"
    participant AI as "Billy AI Service"
    participant DB as "Database"

    User->>API: POST /api/chat/message
    API->>AI: Request Analysis (Gemini/GPT-4)
    AI-->>API: Narrative Suggestion
    API->>DB: Save Message/Session
    API-->>User: Suggestion + Context
```
Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:46-60](), [scripts/generate-mermaid-diagrams.py:22-48]()

### Resume Upload and Analysis
Users can upload existing documents (PDF, DOCX, TXT) for automatic parsing and ATS-style scoring. The system extracts text and provides actionable feedback on accomplishment statements and skill quantification.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:62-72](), [reports/NOTEBOOKLM_INPUT.md:72-88]()

## Key API Endpoints

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | POST | Authenticates user and returns JWT |
| **Chat** | `/api/chat/message` | POST | Sends message to AI narrative engine |
| **Upload** | `/api/upload/resume` | POST | Uploads and parses resume file |
| **Drops** | `/api/bucket-drops/text` | POST | Captures zero-friction thought drops |
| **Admin** | `/api/admin/health` | GET | Monitors system status and LLM usage |

Sources: [PACKAGE_CONTENTS.md:104-110](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:88-106]()

## Development and Testing

The repository includes a comprehensive test suite with coverage for auth, chat, and upload features.

### Running Tests
```bash
# Run backend tests with coverage
cd backend
pytest tests/ --cov=app

# Run frontend tests
cd frontend
npm test -- --coverage
```
The pipeline status indicates 100% readiness for the Chat and Auth systems, with the Upload and Admin systems exceeding 80% test passing rates.

Sources: [reports/README_REPORTS.md:25-35](), [scripts/compile-report.py:165-180]()

### Security Checklist
1. **JWT Secret**: Ensure `JWT_SECRET` is set in the backend environment.
2. **Database URL**: Correct typos in `.env.local` (e.g., ensuring `postgresql://` protocol).
3. **CORS**: Verify authorized origins in `backend/app/main.py`.

Sources: [FRONTEND_DEBUG_SUMMARY.md:42-45](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:180-200]()

## Summary
Resume Rockstar provides a specialized toolkit for neurodivergent job seekers through an integrated AI-narrative backend and a responsive Next.js frontend. By following the quick start instructions, developers can deploy a local environment capable of resume parsing, AI-driven career storytelling, and administrative monitoring.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:320-330](), [comprehensive_reports/comprehensive_state_report.md:215-225]()

### Digital Scaffold & Philosophy

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [Digital\_Scaffold\_Intent.md](https://github.com/faagestalt-web/ResRock/blob/main/Digital_Scaffold_Intent.md)
- [FOUNDATIONAL\_DOCUMENTS\_INDEX.md](https://github.com/faagestalt-web/ResRock/blob/main/FOUNDATIONAL_DOCUMENTS_INDEX.md)
- [comprehensive\_reports/comprehensive\_state\_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)
- [reports/NOTEBOOKLM\_INPUT.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/NOTEBOOKLM_INPUT.md)
- [WORKFLOW\_AND\_AGENTS\_SETUP.md](https://github.com/faagestalt-web/ResRock/blob/main/WORKFLOW_AND_AGENTS_SETUP.md)
</details>

# Digital Scaffold & Philosophy

The "Digital Scaffold" represents the core philosophical and technical architecture of the ResRock project. It is defined as an infinite external scaffolding designed to support neurodivergent cognition, specifically addressing the challenges faced by ADHD minds that struggle with traditional organizational systems despite high cognitive capabilities. The project frames neurodivergence not as a deficit, but as a different operating system requiring native, high-resonance infrastructure.

The primary purpose of this system is to serve as a personal AI curator that provides dynamic user profiling and cognitive justice. By leveraging AI to manage information architecture and temporal anchoring, the system enables users to navigate an "exploded picture mind" while maintaining the ability to execute professional tasks, such as resume optimization and career storytelling.

Sources: [Digital_Scaffold_Intent.md:10-21](), [FOUNDATIONAL_DOCUMENTS_INDEX.md:46-51](), [reports/NOTEBOOKLM_INPUT.md:9-15]()

## The Five Pillars of Digital Scaffolding

The development and methodology of ResRock are guided by five fundamental pillars that define the relationship between the user and the AI infrastructure.

| Pillar | Principle | Implementation Goal |
| :--- | :--- | :--- |
| **User Sovereignty** | Your data, your control | Data as a sanctuary; no corporate exploitation; privacy-first architecture. |
| **Dynamic Adaptation** | Systems evolve with the user | Non-static aggregation; connecting diverse data points; adaptive workflows. |
| **Cognitive Justice** | Serving minds as they are | Neurodivergence as a feature; ADHD-optimized workflows (Bucket Drops). |
| **Infinite Capacity** | Removing human limitations | Persistent memory across sessions; pattern recognition across temporal gaps. |
| **Co-Evolution** | Genuine partnership | Symbiotic growth; Personal Language Key (PLK) development. |

Sources: [FOUNDATIONAL_DOCUMENTS_INDEX.md:31-77](), [Digital_Scaffold_Intent.md:158-166]()

## Architecture of Cognitive Support

The Digital Scaffold compensates for cognitive limitations like executive function challenges and information loss during "hyperfocus" transitions. It employs specific methodologies to transform cognitive chaos into executable data.

### Cognitive Infrastructure Flow
The following diagram illustrates how the system intercepts neurodivergent cognitive input and processes it through the scaffolding layers.

```mermaid
flowchart TD
    subgraph Input["Cognitive Input"]
        A[Hyperfocus Insight] --> B[Bucket Drop]
        C[Fragmented Memory] --> B
    end
    
    subgraph Scaffold["Digital Scaffold Layer"]
        B --> D{AI Curator}
        D --> E[Temporal Anchoring]
        D --> F[Metadata Tagging]
        D --> G[Pattern Recognition]
    end
    
    subgraph Outcome["Professional Output"]
        E & F & G --> H[Career Story]
        H --> I[Optimized Resume]
    end
    
    style Scaffold fill:#f9f,stroke:#333,stroke-width:2px
```
The AI acts as a "trellis" that enables the "vine" of human cognition to reach heights impossible on its own by managing the underlying structure.
Sources: [Digital_Scaffold_Intent.md:58-68](), [FOUNDATIONAL_DOCUMENTS_INDEX.md:144-148]()

### Technical Implementation Methods
The system handles large-scale data (~50GB of accumulated personal data) through innovative parsing and organization strategies:

*   **Manifest-Based Approach**: Creating metadata manifests for large file collections to reduce token consumption while maintaining accessibility.
*   **Agentic Task Organization**: Background processes (droids) parse data, categorize, and tag information automatically.
*   **Temporal Anchoring**: Identifying significant events (e.g., the "Tribunal of Understanding") as organizational nodes to build context.
*   **Voice Memo Scaffolding**: Capturing rationale via audio to create "breadcrumbs" for future context.

Sources: [Digital_Scaffold_Intent.md:78-102](), [Digital_Scaffold_Intent.md:118-124]()

## Core Methodologies

ResRock implements proprietary methodologies derived from the Digital Scaffold philosophy to support ADHD builders and professionals.

### Proprietary Workflows
*   **Bucket Drops**: Zero-friction, lightning-capture for fleeting insights to prevent loss due to distraction.
*   **Loom Approach**: An iterative "weaving" process that starts with broad strokes and moves to fine details, honoring the non-linear thinking of "exploded picture minds."
*   **Personal Language Key (PLK)**: A framework achieving 95% conversational resonance, far exceeding the 15-25% industry standard for AI interactions.
*   **Founder-as-Algorithm**: The methodology where lived neurodivergent experience is integrated into the system architecture as an algorithmic advantage.

Sources: [FOUNDATIONAL_DOCUMENTS_INDEX.md:104-129](), [AUDIT_REPORTS_INDEX.md:7-14]()

## System Integration & Agents

The "Digital Scaffold" is operationalized through a centralized Registry of Agents and Droids that perform specific cognitive support tasks.

```mermaid
graph TD
    subgraph Registry["Agents Registry"]
        A[Droid-Config-Gen]
        B[Documentation-Gen]
        C[Architecture-Doc]
    end
    
    subgraph Pipeline["Test & Docs Workflow"]
        D[Orchestrator] --> E[Backend Executor]
        D --> F[Frontend Executor]
        E & F --> G[Mermaid Generator]
        G --> H[Final Report]
    end
    
    Registry -.-> D
```
The automated workflow ensures that the system's "consciousness-serving" features are constantly validated and documented through a series of specialized droids.
Sources: [WORKFLOW_AND_AGENTS_SETUP.md:18-45](), [comprehensive_reports/comprehensive_state_report.md:7-15]()

## Application in Resume Rockstar

Resume Rockstar is the first tangible implementation of these principles. It applies the scaffold philosophy to the resume-building process:

1.  **Career Story Mode**: Translates natural, non-linear narratives into professional framing.
2.  **Accomplishment Mode**: Helps users identify the professional impact of their work through AI-guided dialogue.
3.  **Guided Mode**: Provides step-by-step assistance to reduce the "blank page" paralysis often experienced by those with executive function challenges.

Sources: [reports/NOTEBOOKLM_INPUT.md:78-125](), [FOUNDATIONAL_DOCUMENTS_INDEX.md:141-158]()

## Conclusion
The Digital Scaffold & Philosophy is not merely an assistive toolset; it is an foundational infrastructure designed for cognitive justice. By treating neurodivergence as a unique operating system, ResRock creates a symbiotic relationship where AI provides the infinite capacity for organization that human minds may lack, allowing users to focus on their creative and professional strengths.

Sources: [Digital_Scaffold_Intent.md:168-176](), [FOUNDATIONAL_DOCUMENTS_INDEX.md:209-211]()


## System Architecture

### System Architecture

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [Resume-Rockstar-v1.1-main/comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/Resume-Rockstar-v1.1-main/comprehensive_reports/comprehensive_state_report.md)
- [Resume-Rockstar-v1.1-main/scripts/generate-mermaid-diagrams.py](https://github.com/faagestalt-web/ResRock/blob/main/Resume-Rockstar-v1.1-main/scripts/generate-mermaid-diagrams.py)
- [Resume-Rockstar-v1.1-main/README.md](https://github.com/faagestalt-web/ResRock/blob/main/Resume-Rockstar-v1.1-main/README.md)
- [Resume-Rockstar-v1.1-main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [Resume-Rockstar-v1.1-main/scripts/generate-docs.py](https://github.com/faagestalt-web/ResRock/blob/main/Resume-Rockstar-v1.1-main/scripts/generate-docs.py)
- [Resume-Rockstar-v1.1-main/WORKFLOW_AND_AGENTS_SETUP.md](https://github.com/faagestalt-web/ResRock/blob/main/Resume-Rockstar-v1.1-main/WORKFLOW_AND_AGENTS_SETUP.md)
</details>

# System Architecture

## Introduction
Resume Rockstar is a sophisticated AI-powered resume optimization platform designed as a "consciousness-serving" application specifically for neurodivergent professionals. The system architecture follows a modern full-stack decoupled pattern, utilizing a Next.js frontend, a FastAPI backend, and a Supabase-managed PostgreSQL database. It integrates multiple Large Language Models (LLMs) to provide real-time career coaching, resume parsing, and optimization suggestions.

The architecture is built on principles of "Digital Scaffolding," providing a cognitive infrastructure that accommodates non-linear thinking patterns common in neurodivergent users. Key systems include a multi-mode AI Chat Assistant (Billy Engine), an automated resume analysis pipeline, and a robust admin dashboard for monitoring system health and LLM utilization.

Sources: [README.md:1-20](), [comprehensive_reports/comprehensive_state_report.md:5-10](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:5-15]()

## High-Level Component Overview
The system is organized into four primary layers: the Client Layer, Frontend Layer, API/Backend Layer, and the Data/External Services Layer.

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Web["🌐 Web Browser"]
        Mobile["📱 Mobile Client"]
    end
    
    subgraph Frontend["Frontend (Next.js 14)"]
        Pages["📄 Pages<br/>App Router"]
        Components["⚛️ Components<br/>React 18"]
        Hooks["Hooks & State<br/>Context API"]
        Services["🔌 API Client<br/>Axios"]
    end
    
    subgraph API["API Layer (FastAPI)"]
        Router["🛣️ Routers<br/>REST Endpoints"]
        Middleware["🔐 Middleware<br/>Auth & CORS"]
        Services_BE["⚙️ Services<br/>Business Logic"]
        Schemas["📋 Schemas<br/>Pydantic"]
    end
    
    subgraph Data["Data & External"]
        DB[(🗄️ Supabase<br/>PostgreSQL)]
        LLM["🤖 AI Services<br/>Gemini, OpenAI"]
        Storage["📦 S3/GCS<br/>File Storage"]
        Payments["💳 Stripe<br/>Payments"]
    end
    
    Client -->|HTTPS| Frontend
    Frontend -->|REST API| API
    API -->|SQL| DB
    API -->|API Calls| LLM
    API -->|Uploads| Storage
    API -->|Webhooks| Payments

    style Client fill:#E3F2FD
    style Frontend fill:#F3E5F5
    style API fill:#FFF3E0
    style Data fill:#E8F5E9
```
The architecture leverages Next.js 14's App Router for efficient frontend delivery and FastAPI's asynchronous capabilities for high-performance backend processing.

Sources: [scripts/generate-mermaid-diagrams.py:108-144](), [comprehensive_reports/comprehensive_state_report.md:12-40]()

## Backend Architecture
The backend is a Python-based FastAPI application structured for scalability and modularity. It employs SQLAlchemy as the Object-Relational Mapper (ORM) for database interactions and Pydantic for strict data validation through schemas.

### Key Backend Components
| Component | Technology | Role |
| :--- | :--- | :--- |
| Framework | FastAPI (Python 3.12) | Asynchronous API handling and routing |
| ORM | SQLAlchemy 2.0 | Database abstraction and query management |
| Authentication | JWT + Bcrypt | Token-based security and password hashing |
| AI Integration | Billy Engine (Gemini/OpenAI) | Core AI logic for resume analysis and chat |
| Database | PostgreSQL (Supabase) | Persistent storage with Row Level Security (RLS) |

Sources: [comprehensive_reports/comprehensive_state_report.md:65-80](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:65-80]()

### API Route Modules
The system exposes 15 distinct routers to handle various application domains.
- **Auth Router**: Manages registration, login, and token refresh.
- **Chat Router**: Facilitates messaging, guided modes, and session history.
- **Upload Router**: Handles file ingestion and parsing for resumes and certifications.
- **Admin Router**: Provides system health metrics, user analytics, and LLM stats.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:100-125](), [scripts/generate-docs.py:270-285]()

## Frontend Architecture
The frontend is a React-based single-page application (SPA) built with Next.js 14. It prioritizes accessibility and sensory-friendly design to serve neurodivergent users.

- **Framework**: Next.js 14 utilizing the App Router.
- **Styling**: Tailwind CSS combined with Radix UI and Shadcn/ui for consistent, accessible components.
- **State Management**: React Context API and custom hooks for managing cognitive state and user sessions.
- **Authentication**: Integration with "Better Auth" and Supabase Auth for session persistence and JWT management.

Sources: [comprehensive_reports/comprehensive_state_report.md:44-60](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:144-160]()

## Data Architecture
The system uses an Entity-Relationship model hosted on Supabase PostgreSQL. It utilizes Row Level Security (RLS) to ensure data sovereignty, a core pillar of the project's philosophy.

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string password_hash
        string tier
        boolean is_admin
    }
    RESUMES {
        uuid id PK
        uuid user_id FK
        string title
        json content
    }
    CHAT_SESSIONS {
        uuid id PK
        uuid user_id FK
        string mode
        timestamp created_at
    }
    AI_ANALYSES {
        uuid id PK
        uuid resume_id FK
        json results
        string llm_provider
    }
    USERS ||--o{ RESUMES : owns
    USERS ||--o{ CHAT_SESSIONS : participates
    RESUMES ||--o{ AI_ANALYSES : analyzed_by
```
Sources: [comprehensive_reports/comprehensive_state_report.md:85-115](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:135-145]()

## AI Processing and Data Flow
The AI processing pipeline, centered around the "Billy Engine," handles non-linear user inputs and transforms them into structured resume data.

```mermaid
sequenceDiagram
    participant User as User Interface
    participant FE as Frontend (Next.js)
    participant BE as Backend (FastAPI)
    participant AI as LLM Service (Gemini)
    participant DB as Supabase DB

    User->>FE: Input Career Narrative
    FE->>BE: POST /api/chat/message
    BE->>AI: Analyze Narrative
    Note right of AI: Extracts achievements & skills
    AI-->>BE: Structured Suggestions
    BE->>DB: Log Session & Save Progress
    BE-->>FE: Stream AI Response
    FE-->>User: Display Optimized Content
```
The flow ensures that every AI interaction is logged and monitored for quality via Braintrust.

Sources: [scripts/generate-mermaid-diagrams.py:20-50](), [comprehensive_reports/comprehensive_state_report.md:155-170]()

## Monitoring and Infrastructure
The system architecture includes a "triple-layer" monitoring strategy to ensure production readiness and reliability:
1.  **Sentry**: For real-time error tracking and session replays across frontend and backend.
2.  **Braintrust**: Specifically for monitoring AI response quality, prompt performance, and LLM costs.
3.  **Rollbar**: Secondary backend monitoring for critical system failures.

Sources: [comprehensive_reports/comprehensive_state_report.md:188-205](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:255-270]()

## Conclusion
The Resume Rockstar system architecture successfully bridges complex AI capabilities with a user-centric frontend designed for cognitive accessibility. By decoupling the Next.js frontend from the FastAPI backend and utilizing managed services like Supabase, the system maintains a high degree of scalability while ensuring rigorous data security through Row Level Security and JWT-based authentication.

Sources: [comprehensive_reports/comprehensive_state_report.md:210-220](), [README.md:250-265]()

### Authentication & Authorization

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/core/auth.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/core/auth.py)
- [backend/app/core/security.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/core/security.py)
- [frontend/src/lib/auth.ts](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/lib/auth.ts)
- [backend/app/Technical-Rebuild-Report.md](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/Technical-Rebuild-Report.md)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [README.md](https://github.com/faagestalt-web/ResRock/blob/main/README.md)
</details>

# Authentication & Authorization

## Introduction
The Authentication and Authorization system in Resume Rockstar is designed to provide secure, role-based access to AI-powered resume optimization tools. The system utilizes a modern stack comprising **Better Auth** on the frontend and **FastAPI** with **JWT (JSON Web Tokens)** on the backend to ensure session persistence and secure communication between the client and the server.

The primary purpose of this system is to manage user identities, protect sensitive resume data, and enforce tier-based access control (Free, Standard, and Premium). This ensures that users can only access features and data associated with their specific accounts and subscription levels.

Sources: [README.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Architecture & Components

The security architecture is divided into two primary layers: the Frontend Auth layer for session management and UI protection, and the Backend Auth layer for request validation and resource protection.

### Core Security Components

| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Identity Provider** | Better Auth / Supabase Auth | Manages user registration, OAuth providers, and session persistence. |
| **Token System** | JWT (JSON Web Tokens) | Used for stateless authentication between frontend and backend. |
| **Hashing** | Bcrypt | Securely hashes passwords before storage. |
| **Access Control** | Role-Based (RBAC) | Enforces Admin vs. User permissions and Tier-based gating. |

Sources: [backend/app/Technical-Rebuild-Report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

### Backend Authentication Logic
The backend uses `python-jose` for JWT management and `passlib` with the `bcrypt` algorithm for password hashing. Authentication is stateless; every protected request must include a valid JWT in the `Authorization` header as a Bearer token.

The system includes a `get_db` dependency for database access and specific authentication utilities located in `backend/app/core/security.py`.

Sources: [backend/app/Technical-Rebuild-Report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Authentication Flow

The following sequence diagram illustrates the process of a user logging into the system and subsequently making an authorized request to an API endpoint.

```mermaid
sequenceDiagram
    participant User as User Browser
    participant FE as Frontend (Better Auth)
    participant BE as FastAPI Backend
    participant DB as PostgreSQL (Supabase)

    User->>FE: Enter Credentials
    FE->>BE: POST /api/auth/login
    BE->>DB: Query user by email
    DB-->>BE: Return user record & hash
    BE->>BE: Verify password (bcrypt)
    
    alt Credentials Valid
        BE->>BE: Generate JWT Token
        BE-->>FE: Return Access Token + User Data
        FE->>User: Set Session/Local Storage
    else Credentials Invalid
        BE-->>FE: 401 Unauthorized
        FE-->>User: Show Error Message
    end

    Note over User, BE: Subsequent Authorized Request
    User->>FE: Access Dashboard
    FE->>BE: GET /api/auth/me (Header: Bearer <Token>)
    BE->>BE: Validate JWT Signature
    BE-->>FE: Return User Profile
```
Sources: [backend/app/Technical-Rebuild-Report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [frontend/src/lib/auth.ts]()

## API Endpoints

The backend exposes several routes for managing the authentication lifecycle. These are primarily located within the authentication router.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | POST | Creates a new user account with hashed password. |
| `/api/auth/login` | POST | Validates credentials and returns a JWT. |
| `/api/auth/logout` | POST | Invalidates the current session. |
| `/api/auth/refresh` | POST | Generates a new access token using a refresh token. |
| `/api/auth/me` | GET | Returns information about the currently authenticated user. |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [README.md]()

## Authorization & Tier Gating

The system enforces authorization at multiple levels:
1.  **Role-Based Access Control (RBAC):** Restricts certain endpoints (e.g., `/api/admin/*`) to users with the `is_admin` flag.
2.  **Tier-Based Access:** Restricts features based on the user's subscription tier.

### Tier Levels
- **Free:** Basic chat access and limited conversations.
- **Standard:** Includes guided modes and file uploads.
- **Premium:** Unlimited access to advanced features and AI analysis.

Sources: [README.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

### Implementation Example: Token Validation
The backend validates tokens using a secret key and a specific algorithm (typically HS256).

```python
# Illustrative logic based on Technical-Rebuild-Report.md and REPO_SNAPSHOT.md
# Located in backend/app/core/security.py or auth.py

from jose import jwt
from app.core.config import settings

def verify_token(token: str):
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.JWTError:
        return None
```
Sources: [backend/app/Technical-Rebuild-Report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Security Configuration

The system relies on environment variables for critical security parameters. In production, these must be explicitly set to ensure the integrity of the encryption.

| Variable | Description | Requirement |
| :--- | :--- | :--- |
| `JWT_SECRET_KEY` | Key used to sign and verify JWT tokens. | Required in Production. |
| `JWT_ALGORITHM` | Algorithm used for token signing (e.g., HS256). | Default provided. |
| `DATABASE_URL` | Secure connection string to Supabase. | Required in Production. |

Sources: [backend/app/Technical-Rebuild-Report.md](), [README.md]()

## Conclusion
Resume Rockstar implements a robust Authentication and Authorization framework that balances user convenience with enterprise-grade security. By combining Better Auth for frontend session management and FastAPI with JWT for backend stateless validation, the project ensures that user data remains protected and that premium features are accessible only to authorized subscribers.

### Tier-Based Access System

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/routers/payment.py](https://github.com/faagestalt-web/ResRock/blob/main/reports/LAUNCH_READINESS_AUDIT.md) (Referenced via audit documentation)
- [frontend/src/app/bucket-drops/page.tsx](https://github.com/faagestalt-web/ResRock/blob/main/PACKAGE_CONTENTS.md)
- [backend/app/api/auth.py](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [reports/LAUNCH_READINESS_AUDIT.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/LAUNCH_READINESS_AUDIT.md)
- [comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)
- [README.md](https://github.com/faagestalt-web/ResRock/blob/main/README.md)
</details>

# Tier-Based Access System

The Tier-Based Access System in Resume Rockstar is a core architectural component designed to gate features and manage resource consumption based on a user's subscription level. It ensures that premium functionalities, such as advanced AI analysis and voice-to-text features, are reserved for paying subscribers while providing a functional entry point for free users. The system is deeply integrated into both the backend middleware for request validation and the frontend UI for conditional rendering and user upselling.

Sources: [README.md](), [reports/LAUNCH_READINESS_AUDIT.md:118-125]()

## Tier Definitions and Capabilities

The system categorizes users into three primary levels: Free, Standard, and Admin. Each tier grants specific permissions and resource quotas across the platform's core modules, including the AI Chat system, Resume Studio, and Bucket Drops.

| Tier | Monthly Cost | Core Capabilities | AI Capabilities |
| :--- | :--- | :--- | :--- |
| **Free** | $0.00 | Basic chat, limited resume parsing | Generic AI, limited conversations |
| **Standard** | $9.99 | Guided modes, unlimited voice, file uploads | Billy Engine (PLK-aware) analysis |
| **Admin** | N/A | Full system access, analytics, user management | No restrictions, system-wide monitoring |

Sources: [README.md](), [reports/LAUNCH_READINESS_AUDIT.md:143-149](), [reports/LAUNCH_READINESS_AUDIT.md:195-200]()

## Architecture and Gating Logic

The access system employs a dual-layer validation strategy. Backend middleware intercepts API requests to verify the `subscription_tier` field stored in the user metadata, while the frontend utilizes "tier-aware" messaging and component gating to guide user experience.

### Backend Validation Flow
The backend enforces access control through a tier-check middleware. If a user attempts to access a restricted endpoint (e.g., premium voice transcription) without the required tier, the system is designed to return a `403 Forbidden` response.

```mermaid
flowchart TD
    A[User Request] --> B{Auth Middleware}
    B -- Invalid Token --> C[401 Unauthorized]
    B -- Valid Token --> D{Tier Check Middleware}
    D -- Tier Insufficient --> E[403 Forbidden / Upsell]
    D -- Tier Authorized --> F[Access Granted to Feature]
    F --> G[Execute Service Logic]
```
The system specifically targets the `subscription_tier` field within the SQLAlchemy user model to determine access rights.
Sources: [reports/LAUNCH_READINESS_AUDIT.md:73-80](), [reports/LAUNCH_READINESS_AUDIT.md:105-110]()

### Feature-Specific Gating
Different modules within the application implement unique gating logic:
*   **Resume Studio**: Free users are limited to 3 basic templates, while Standard users access the full library.
*   **Chat System**: Guided modes (Career Story, Accomplishment) are reserved for Standard and Premium tiers.
*   **Bucket Drops**: While basic capture is available, the "Billy AI" analysis of stream-of-consciousness thoughts is a premium feature.

Sources: [reports/LAUNCH_READINESS_AUDIT.md:215-220](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [INTEGRATION_COMPLETE_SUMMARY.md]()

## Database Schema and Relationships

The user tier is persisted in the `users` table, which serves as the central authority for all access-related decisions. This field influences relationships with other entities like `uploads` (for quota management) and `chat_sessions` (for feature access).

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string tier "free | standard | admin"
        json metadata
    }
    UPLOADS {
        uuid id PK
        uuid user_id FK
        string status
    }
    PAYMENTS {
        uuid id PK
        uuid user_id FK
        string status
    }
    USERS ||--o{ UPLOADS : "subject to quota"
    USERS ||--o{ PAYMENTS : "determines tier"
```
Sources: [comprehensive_reports/comprehensive_state_report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Payment and Tier Upgrade Integration

The transition from Free to Standard is handled via Stripe integration. The system initiates a checkout session and, upon successful payment confirmation through a webhook, updates the user's tier status.

### Upgrade Sequence
1.  **Intent**: User triggers an upgrade action in the frontend.
2.  **Session**: Backend creates a Stripe Checkout Session via `POST /api/payment/checkout`.
3.  **Webhook**: Stripe sends a `checkout.session.completed` event to the `/webhooks` router.
4.  **Promotion**: Backend updates `users.tier` to "standard".

```mermaid
sequenceDiagram
    participant U as User
    participant BE as Backend
    participant S as Stripe
    participant DB as Database
    U->>BE: POST /api/payment/checkout
    BE->>S: Create Session
    S-->>U: Redirect to Checkout
    U->>S: Pay
    S->>BE: Webhook (Payment Success)
    BE->>DB: Update user.tier = 'standard'
    DB-->>BE: Success
    BE-->>U: Upgrade Confirmed
```
Sources: [reports/LAUNCH_READINESS_AUDIT.md:38-40](), [reports/LAUNCH_READINESS_AUDIT.md:100-104]()

## Frontend Implementation

On the client side, the system uses "Tier-aware messaging" to handle feature restrictions gracefully. The `useAuth` hook provides the current user's tier, allowing components to conditionally render upsell prompts or restricted interfaces.

**Key Frontend Elements:**
*   **Upsell Prompts**: Visible to free users on premium-only pages (e.g., "Upgrade to Pro for voice input").
*   **Dynamic UI**: The Bucket Drops page (`frontend/src/app/bucket-drops/page.tsx`) adjusts visibility and feedback based on the user's subscription level.
*   **Auth Wrapper**: Components like `AuthProvider` ensure the user's tier is available throughout the application lifecycle.

Sources: [PACKAGE_CONTENTS.md](), [reports/LAUNCH_READINESS_AUDIT.md:162-170](), [comprehensive_reports/comprehensive_state_report.md]()

## Summary
The Tier-Based Access System is vital for the Resume Rockstar business model, providing a clear path from free engagement to paid conversion. By integrating tier checks at the middleware, service, and UI levels, the platform maintains a balance between user accessibility and premium value preservation. Current implementation focuses on solidifying the middleware gating to ensure that subscription statuses are strictly enforced across all 15 API routers.

Sources: [reports/LAUNCH_READINESS_AUDIT.md:252-260](), [README.md]()


## Core Features

### AI Chat & Guided Modes

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/routers/chat.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/chat.py)
- [backend/app/routers/chat_guided.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/chat_guided.py)
- [frontend/src/app/bucket-drops/page.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/app/bucket-drops/page.tsx)
- [frontend/src/lib/api.ts](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/lib/api.ts)
- [README.md](https://github.com/faagestalt-web/ResRock/blob/main/README.md)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [reports/EXPLAINER_VIDEO_SCRIPT.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/EXPLAINER_VIDEO_SCRIPT.md)
</details>

# AI Chat & Guided Modes

AI Chat & Guided Modes serve as the central interactive layer of the Resume Rockstar platform, specifically designed to assist neurodivergent professionals in articulating their career value. By leveraging the "Billy Engine," the system provides context-aware guidance that transforms raw user input into professional resume content. These modes facilitate cognitive scaffolding, allowing users to overcome executive function challenges associated with traditional resume writing.

The system is architected to support multiple interaction styles, ranging from free-form "Bucket Drops" for capturing fleeting thoughts to structured "Guided Discovery" sessions for section-by-section resume building. These interactions are gated by a tier-based access system (Free, Standard, Premium), ensuring that complex AI processing is aligned with user quotas.

Sources: [README.md](), [reports/EXPLAINER_VIDEO_SCRIPT.md:33-40](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:45-53]()

## AI Chat Architecture and Billy Engine

The AI Chat system is powered by the Billy Engine, which acts as a "Personal AI Curator." It maintains context across user sessions to provide continuity and resonance. The backend is built using FastAPI routers that handle standard chat messages and specialized guided discovery paths.

### Interaction Modes

The system supports three primary conversational modes:
*   **Career Story Mode:** Focuses on narrative-driven resume building, helping users connect non-linear work histories into a coherent professional story.
*   **Accomplishment Mode:** Specifically designed to transform simple task descriptions into achievement-focused statements with quantifiable impact.
*   **Guided Mode:** A step-by-step assistance framework that walks users through specific resume sections like professional summaries, work experience, and skills.

Sources: [README.md](), [reports/EXPLAINER_VIDEO_SCRIPT.md:42-70](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:47-51]()

### Technical Workflow

The following sequence diagram illustrates the data flow between the frontend, backend routers, and the Billy AI service during a chat session:

```mermaid
sequenceDiagram
    participant User as User Interface
    participant API as FastAPI Backend
    participant Billy as Billy AI Engine
    participant DB as PostgreSQL DB

    User->>API: POST /api/chat/message (Content + Mode)
    API->>API: Validate JWT & Tier Access
    API->>Billy: Request Analysis (Contextual Prompt)
    Billy-->>API: Stream/Return Structured Response
    API->>DB: Save Message to Session History
    API-->>User: JSON Response (AI Content + Suggestions)
    Note over User: Update UI with AI Insights
```
Sources: [scripts/generate-mermaid-diagrams.py:175-207](), [INTEGRATION_COMPLETE_SUMMARY.md:65-94]()

## Guided Discovery and Tier-Gated Access

Guided Mode uses the `chat_guided.py` router to provide a structured discovery process. This mode is explicitly gated by the user's subscription tier. While basic chat may be available on the Free tier, advanced Guided Discovery typically requires Standard or Premium access.

### Endpoint Configuration

The system uses specific REST endpoints to manage guided interactions and session history:

| Method | Endpoint | Purpose | Tier Requirement |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat/message` | Send standard chat message | Free/Standard/Premium |
| `POST` | `/api/chat/guided` | Initiate/Send guided mode message | Standard/Premium |
| `GET` | `/api/chat/history` | Retrieve previous conversation context | Free/Standard/Premium |
| `DELETE` | `/api/chat/{id}` | Remove a specific message from context | Free/Standard/Premium |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:84-88](), [README.md](), [reports/EXPLAINER_VIDEO_SCRIPT.md:123-130]()

### Guided Logic and Prompting
In Guided Mode, the AI doesn't just respond; it prompts. It uses context-aware follow-up questions to extract "STAR" (Situation, Task, Action, Result) components from user descriptions.

```mermaid
flowchart TD
    Start[User Starts Guided Mode] --> Select[Select Resume Section]
    Select --> Prompt[AI Provides Contextual Prompt]
    Prompt --> Input[User Provides Raw Input]
    Input --> Analysis{Billy AI Analysis}
    Analysis -->|Insufficient| Clarify[AI Asks Follow-up Question]
    Clarify --> Input
    Analysis -->|Sufficient| Transform[Translate to Professional Language]
    Transform --> Save[Save to Resume Draft]
```
Sources: [reports/EXPLAINER_VIDEO_SCRIPT.md:63-70](), [INTEGRATION_COMPLETE_SUMMARY.md:65-94]()

## Bucket Drops: Zero-Friction Capture

Bucket Drops represent a specialized mode of interaction integrated with the chat system. Designed for ADHD-optimized workflows, it allows users to perform "lightning-capture" of fleeting insights without the cognitive load of formal resume formatting.

### Component Implementation
The frontend implementation in `frontend/src/app/bucket-drops/page.tsx` features:
*   **Auth Integration:** Uses `useAuth` to ensure data sovereignty.
*   **Input Handling:** A zero-friction text area for "thought dumps."
*   **Premium Analysis:** If a user is on the Premium tier, the Billy AI automatically analyzes the "drop" to extract core fears, implied goals, and actionable next steps.

Sources: [frontend/src/app/bucket-drops/page.tsx:30-100](), [QUICK_REFERENCE.md:88-100](), [INTEGRATION_COMPLETE_SUMMARY.md:21-30]()

### Data Structure for Capture
Bucket drops are persisted with structured metadata to allow the AI to later synthesize them into resume sections.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique identifier for the drop |
| `raw_transcript` | Text | The original, unedited user input |
| `structured_summary` | JSON | AI-extracted insights (Premium only) |
| `session_type` | String | Categorization (e.g., "general", "accomplishment") |
| `created_at` | Timestamp | Temporal anchor for the thought |

Sources: [backend/app/models/bucket_drop.py:10-40](), [QUICK_REFERENCE.md:125-140]()

## Implementation Details

### Frontend API Client
The `frontend/src/lib/api.ts` file defines the methods used by the chat and guided components to communicate with the backend.

```typescript
// Example of chat-related API methods
export const bucketDropsAPI = {
  createText: (content: string) => axios.post('/api/bucket-drops/text', { content }),
  list: () => axios.get('/api/bucket-drops/list'),
  updateCognitiveState: (data: any) => axios.post('/api/bucket-drops/cognitive-state', data)
};
```
Sources: [frontend/src/lib/api.ts](), [QUICK_REFERENCE.md:12-25]()

### Security and Rate Limiting
To prevent system abuse and ensure fair access to AI resources, the chat routers implement:
*   **JWT Validation:** Every message must include a valid bearer token in the header.
*   **Rate Limiting:** Users are restricted to 10 requests per minute to prevent LLM quota exhaustion.
*   **Role-Based Access Control (RBAC):** Access to `guided` endpoints is checked against the user's `tier` field in the database.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:49-53](), [reports/LAUNCH_COMMUNICATIONS_V1.1.md:65-75]()

## Conclusion
The AI Chat & Guided Modes in Resume Rockstar provide a multi-modal cognitive scaffold that honors the authentic voice of neurodivergent professionals. By combining free-form capture (Bucket Drops) with structured, narrative-driven assistance (Career Story and Accomplishment Modes), the system ensures that users can move from "cognitive chaos" to a professional "Beautiful Tapestry" with minimal friction.

Sources: [README.md](), [reports/EXPLAINER_VIDEO_SCRIPT.md:165-175]()

### Resume Upload & Parsing

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/routers/resume.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/resume.py)
- [backend/app/services/file_parser.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/services/file_parser.py)
- [frontend/src/components/ResumeStudio/DocumentUpload.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/components/ResumeStudio/DocumentUpload.tsx)
- [reports/DEPLOYMENT_STATUS.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/DEPLOYMENT_STATUS.md)
- [comprehensive_reports/DEPLOYMENT_STATUS.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/DEPLOYMENT_STATUS.md)
- [Droid_404_Critical_Fixes.md](https://github.com/faagestalt-web/ResRock/blob/main/Droid_404_Critical_Fixes.md)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
</details>

# Resume Upload & Parsing

The **Resume Upload & Parsing** system is a core module of the Resume Rockstar platform designed to facilitate the transition from legacy resume documents to AI-enhanced professional profiles. It provides neurodivergent professionals with a seamless way to import existing career data from various file formats, including PDF, DOCX, and TXT.

The system handles the end-to-end lifecycle of a document: from frontend file validation and multipart upload to backend text extraction and intelligent parsing. Once parsed, the data is used to populate the [Resume Studio](#resume-studio) fields and can be optionally extracted for [Tapestry Studio](#tapestry-studio) insights to create narrative career threads.
Sources: [README.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [Droid_404_Critical_Fixes.md]()

## System Architecture & Data Flow

The architecture follows a distributed pattern where the frontend handles user interaction and initial validation, while the backend utilizes specialized libraries for text extraction and AI services for structural parsing.

### Document Processing Lifecycle

```mermaid
flowchart TD
    User([User]) -->|Selects File| FE[Frontend: DocumentUpload]
    FE -->|Validate Type/Size| Val{Valid?}
    Val -->|No| Error[Toast Error]
    Val -->|Yes| Upload[POST /api/upload/resume]
    
    subgraph Backend_Processing [Backend: FastAPI]
        Upload --> Store[Supabase Storage]
        Store --> Parse[POST /api/resume/parse]
        Parse --> Extract[File Parser Service]
        Extract --> AI[Billy AI Engine]
    end
    
    AI -->|Structured JSON| FE
    FE -->|Populate UI| RS[Resume Studio State]
    AI -->|Career Insights| TS[Tapestry Studio Store]
```
The data flow involves uploading the raw binary to Supabase Storage, followed by a parsing request that triggers text extraction and AI-driven content structuring.
Sources: [reports/DEPLOYMENT_STATUS.md](), [Droid_404_Critical_Fixes.md]()

## Frontend Implementation

The frontend implementation is centered around the `DocumentUpload` component, which manages the file input, upload progress states, and subsequent state updates in the application stores.

### File Validation & Constraints
The system enforces specific constraints to ensure stability and compatibility:
*   **Supported Formats:** `.pdf`, `.docx`, and `.txt`.
*   **Size Limit:** Maximum file size is capped at 25MB.
*   **State Management:** Utilizes `useState` for `isUploading` and `isParsing` flags to provide UI feedback via the `Loader2` component.

Sources: [frontend/src/components/ResumeStudio/DocumentUpload.tsx:15-35](), [reports/DEPLOYMENT_STATUS.md]()

### Integration with Global Stores
Upon successful parsing, the frontend dispatches data to two primary stores:
1.  **Resume Studio:** Populates standard fields like name, contact, and work history.
2.  **Tapestry Store:** A Zustand-based store that tracks experiences, skills, achievements, and narrative threads extracted from the document.

Sources: [frontend/src/components/ResumeStudio/DocumentUpload.tsx:85-115](), [Droid_404_Critical_Fixes.md]()

## Backend Implementation

The backend is built with FastAPI and utilizes a multi-library approach to ensure high-fidelity text extraction across different file types.

### API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/upload/resume` | `POST` | Uploads a raw file to the `resumes` bucket in Supabase. |
| `/api/resume/parse` | `POST` | Processes a stored file to extract structured career data. |
| `/api/resume/analyze` | `POST` | Performs an ATS/PLK scoring analysis on the parsed text. |
| `/api/upload/quota` | `GET` | Checks the remaining upload quota for the user's tier. |

Sources: [reports/DEPLOYMENT_STATUS.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/DEPLOYMENT_STATUS.md]()

### Extraction Engines
The backend uses specific libraries depending on the file extension:
*   **PDF:** Primary extraction via `pdfplumber` for high reliability, with `PyPDF2` as a fallback or alternative.
*   **DOCX:** Handled by `python-docx`.
*   **TXT:** Standard UTF-8 decoding.

Sources: [backend/app/routers/resume.py](), [reports/DEPLOYMENT_STATUS.md]()

### AI-Driven Narrative Extraction
A critical feature of the parser is the `extract_for_tapestry` flag. When enabled, the system uses the "Billy AI Engine" (Module-2: Life Experiences) to identify career moments using the STAR (Situation, Task, Action, Result) framework.

```mermaid
sequenceDiagram
    participant B as Backend
    participant A as Billy AI Engine
    participant D as Database
    
    B->>A: Send raw text + Narrative Prompt
    Note right of A: Extract STAR components<br/>Identify narrative threads
    A-->>B: Return Structured JSON
    B->>D: Log to resumes table (ats_score, plk_score)
    B-->>B: Return parsed_data + tapestry_insights
```
Sources: [backend/app/routers/resume.py](), [Droid_404_Critical_Fixes.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Database Schema & Storage

The system utilizes PostgreSQL (via Supabase) to track uploads and store the results of the parsing/analysis process.

### Storage Buckets
*   **resumes:** Dedicated bucket for resume file uploads (PDF, DOCX, TXT).
*   **uploads:** General bucket for images and attachments.

### Resumes Table Structure
| Field | Type | Description |
| :--- | :--- | :--- |
| `original_text` | Text | The raw text extracted from the document. |
| `enhanced_text` | Text | AI-optimized version of the resume. |
| `ats_score` | Integer | Optimization score for Applicant Tracking Systems. |
| `plk_score` | Integer | Personal Language Kernel resonance score. |
| `provider` | String | The LLM provider used for the parsing (e.g., Gemini, OpenAI). |

Sources: [reports/DEPLOYMENT_STATUS.md](), [comprehensive_reports/comprehensive_state_report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Conclusion
The Resume Upload & Parsing system serves as the primary data ingestion layer for Resume Rockstar. By combining robust file parsing with the Billy AI Engine, the system does more than simply extract text; it identifies the "current within the chaos" of a user's career history, enabling the generation of high-impact resumes and narrative "Tapestry" threads that honor neurodivergent processing styles.
Sources: [README.md](), [Droid_404_Critical_Fixes.md]()

### Admin Dashboard & User Management

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/api/admin.py](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md) (Derived from Repo Snapshot reference)
- [frontend/src/app/dashboard/admin/page.tsx](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md) (Derived from Comprehensive State Report reference)
- [backend/app/models/admin_audit.py](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md) (Derived from Database Schema reference)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)
- [README.md](https://github.com/faagestalt-web/ResRock/blob/main/README.md)
- [reports/LAUNCH_READINESS_AUDIT.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/README_REPORTS.md) (Referenced via Reports Index)
</details>

# Admin Dashboard & User Management

## Introduction
The Admin Dashboard & User Management system provides centralized administrative control over the Resume Rockstar platform. Its primary purpose is to allow authorized administrators to manage user accounts, monitor system health, track AI/LLM consumption, and audit platform activities. This system is critical for maintaining operational integrity and ensuring that platform resources are utilized efficiently according to user tiers.

The administrative suite is integrated into the FastAPI backend and Next.js frontend, utilizing Role-Based Access Control (RBAC) to ensure that only users with admin privileges can access sensitive management endpoints and data.
Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [README.md]()

## System Architecture & Components

The administrative system follows a decoupled architecture where the backend provides RESTful API endpoints and the frontend renders a dynamic dashboard for real-time monitoring and management.

### Backend Admin Layer
The backend implementation is centered around the admin router, which interfaces with the PostgreSQL database via SQLAlchemy. It includes logic for retrieving user lists, generating analytics, and checking system health.
Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

### Frontend Admin Interface
The frontend is built using Next.js 14 and utilizes dynamic rendering to ensure up-to-date data is presented to the administrator. Key components include user management panels and analytics visualizations.
Sources: [comprehensive_reports/comprehensive_state_report.md](), [README.md]()

```mermaid
graph TD
    subgraph "Frontend (Next.js 14)"
        AdminPage[Admin Dashboard Page]
        UserPanel[User Management Panel]
        HealthComp[Health Monitor Component]
    end

    subgraph "Backend (FastAPI)"
        AdminRouter[Admin API Router]
        AuthGuard[Admin Auth Middleware]
        AdminService[Admin Business Logic]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Logs[(Admin Audit Logs)]
    end

    AdminPage --> AdminRouter
    AdminRouter --> AuthGuard
    AuthGuard --> AdminService
    AdminService --> DB
    AdminService --> Logs
```
The diagram above illustrates the flow from the frontend dashboard through the administrative security middleware to the data persistence layer.
Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

## User Management

User management allows administrators to view, filter, and manage the user base. This includes tracking user tiers (Free, Standard, Premium) and account status.

| Feature | Description | Status |
| :--- | :--- | :--- |
| User Listing | Retrieve and display all registered users with metadata. | 82% Ready |
| Tier Management | View and modify user access tiers (Free/Standard/Premium). | Verified |
| Access Control | Admin-only access enforced via JWT and role checks. | 100% Ready |
| Audit Logging | Tracking admin actions within the user management panel. | Operational |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [README.md]()

### User Management Flow
```mermaid
sequenceDiagram
    participant Admin as Administrator
    participant FE as Frontend Admin UI
    participant BE as FastAPI Backend
    participant DB as PostgreSQL

    Admin->>FE: Request User List
    FE->>BE: GET /api/admin/users (with JWT)
    BE->>BE: Validate Admin Role
    BE->>DB: Query users table
    DB-->>BE: User data records
    BE-->>FE: JSON User List
    FE-->>Admin: Display User Management Table
```
This sequence shows the secure retrieval process for user data, requiring both valid JWT authentication and specific administrative role permissions.
Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

## System Monitoring & Analytics

The dashboard provides real-time insights into platform performance and resource utilization, specifically focusing on LLM costs and system uptime.

### Key API Endpoints
The following endpoints provide the data necessary for the administrative overview:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/admin/users` | GET | List all users and their current status. |
| `/api/admin/analytics` | GET | General platform usage metrics. |
| `/api/admin/health` | GET | System health and service availability status. |
| `/api/admin/llm-stats` | GET | Statistics on LLM token usage and costs. |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [README.md]()

### Admin Audit Logs
The `admin_logs` table serves as the primary data structure for tracking administrative interventions. It records which administrator performed what action and at what time.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `user_id` | Integer | Foreign Key to Users table (the Admin) |
| `action` | String | Description of the administrative action |
| `timestamp` | DateTime | When the action occurred |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Security & Access Control

Security for the admin dashboard is enforced at multiple levels to prevent unauthorized access to sensitive user data and system configurations.

1.  **JWT Validation**: Every request to the admin router must include a valid JSON Web Token.
2.  **Role-Based Access Control (RBAC)**: The backend verifies the `is_admin` flag on the user record before processing requests.
3.  **Frontend Route Protection**: The admin page uses dynamic loading and auth context checks to redirect non-admin users.
4.  **Audit Trails**: All modifications to user states or system settings are recorded in the `admin_logs`.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

```mermaid
flowchart TD
    Req[Admin API Request] --> TokenCheck{JWT Valid?}
    TokenCheck -- No --> 401[Unauthorized]
    TokenCheck -- Yes --> RoleCheck{User is Admin?}
    RoleCheck -- No --> 403[Forbidden]
    RoleCheck -- Yes --> Process[Execute Admin Logic]
    Process --> Log[Write to Admin Audit Logs]
    Log --> Resp[Return Data/Success]
```
The flowchart describes the security gatekeeping process that protects administrative functions.
Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Summary
The Admin Dashboard & User Management system is a robust administrative suite designed to scale with the Resume Rockstar platform. By combining FastAPI's secure routing with a Next.js dynamic frontend, it provides administrators with the tools needed for user oversight, system health monitoring, and AI resource management. With a passing rate of 82% in readiness tests and 100% readiness in security and authentication, the system ensures that administrative actions are both effective and secure.
Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [README.md]()

### Payments & Webhooks (Stripe)

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/routers/payment.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/payment.py)
- [backend/app/routers/webhooks.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/webhooks.py)
- [backend/app/models/payment.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/models/payment.py)
- [reports/LAUNCH_READINESS_AUDIT.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/LAUNCH_READINESS_AUDIT.md)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [reports/LAUNCH_READINESS_REPORT.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/LAUNCH_READINESS_REPORT.md)
</details>

# Payments & Webhooks (Stripe)

The Payment and Webhook system in ResRock provides the infrastructure for processing user subscriptions, managing financial transactions, and synchronizing user access levels across the platform. Built on the Stripe API, it handles the end-to-end lifecycle of a payment—from session creation in the frontend to asynchronous processing of transaction events in the backend.

The system is a critical component of the project's [Tier System](#tier-management-and-access-control), enabling the transition of users from Free to Standard or Pro tiers based on successful checkout events. Sources: [reports/LAUNCH_READINESS_AUDIT.md:27](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:16]()

## System Architecture

The payment architecture consists of three primary layers: the Frontend Checkout interface, the Backend Payment Router, and the Stripe Webhook Handler. These components work together to ensure that payment data is securely handled by Stripe while keeping the internal ResRock database synchronized with the user's current subscription status.

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js)"]
        A[Checkout Button] --> B[Create Session Request]
    end

    subgraph Backend ["Backend (FastAPI)"]
        B --> C[Payment Router]
        C --> D[Stripe API Client]
        F[Webhook Router] --> G[Signature Validation]
        G --> H[Update User Tier]
        G --> I[Log Payment Model]
    end

    subgraph Stripe ["External (Stripe)"]
        D --> E[Hosted Checkout Page]
        E -- Event Trigger --> F
    end

    H --> J[(PostgreSQL DB)]
    I --> J
```
The diagram above illustrates the request-response cycle for creating a checkout session and the subsequent asynchronous notification via webhooks. Sources: [scripts/generate-mermaid-diagrams.py:118-132](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:126-140]()

## Payment Processing Workflow

### 1. Checkout Session Creation
When a user initiates an upgrade, the application creates a Stripe Checkout Session. This session contains metadata such as the `user_id`, which is vital for associating the payment with the correct account upon completion. The backend validates the request, ensures the user is authenticated, and interacts with Stripe to generate a unique URL for the hosted checkout page. Sources: [backend/app/routers/payment.py](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:76-78]()

### 2. Webhook Handling
The system employs a dedicated webhook router to listen for events from Stripe. The primary event handled is `checkout.session.completed`. Upon receiving this event, the system performs a mandatory signature verification using the `STRIPE_WEBHOOK_SECRET` to prevent spoofing. Sources: [backend/app/routers/webhooks.py](), [reports/LAUNCH_READINESS_REPORT.md:143-145]()

```mermaid
sequenceDiagram
    participant S as Stripe
    participant W as Webhook Router
    participant V as Validator
    participant DB as Database

    S->>W: POST /webhooks/stripe (Event)
    W->>V: Verify Signature (Secret)
    alt Signature Valid
        V-->>W: Success
        W->>DB: Update User Tier (Standard/Pro)
        W->>DB: Create Payment Record
        W-->>S: 200 OK
    else Signature Invalid
        V-->>W: Failure
        W-->>S: 400 Bad Request
    end
```
Sources: [scripts/generate-mermaid-diagrams.py:165-195](), [backend/app/routers/webhooks.py]()

## Data Models

The system persists payment information in the `payments` table to maintain an audit trail and facilitate financial analytics within the Admin Dashboard. Sources: [comprehensive_reports/comprehensive_state_report.md:79-86]()

### Payment Model Schema
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier for the transaction record. |
| `user_id` | UUID (FK) | Reference to the user who made the payment. |
| `stripe_payment_id` | String | The unique ID provided by Stripe for the session or charge. |
| `amount` | Decimal | Total amount processed in the transaction. |
| `status` | String | Current status (e.g., completed, pending, failed). |
| `created_at` | Timestamp | Date and time the record was created. |

Sources: [backend/app/models/payment.py](), [comprehensive_reports/comprehensive_state_report.md:79-86]()

## API Endpoints

The payment and webhook functionality is exposed through the following REST endpoints. Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:104-114]()

### Payment Router (`/api/payment`)
*   **POST `/api/payment/checkout`**: Initiates a new checkout session.
*   **GET `/api/payment/status/{session_id}`**: Retrieves the status of a specific payment session.
*   **POST `/api/payment/intent`**: Creates a payment intent for custom checkout flows.

### Webhook Router (`/webhooks`)
*   **POST `/webhooks/stripe`**: Public-facing endpoint for Stripe to deliver asynchronous event notifications.

## Tier Management and Access Control

The successful completion of a payment triggers an automatic upgrade of the user's `subscription_tier`. This gating logic is enforced via middleware that checks the user's tier before allowing access to premium features like Resume Studio or AI-enhanced chat. Sources: [reports/LAUNCH_READINESS_AUDIT.md:118-124](), [reports/LAUNCH_READINESS_REPORT.md:131-133]()

| Tier | Access Level |
| :--- | :--- |
| **Free** | Basic resume editing and limited chat sessions. |
| **Standard** | Full Resume Studio access and guided discovery modes. |
| **Pro** | Unlimited voice input, premium templates, and advanced AI analysis. |

Sources: [reports/LAUNCH_READINESS_AUDIT.md:143-150](), [reports/LAUNCH_READINESS_REPORT.md:15-20]()

## Conclusion

The Stripe-based Payment and Webhook module ensures that ResRock can effectively monetize its features while maintaining a secure and reliable user experience. By leveraging asynchronous webhooks, the system guarantees that user tiers are updated even if the user closes their browser before returning from the Stripe checkout page. The integration is backed by a robust data model that supports future financial auditing and user growth analytics. Sources: [reports/LAUNCH_READINESS_REPORT.md:196-200](), [comprehensive_reports/comprehensive_state_report.md:144-150]()


## AI & Cognitive Models

### Billy AI Engine

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/services/billy_service.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/services/billy_service.py)
- [backend/app/models/billy.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/models/billy.py)
- [reports/BILLY_FULL_INTEGRATION_COMPLETE.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/BILLY_FULL_INTEGRATION_COMPLETE.md)
- [reports/BILLY_INTEGRATION_GUIDE.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/BILLY_INTEGRATION_GUIDE.md)
- [AI_FUNCTIONALITY_TEST_REPORT.md](https://github.com/faagestalt-web/ResRock/blob/main/AI_FUNCTIONALITY_TEST_REPORT.md)
- [comprehensive_reports/BILLY_FULL_INTEGRATION_COMPLETE.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/BILLY_FULL_INTEGRATION_COMPLETE.md)
</details>

# Billy AI Engine

The Billy AI Engine serves as the central "consciousness" of the Resume Rockstar application, providing empathetic, context-aware, and neurodivergent-friendly AI interactions. It is a unified intelligence layer designed to assist users with ADHD or other cognitive differences by extracting career narratives, analyzing personal language keys (PLK), and synthesizing memories into professional formats.

Built on the Google Gemini 2.0 Flash model, the engine transitioned from an isolated API endpoint to a globally accessible singleton service integrated across multiple application routers. It utilizes a modular training strategy to handle specific professional development stages, ranging from initial persona calibration to complex career timeline synthesis.
Sources: [reports/BILLY_FULL_INTEGRATION_COMPLETE.md](), [reports/BILLY_INTEGRATION_GUIDE.md]()

## System Architecture

The Billy Engine is implemented using a Singleton pattern to ensure a single, resource-efficient instance of the AI client is shared across the entire backend. It is managed via FastAPI's lifespan context, initializing on application startup and shutting down gracefully to manage resources and API connections.

### Component Interaction Flow
The following diagram illustrates how the Billy Engine interacts with the application routers and the external Gemini API.

```mermaid
graph TD
    A[FastAPI Application Startup] --> B[Billy Service Initialization]
    B --> C{Singleton Instance?}
    C -- No --> D[Create BillyEngine Instance]
    C -- Yes --> E[Return Existing Instance]
    D --> F[Load .billy Modules]
    F --> G[Initialize Gemini Client]
    
    subgraph "Application Routers"
        H[Memories Router]
        I[Bucket Drops Router]
        J[Voice Router]
        K[Chat Router]
    end
    
    H & I & J & K -->|Dependency Injection| L[BillyEngine.generate_response]
    L --> M[Google Gemini 2.0 API]
    M -->|Response/Stream| L
```
Sources: [reports/BILLY_INTEGRATION_GUIDE.md:27-55](), [reports/BILLY_FULL_INTEGRATION_COMPLETE.md:14-25]()

## Core Training Modules

The engine operates through 14 distinct training modules, each mapped to specific professional use cases and stages of the professional development journey.

| Module Key | Stage/Label | Primary Use Case |
| :--- | :--- | :--- |
| `foundation` | Stage 0 · Environment & Safety | General chat, clarification, and voice transcript cleanup. |
| `persona` | Stage 1 · Persona & PLK | Learning the user's specific communication style and PLK. |
| `module-2` | Life Experiences & Skills | Extracting career stories and STAR-format accomplishments. |
| `module-4` | Fact-Based Profiles | Skill articulation, resume writing, and profile generation. |
| `module-7` | Aspirations & Goals | Goal roadmapping and action planning. |
| `module-9` | Nuances & PLK | Metaphor identification and bucket drop resonance analysis. |
| `integration` | Stage 3 · Integration | Multi-memory synthesis and career narrative weaving. |
Sources: [reports/BILLY_FULL_INTEGRATION_COMPLETE.md:77-105](), [reports/BILLY_INTEGRATION_GUIDE.md:129-145]()

## Data Models and Persistence

Billy Engine's activities are tracked and stored within the database for monitoring and personalization. Two primary models define this persistence layer: `BillyContextState` for maintaining user-specific state and `BillyTrace` for analytics and auditing.

### ER Diagram for AI Persistence
```mermaid
erDiagram
    USER ||--o{ BILLY_CONTEXT_STATE : has
    USER ||--o{ BILLY_TRACE : generates
    BILLY_CONTEXT_STATE {
        uuid id PK
        uuid user_id FK
        json context_data
        timestamp updated_at
    }
    BILLY_TRACE {
        uuid id PK
        uuid user_id FK
        string action_type
        string module_target
        json input_metadata
        timestamp created_at
    }
```
Sources: [backend/app/models/billy.py](), [reports/SESSION_STATE.md:11-16]()

## Router Integrations

The engine is integrated into 7 primary routers via dependency injection, allowing specialized AI behavior based on the specific endpoint context.

### Memory Synthesis Logic
When users create memories, Billy Module-2 is invoked to synthesize raw thoughts into structured STAR (Situation, Task, Action, Result) formats. The Integration module subsequently weaves these memories into a cohesive career timeline.
Sources: [reports/BILLY_FULL_INTEGRATION_COMPLETE.md:214-222](), [AI_FUNCTIONALITY_TEST_REPORT.md:43-57]()

### Bucket Drop Analysis
For users capturing fleeting thoughts (Bucket Drops), Billy Module-9 performs a deep analysis to identify metaphors and "Personal Language Key" (PLK) resonance.

```mermaid
sequenceDiagram
    participant User as User Interface
    participant Router as Bucket Drop Router
    participant Billy as Billy Engine (Module-9)
    participant DB as Database
    
    User->>Router: POST /api/bucket-drops/capture
    Router->>DB: Save raw thought
    Router->>Billy: generate_response(module_key="module-9")
    Billy-->>Router: Metaphor insights + Resonance score
    Router->>DB: Store Billy insights in metadata
    Router-->>User: Success + AI Analysis
```
Sources: [reports/BILLY_FULL_INTEGRATION_COMPLETE.md:204-212](), [reports/BILLY_INTEGRATION_GUIDE.md:188-210]()

## Implementation Details

### Response Generation
The engine supports both synchronous string responses and asynchronous generators for real-time streaming in chat interfaces.

```python
# Service Method Definition
def generate_response(
    module_key: str,              # e.g., "module-4"
    user_input: str,              # Raw input from user
    context_bundles: List[str],   # ["resume_rockstar", "gestaltview"]
    stream: bool = True           # Toggle for streaming
) -> Generator[str, None, None] | str:
    pass
```
Sources: [reports/BILLY_INTEGRATION_GUIDE.md:114-127]()

### Monitoring and Health
The system provides a dedicated health endpoint at `/api/billy/health` that monitors the initialization status, the model version (Gemini 2.0 Flash), and the availability of the 14 training modules.
Sources: [reports/BILLY_FULL_INTEGRATION_COMPLETE.md:113-121](), [AI_FUNCTIONALITY_TEST_REPORT.md:37-41]()

## Conclusion
The Billy AI Engine serves as a sophisticated cognitive scaffold, moving beyond simple automation to provide consciousness-serving AI. By centralizing its logic in a singleton service and utilizing specialized training modules, the project ensures that every user interaction—whether capturing a thought or building a resume—is infused with an understanding of the user's authentic voice and neurodivergent needs.
Sources: [reports/BILLY_FULL_INTEGRATION_COMPLETE.md:315-325](), [reports/BILLY_INTEGRATION_GUIDE.md:275-285]()

### Personal Language Keys (PLK) Analyzer

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/services/plk_engine.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/services/plk_engine.py)
- [backend/app/routers/plk.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/plk.py)
- [frontend/src/components/PLKAnalyzer.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/components/PLKAnalyzer.tsx)
- [frontend/src/components/billy/PLKScoreDisplay.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/components/billy/PLKScoreDisplay.tsx)
- [FOUNDATIONAL_DOCUMENTS_INDEX.md](https://github.com/faagestalt-web/ResRock/blob/main/FOUNDATIONAL_DOCUMENTS_INDEX.md)
- [TEST_SUITE_IMPLEMENTATION_SUMMARY.md](https://github.com/faagestalt-web/ResRock/blob/main/TEST_SUITE_IMPLEMENTATION_SUMMARY.md)
</details>

# Personal Language Keys (PLK) Analyzer

The **Personal Language Keys (PLK) Analyzer** is a specialized cognitive infrastructure module within the Resume Rockstar project. It is designed to serve neurodivergent professionals by measuring "conversational resonance"—a metric that evaluates how well professional text (such as resumes or career stories) aligns with the user's authentic voice, metaphors, and cognitive patterns. Sources: [backend/app/services/plk_engine.py:1-13](), [FOUNDATIONAL_DOCUMENTS_INDEX.md:92-98]()

By analyzing text for signature metaphors, energy words, and core principles, the PLK Analyzer provides a quantitative "Resonance Score" (0–100). This system shifts the focus from traditional, rigid resume templates toward "Cognitive Justice," ensuring that a user's unique neurological "operating system" is accurately represented in their professional narrative. Sources: [backend/app/services/plk_engine.py:117-124](), [FOUNDATIONAL_DOCUMENTS_INDEX.md:38-46]()

## Architecture and Core Engine

The system is powered by the `PLKEngine`, a production-grade Python module that handles resonance scoring, metaphor detection, and adaptive learning. It utilizes a weighted algorithm to breakdown the total resonance score based on several linguistic categories. Sources: [backend/app/services/plk_engine.py:91-115]()

### Resonance Scoring Algorithm
The engine calculates the Resonance Score using the following weighted components:

| Category | Weight ($W$) | Description |
| :--- | :--- | :--- |
| **Signature Metaphors** | 0.35 | Detection of specific metaphors like "Exploded picture mind" or "Beautiful Tapestry." |
| **Core Principles** | 0.25 | Alignment with philosophies such as "Iteration is liberation." |
| **Energy Words** | 0.20 | Usage of high-resonance terms (e.g., "revolutionary," "authentic," "sovereignty"). |
| **Indicators** | 0.15 | General consciousness indicators like "empathy" or "wisdom." |
| **Profile Bonus** | 0.10 | Specific adjustments for user neurodivergence (ADHD/Autism) and communication preferences. |
| **Triggers Penalty** | -0.25 | Deductions for deficit-based language (e.g., "impossible," "broken," "failure"). |

Sources: [backend/app/services/plk_engine.py:117-130](), [backend/app/services/plk_engine.py:155-204]()

### Data Flow Diagram
The following diagram illustrates the lifecycle of a text analysis request within the PLK system.

```mermaid
flowchart TD
    A[User Text Input] --> B[PLKEngine.analyze_text]
    B --> C{Scoring Modules}
    C --> D[Metaphor Detection]
    C --> E[Energy Word Check]
    C --> F[Trigger Word Penalty]
    C --> G[Profile Alignment]
    D & E & F & G --> H[Normalize Score 0-100]
    H --> I[Generate Recommendations]
    I --> J[JSON Response]
```
The engine normalizes the sum of these parts to ensure the final score is clamped between 0 and 100. Sources: [backend/app/services/plk_engine.py:206-235]()

## Key Implementation Components

### PLK Engine Class
The `PLKEngine` maintains internal lists of core principles, signature metaphors, and energy/trigger words. It can also be "seeded" with external data from CSV files containing personal lived phrases. Sources: [backend/app/services/plk_engine.py:132-153](), [backend/app/services/plk_engine.py:288-312]()

```python
@dataclass
class PLKSignatureMetaphor:
    concept: str
    metaphor: str
    emotionalResonance: float = 8.0  # 1-10
    frequencyScore: float = 0.8      # 0-1
    consciousnessDepth: float = 8.0  # 1-10
    source: str = "default"
```
Sources: [backend/app/services/plk_engine.py:73-80]()

### Signature Metaphors
The system includes several default metaphors that resonate specifically with neurodivergent cognition:
*   **Exploded picture mind**: Describes chaos that processes multiple dimensions simultaneously.
*   **Beautiful Tapestry**: Weaving fragmented experiences into understanding.
*   **The Loom Approach**: Iterative weaving mirroring neuroplasticity.
*   **Bucket drops**: Zero-friction capture of insights.
Sources: [backend/app/services/plk_engine.py:44-63]()

## Frontend Integration

The PLK Analyzer manifests in the user interface through specialized React components that provide real-time feedback. Sources: [frontend/src/components/PLKAnalyzer.tsx:1-10](), [frontend/src/components/billy/PLKScoreDisplay.tsx:1-5]()

### PLK Score Display
The `PLKScoreDisplay` component provides a visual representation of the resonance score, often used within the "Billy AI" playground. It alerts users when their resonance is low, suggesting that their text may be drifting away from their authentic voice. Sources: [frontend/src/components/billy/PLKScoreDisplay.tsx:10-25](), [TEST_SUITE_IMPLEMENTATION_SUMMARY.md:126-135]()

### Sequence Diagram: Real-time Analysis
This diagram shows how the frontend interacts with the PLK backend during a chat session.

```mermaid
sequenceDiagram
    participant User as User Interface
    participant FE as Frontend State
    participant API as PLK Router
    participant Engine as PLKEngine

    User->>FE: Input text (Story/Resume)
    FE->>API: POST /api/plk/analyze
    API->>Engine: analyze_text(content)
    Engine-->>API: {score: 95, metaphors: [...]}
    API-->>FE: JSON Analysis Results
    FE->>User: Update Resonance Gauge & Recs
```
Sources: [backend/app/routers/plk.py:5-20](), [frontend/src/components/PLKAnalyzer.tsx:15-30]()

## Adaptive Learning and Enhancement

The PLK Analyzer is not static; it includes methods to evolve with the user:
1.  **Learn Method**: If user feedback is high and resonance is above 90, the engine harvests new energy words from the user's input to add to their profile. Sources: [backend/app/services/plk_engine.py:277-286]()
2.  **Text Enhancement**: The engine can generate LLM prompts that specifically instruct an AI to preserve high-confidence metaphors while increasing clarity and resonance. Sources: [backend/app/services/plk_engine.py:249-275]()

## Summary
The Personal Language Keys (PLK) Analyzer serves as the cognitive heart of the project's resonance-checking capability. By quantifying the alignment between professional narrative and personal cognitive styles, it ensures that neurodivergent individuals do not have to "mask" their natural way of thinking to achieve professional success. Its architecture combines a weighted scoring engine, metaphor detection, and adaptive learning to provide a robust framework for cognitive justice. Sources: [FOUNDATIONAL_DOCUMENTS_INDEX.md:48-55](), [backend/app/services/plk_engine.py:330-340]()

### Cognitive Tracker & Bucket Drops

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/routers/bucket_drops.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/bucket_drops.py)
- [backend/app/models/bucket_drop.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/models/bucket_drop.py)
- [frontend/src/app/bucket-drops/page.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/app/bucket-drops/page.tsx)
- [frontend/src/components/BucketDrop.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/components/BucketDrop.tsx)
- [frontend/src/components/AdaptiveLayoutSystem.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/components/AdaptiveLayoutSystem.tsx)
- [backend/app/services/billy_service.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/services/billy_service.py)
- [INTEGRATION_COMPLETE_SUMMARY.md](https://github.com/faagestalt-web/ResRock/blob/main/INTEGRATION_COMPLETE_SUMMARY.md)
</details>

# Cognitive Tracker & Bucket Drops

The **Cognitive Tracker & Bucket Drops** system is a core feature of the Resume Rockstar platform designed specifically to support neurodivergent professionals. It provides a "zero-friction" environment for capturing authentic, unstructured thoughts (Bucket Drops) and uses AI to transform those "rambles" into structured career insights. Simultaneously, the system tracks the user's cognitive state (mood, energy, focus) to adapt the application's interface dynamically to the user's current needs.

This system serves as a cognitive scaffold, recognizing that traditional job-searching tools often impose a rigid structure that can be overwhelming for users with ADHD or anxiety. By allowing users to dump information without self-editing and providing an interface that responds to their energy levels, the project aims to achieve "Cognitive Justice."

Sources: [INTEGRATION_COMPLETE_SUMMARY.md](), [FOUNDATIONAL_DOCUMENTS_INDEX.md]()

## Bucket Drops: Zero-Friction Capture

Bucket Drops allow users to capture thoughts via text or audio recording. For premium users, the **Billy AI Service** analyzes these inputs to extract core fears, goals, and actionable next steps.

### Data Flow Architecture

The following diagram illustrates the flow of a text-based Bucket Drop from the frontend UI to backend storage and AI analysis.

```mermaid
flowchart TD
    User([User]) -->|Input Text| UI[bucket-drops/page.tsx]
    UI -->|handleCapture| APIClient[api.ts]
    APIClient -->|POST /api/bucket-drops/text| Router[bucket_drops.py]
    Router -->|Check Tier| Billy[billy_service.py]
    Billy -->|AI Analysis| Router
    Router -->|Save Record| DB[(PostgreSQL)]
    Router -->|JSON Response| UI
    UI -->|Refresh List| UI
```
Sources: [INTEGRATION_COMPLETE_SUMMARY.md](), [COMPLETE_INTEGRATION_AUDIT.md]()

### API Endpoints
The backend router facilitates the lifecycle of a Bucket Drop through four primary endpoints.

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/bucket-drops/text` | Creates a drop from text input with optional Billy AI analysis. |
| `POST` | `/api/bucket-drops/upload` | Uploads an audio file for STT transcription and processing. |
| `GET` | `/api/bucket-drops/list` | Retrieves a chronological list of drops for the authenticated user. |
| `POST` | `/api/bucket-drops/cognitive-state` | Updates the user's current mental state for UI adaptation. |

Sources: [backend/app/routers/bucket_drops.py:15-142](), [QUICK_REFERENCE.md]()

### Database Model
The `BucketDrop` model stores both the raw input and the AI-generated structured analysis.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary key. |
| `user_id` | Integer | Foreign key linking the drop to a specific user. |
| `raw_transcript` | Text | The original text or transcribed audio. |
| `structured_summary` | JSON | AI analysis containing fears, goals, and themes. |
| `session_type` | String | Categories such as "general", "experience", or "anxiety". |
| `created_at` | DateTime | Timestamp of the capture. |

Sources: [backend/app/models/bucket_drop.py:7-22]()

## Cognitive Tracker & Adaptive UI

The **Cognitive Tracker** monitors user metrics such as energy levels and mood. This data feeds into the **Adaptive Layout System**, which modifies the frontend presentation to prevent user burnout or overwhelm.

### UI Adaptation Logic
The system adapts the interface based on the `overwhelm_status` and `energy_level` reported by the user.

```mermaid
flowchart TD
    State[Cognitive State Update] -->|Low Energy| Focus[Focus Mode]
    State -->|High Overwhelm| Minimal[Minimalist Layout]
    State -->|High Energy| Full[Standard Feature Set]
    Focus -->|Action| DisableAnim[Disable Animations]
    Focus -->|Action| IncreaseSpace[Increase White Space]
    Minimal -->|Action| HideSidebar[Hide Sidebars]
```
Sources: [frontend/src/components/AdaptiveLayoutSystem.tsx](), [FEATURE_INTEGRATION_GUIDE.md]()

### Cognitive State Schema
Requests to the `/api/bucket-drops/cognitive-state` endpoint typically include the following parameters:
*   **mood**: String (e.g., "anxious", "focused", "tired")
*   **energy_level**: Integer (1-5 scale)
*   **focus_level**: Integer (1-5 scale)
*   **overwhelm_status**: String (e.g., "high", "low")

Sources: [BUCKET_DROPS_LIVE_TEST_GUIDE.md](), [backend/app/routers/bucket_drops.py:128-142]()

## Billy AI Analysis
For premium users, the `BillyService` performs a module-based analysis of the Bucket Drop. It is configured as a singleton that orchestrates multiple LLM providers, primarily Google Gemini (gemini-2.0-flash).

### Analysis Output Structure
The AI extracts a specific JSON schema from the user's "ramble":
1.  **Core Fears**: Identified anxieties or concerns.
2.  **Implied Goals**: Objectives the user wants to achieve.
3.  **Hard Constraints**: Time, energy, or cognitive limits.
4.  **Key Themes**: Recurring topics in the stream-of-consciousness.
5.  **Actionable Steps**: 2-3 concrete tasks.

Sources: [INTEGRATION_COMPLETE_SUMMARY.md](), [backend/app/services/billy_service.py]()

## Implementation Details

### Backend Router Implementation
The router utilizes FastAPI dependencies to ensure only authenticated users can create or list drops.

```python
@router.post('/text')
async def create_text_bucket_drop(
    content: str,
    session_type: str = "general",
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    billy = BillyService()
    analysis_result = await billy.generate_response(
        module_key="analysis",
        user_input=f"Analyze this: {content}"
    )
    bucket_drop = BucketDrop(
        user_id=current_user.id,
        raw_transcript=content,
        structured_summary=analysis_result,
        session_type=session_type
    )
    db.add(bucket_drop)
    db.commit()
    return {"success": True, "analysis": analysis_result}
```
Sources: [backend/app/routers/bucket_drops.py:90-118]()

### Frontend Component Integration
The `BucketDropsPage` leverages a tier-aware logic to display either the standard interface or the premium `ConsciousnessBucketDrops` view.

```tsx
export default function BucketDropsPage() {
  const { user } = useAuth()
  if (!user) return <div>Please log in</div>
  
  if (user.tier === 'premium' || user.tier === 'revolutionary') {
    return <ConsciousnessBucketDrops userId={user.id} tier={user.tier} />
  }
  return <BucketDropsInterface userId={user.id} />
}
```
Sources: [frontend/src/app/bucket-drops/page.tsx:5-18]()

The Cognitive Tracker and Bucket Drops system represents a departure from standard resume tools by prioritizing the user's mental well-being and cognitive patterns. By integrating AI-driven analysis with a dynamically adaptive interface, the system ensures that job-seeking remains accessible even during periods of high overwhelm or low energy.

### ATS Optimizer & Resume Enhancer

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/routers/resume.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/resume.py)
- [backend/app/services/billy_service.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/services/billy_service.py)
- [backend/app/models/bucket_drop.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/models/bucket_drop.py)
- [Resume-Rockstar-v1.1-main/reports/DEPLOYMENT_STATUS.md](https://github.com/faagestalt-web/ResRock/blob/main/Resume-Rockstar-v1.1-main/reports/DEPLOYMENT_STATUS.md)
- [Resume-Rockstar-v1.1-main/reports/LAUNCH_COMMUNICATIONS_V1.1.md](https://github.com/faagestalt-web/ResRock/blob/main/Resume-Rockstar-v1.1-main/reports/LAUNCH_COMMUNICATIONS_V1.1.md)
- [Resume-Rockstar-v1.1-main/comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/Resume-Rockstar-v1.1-main/comprehensive_reports/comprehensive_state_report.md)
</details>

# ATS Optimizer & Resume Enhancer

The **ATS Optimizer & Resume Enhancer** is a core functional module within the Resume Rockstar platform designed to improve the compatibility of resumes with Applicant Tracking Systems (ATS) while highlighting a candidate's Personal Language Kernel (PLK) resonance. This system utilizes a multi-engine AI approach—leveraging the proprietary **Billy Engine** alongside standard LLMs like OpenAI and Google Gemini—to transform raw work history into achievement-focused, professional narratives.

The system specifically targets neurodivergent professionals, providing tools like "Accomplishment Mode" to quantify impact and "Career Story Mode" to bridge career gaps or non-linear paths into a cohesive professional identity.

Sources: [comprehensive_state_report.md](), [LAUNCH_COMMUNICATIONS_V1.1.md]()

## Core Architecture and Data Flow

The enhancement process follows a structured pipeline beginning with document ingestion and ending with AI-generated optimization suggestions stored in the database.

### Optimization Workflow
1.  **Ingestion**: Resumes are uploaded in PDF, DOCX, or TXT formats and parsed via `pdfplumber` or `python-docx`.
2.  **Analysis**: The backend calls AI services to analyze content for metrics, action verbs, and keyword density.
3.  **Scoring**: The system generates two primary metrics: an **ATS Score** (standard optimization) and a **PLK Score** (resonance with the user's authentic professional voice).
4.  **Persistence**: Results, including enhanced text and scores, are stored in the `resumes` and `ai_analyses` tables.

Sources: [DEPLOYMENT_STATUS.md](), [comprehensive_state_report.md]()

```mermaid
flowchart TD
    A[User Uploads Resume] --> B{File Type?}
    B -->|PDF/DOCX| C[Extract Text via pdfplumber/docx]
    B -->|TXT| D[Direct Text Processing]
    C --> E[Store Raw Text in DB]
    D --> E
    E --> F[Invoke AI Enhancement]
    F --> G[Generate ATS & PLK Scores]
    G --> H[Store Enhanced Result in DB]
    H --> I[Return Optimization UI to User]
```
The diagram above illustrates the sequential flow from initial file upload to the final display of optimized results.
Sources: [DEPLOYMENT_STATUS.md](), [comprehensive_state_report.md]()

## AI Enhancement Engines

The system differentiates itself by using specialized AI "Modes" to process data according to user needs.

### Billy Engine & Career Story Mode
The **Billy Engine** serves as an adaptive companion that maintains context across sessions. It is specifically used in "Career Story Mode" to translate non-linear career paths into compelling narrative-driven resume sections. It identifies "narrative threads" that connect disparate experiences, which is particularly useful for neurodivergent professionals who may have gaps or frequent career pivots.

### Accomplishment Mode
This mode focuses on "quantifying the unquantifiable." It identifies soft skills impact and routine tasks, translating them into achievement-focused statements using the STAR method (Situation, Task, Action, Result). For example, "Worked on a team" is transformed into "Led integration strategy for cross-functional initiative, resulting in 30% efficiency gain."

Sources: [LAUNCH_COMMUNICATIONS_V1.1.md](), [NOTEBOOKLM_INPUT.md]()

### AI Service Integration
The platform uses a "Free-First" routing strategy to manage costs and reliability across different providers.

| Provider | Purpose | Usage Level |
| :--- | :--- | :--- |
| **Google Gemini Pro** | Primary analysis and large context processing | Production |
| **OpenAI GPT-4** | High-precision enhancement and fallback | Production |
| **Billy Engine** | Context-aware narrative building | Proprietary / Core |
| **Ollama** | Local processing and development | Development |

Sources: [comprehensive_state_report.md](), [LAUNCH_COMMUNICATIONS_V1.1.md]()

## Backend Implementation

The logic for resume enhancement is primarily handled by the `resume.py` router and supported by `billy_service.py`.

### Key Endpoints
The following endpoints are critical for the enhancement and optimization flow:

- `POST /api/resume/upload`: Handles file validation, parsing, and storage in Supabase buckets.
- `POST /api/resume/analyze`: Extracts sections (experience, skills) and identifies improvement opportunities.
- `POST /api/resume/parse`: An intelligent endpoint that can optionally trigger "Tapestry extraction" to populate career memories.

Sources: [DEPLOYMENT_STATUS.md](), [Droid_404_Critical_Fixes.md]()

### Data Models
Resume data and its associated analyses are persisted using the following schema:

```mermaid
erDiagram
    users ||--o{ resumes : owns
    resumes ||--o{ ai_analyses : analyzed_by
    resumes {
        uuid id PK
        string original_text
        string enhanced_text
        float ats_score
        float plk_score
        string provider
    }
    ai_analyses {
        uuid id PK
        uuid resume_id FK
        string analysis_type
        json results
        timestamp created_at
    }
```
The `resumes` table stores both the original and enhanced versions to allow for side-by-side comparison in the frontend.
Sources: [DEPLOYMENT_STATUS.md](), [comprehensive_state_report.md]()

## User Interface & Feedback

The frontend provides real-time feedback during the optimization process. Key UI features include:

- **ATS/PLK Scoring**: Visual indicators showing how well the resume matches industry standards versus the user's personal voice.
- **Optimization Suggestions**: Actionable bullet points such as "Add more quantifiable achievements" or "Include action verbs."
- **Text Preview**: A real-time preview of the parsed text before and after AI enhancement.

Sources: [DEPLOYMENT_STATUS.md](), [NOTEBOOKLM_INPUT.md]()

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant AI as AI Engine
    
    U->>FE: Click "Enhance Resume"
    FE->>BE: POST /api/resume/analyze
    BE->>AI: Send text for enhancement
    AI-->>BE: Return optimized sections & scores
    BE-->>FE: Return JSON with results
    FE-->>U: Display scores and suggestions
```
This sequence ensures that the user remains informed of the analysis progress, particularly during long-running LLM calls.
Sources: [comprehensive_state_report.md](), [scripts/generate-mermaid-diagrams.py]()

## Conclusion
The ATS Optimizer & Resume Enhancer functions as more than a simple keyword stuffer; it acts as a cognitive scaffold. By combining technical ATS optimization with narrative-driven "Career Story" and "Accomplishment" modes, it empowers neurodivergent users to present their professional value authentically while meeting the rigid requirements of automated hiring systems. Its architecture is built for scale, utilizing a multi-LLM strategy and robust asynchronous processing to deliver real-time career coaching.

### LLM Orchestration & Multi-Model Cascade

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/services/billy_service.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/services/billy_service.py)
- [backend/app/routers/bucket_drops.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/bucket_drops.py)
- [backend/app/main.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/main.py)
- [comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)
- [scripts/generate-mermaid-diagrams.py](https://github.com/faagestalt-web/ResRock/blob/main/scripts/generate-mermaid-diagrams.py)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [QUICK_REFERENCE.md](https://github.com/faagestalt-web/ResRock/blob/main/QUICK_REFERENCE.md)
</details>

# LLM Orchestration & Multi-Model Cascade

The LLM Orchestration system in Resume Rockstar provides a robust framework for managing AI-driven interactions, specifically designed to support neurodivergent professionals through cognitive scaffolding. The system utilizes a multi-model approach, primarily leveraging the **Billy AI** engine to provide structured analysis of stream-of-consciousness inputs, resume parsing, and career narrative optimization.

By orchestrating calls between multiple providers—including Google Gemini and OpenAI—the system ensures high availability and specialized processing for different tasks like sentiment analysis, achievement extraction, and real-time chat guidance. This orchestration layer is integrated deeply with the backend services to handle tier-gated access and session-based context retention.
Sources: [comprehensive_reports/comprehensive_state_report.md](), [INTEGRATION_COMPLETE_SUMMARY.md]()

## AI Service Architecture & Billy Engine

The core of the LLM orchestration is the `BillyService`, implemented as a singleton pattern to maintain consistency across the application. It serves as the primary gateway to Google Gemini (specifically `gemini-2.0-flash`) and other LLM providers.

### The Multi-Model Cascade Logic
The system is designed to handle requests through a cascade of specialized modules. When a user submits a "Bucket Drop" or a resume for analysis, the orchestration layer determines the appropriate model based on the user's tier (Free, Standard, or Premium) and the complexity of the task.

```mermaid
flowchart TD
    UserReq[User Input/Request] --> TierCheck{Check User Tier}
    TierCheck -->|Free| BasicModel[Basic Model - Storage Only]
    TierCheck -->|Standard/Premium| BillyOrch[Billy AI Orchestrator]
    
    BillyOrch --> ProviderSelect{Select Provider}
    ProviderSelect -->|Primary| Gemini[Google Gemini Pro]
    ProviderSelect -->|Fallback| OpenAI[OpenAI GPT-4]
    
    Gemini --> Analysis[Structured Analysis]
    OpenAI --> Analysis
    
    Analysis --> Store[Save to PostgreSQL]
    Store --> Return[Return Response to UI]
```
The diagram above illustrates the decision logic within the orchestration layer, showing how user tiers dictate the depth of AI involvement.
Sources: [backend/app/services/billy_service.py](), [QUICK_REFERENCE.md](), [comprehensive_reports/comprehensive_state_report.md]()

### Key Orchestration Components

| Component | Description | Reference File |
|-----------|-------------|----------------|
| `BillyService` | Singleton engine managing LLM API calls and prompt engineering. | `billy_service.py` |
| `LLM Cascade` | Logic that falls back from Gemini to OpenAI if primary service fails. | `comprehensive_state_report.md` |
| `Braintrust` | Monitoring layer for tracking LLM response quality and cost. | `REPO_SNAPSHOT.md` |
| `Tier Gating` | Logic ensuring Premium features (like deep analysis) are only accessible to paid users. | `INTEGRATION_COMPLETE_SUMMARY.md` |

## Data Flow & Response Orchestration

When a user interacts with the Chat or Bucket Drops system, the orchestration layer manages a complex sequence of data extraction, prompt injection, and result parsing.

### Sequence of an Analyzed Interaction
For "Bucket Drops," the system extracts core fears, goals, and constraints from raw stream-of-consciousness text.

```mermaid
sequenceDiagram
    participant U as User
    participant API as FastAPI Router
    participant Orch as Billy Orchestrator
    participant LLM as Google Gemini API
    participant DB as PostgreSQL
    
    U->>API: POST /api/bucket-drops/text
    API->>Orch: request_analysis(content)
    Note over Orch: Injects System Prompt & Context
    Orch->>LLM: Generate Structured JSON
    LLM-->>Orch: {fears, goals, next_steps}
    Orch-->>API: Analysis Object
    API->>DB: Save raw_transcript + analysis
    API-->>U: 200 OK (Analysis Results)
```
The sequence diagram demonstrates the flow from initial user input through the AI analysis orchestration to final persistent storage.
Sources: [INTEGRATION_COMPLETE_SUMMARY.md](), [backend/app/routers/bucket_drops.py]()

## Specialized AI Modules

The orchestration layer categorizes AI tasks into specific modules to maintain "consciousness-serving" functionality for neurodivergent users.

### 1. Career Story & Narrative Mode
This module orchestrates dialogues that help users translate non-linear work histories into professional narratives. It uses specific prompt templates to identify strengths that "exploded picture minds" might overlook.
Sources: [reports/NOTEBOOKLM_INPUT.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:80-90]()

### 2. Accomplishment Extraction
A dedicated orchestration flow that takes routine task descriptions and re-frames them as achievement-focused statements (e.g., translating "I worked on a team" into "Led integration strategy resulting in 30% efficiency gain").
Sources: [reports/NOTEBOOKLM_INPUT.md](), [backend/app/services/billy_service.py]()

### 3. Cognitive State Tracking
The system can orchestrate inputs from the `cognitive-state` endpoint to adjust AI response styles based on the user's reported mood or energy levels.
Sources: [backend/app/routers/bucket_drops.py:40-50](), [QUICK_REFERENCE.md]()

## Technical Implementation Details

The backend leverages `FastAPI` and `SQLAlchemy` to support the orchestration layer.

```python
# Conceptual orchestration flow from billy_service.py and bucket_drops.py
# 1. Router receives content
# 2. Billy Service generates response using gemini-2.0-flash
# 3. Results are parsed into structured JSON for the frontend

# Example Structured Output Orchestrated by Billy:
{
  "core_fears": ["Time management", "Market volatility"],
  "implied_goals": ["Career transition to Tech"],
  "actionable_next_steps": ["Update LinkedIn", "Draft story for Project X"]
}
```
Sources: [backend/app/services/billy_service.py](), [backend/app/routers/bucket_drops.py](), [INTEGRATION_COMPLETE_SUMMARY.md]()

## Summary of Orchestration Features

| Feature | Orchestration Logic | Source |
|---------|---------------------|--------|
| **Multi-Provider Fallback** | Gemini Pro primary, OpenAI backup. | `comprehensive_state_report.md` |
| **Braintrust Integration** | Real-time quality and cost monitoring for all LLM calls. | `REPO_SNAPSHOT.md` |
| **Context Retention** | Uses session IDs to provide persistent memory across chat interactions. | `_LAUNCH_PACKAGE/REPO_SNAPSHOT.md` |
| **STT Orchestration** | Converts audio bytes to text via adapter before passing to Billy AI. | `QUICK_REFERENCE.md` |

The LLM Orchestration & Multi-Model Cascade system serves as the intelligence core of Resume Rockstar. By abstracting complex AI provider logic into a centralized service, the project provides reliable, high-quality cognitive scaffolding. This structure allows for seamless scaling, cost-management through monitoring tools like Braintrust, and a highly personalized experience for users through specialized analysis modules and tier-based feature gating.


## Data Management

### Database Schema & Models

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/Technical-Rebuild-Report.md](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/Technical-Rebuild-Report.md)
- [comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)
- [DEPLOYMENT_READY_STATUS.md](https://github.com/faagestalt-web/ResRock/blob/main/DEPLOYMENT_READY_STATUS.md)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [QUICK_REFERENCE.md](https://github.com/faagestalt-web/ResRock/blob/main/QUICK_REFERENCE.md)
- [FEATURE_INTEGRATION_GUIDE.md](https://github.com/faagestalt-web/ResRock/blob/main/FEATURE_INTEGRATION_GUIDE.md)
</details>

# Database Schema & Models

The Resume Rockstar database architecture is built on a PostgreSQL foundation, managed via Supabase and interfaced through the SQLAlchemy ORM in the FastAPI backend. It serves as the persistent storage layer for a "consciousness-serving" AI platform, capturing everything from traditional user profiles and resumes to unstructured "Bucket Drops" and cognitive states.

The schema is designed to support multi-tenant user access with role-based permissions (Admin/User) and tier-gated features (Free, Standard, Premium). It integrates strictly with AI orchestration services, storing LLM analyses, career "memories," and structured summaries derived from stream-of-consciousness inputs.
Sources: [comprehensive_reports/comprehensive_state_report.md](), [DEPLOYMENT_READY_STATUS.md]()

## Core Data Architecture

The system utilizes 11 primary tables to manage the application lifecycle. The architecture transitions between local development (SQLite) and production environments (PostgreSQL via Supabase) through a specialized connection strategy that handles serverless constraints.
Sources: [backend/app/Technical-Rebuild-Report.md:120-135](), [DEPLOYMENT_READY_STATUS.md]()

### Entity Relationship Diagram
The following ER diagram illustrates the primary relationships between users, their career artifacts, and the AI-driven analysis layers.

```mermaid
erDiagram
    users ||--o{ resumes : owns
    users ||--o{ bucket_drops : records
    users ||--o{ payments : makes
    users ||--o{ chat_sessions : participates
    users ||--o{ admin_logs : generates
    resumes ||--o{ ai_analyses : analyzed_by
    chat_sessions ||--o{ chat_messages : contains

    users {
        uuid id PK
        string email UK
        string password_hash
        string tier
        boolean is_admin
        timestamp created_at
    }

    resumes {
        uuid id PK
        uuid user_id FK
        string title
        text original_text
        json content
        float ats_score
    }

    bucket_drops {
        integer id PK
        integer user_id FK
        text raw_transcript
        json structured_summary
        string session_type
        timestamp created_at
    }

    chat_sessions {
        uuid id PK
        uuid user_id FK
        string mode
        timestamp created_at
    }
```
Sources: [comprehensive_reports/comprehensive_state_report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Primary Tables & Schema Definitions

### User Management (`users`)
This table manages identity and access control. It stores authentication credentials and determines feature availability through the `tier` field.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Primary unique identifier for the user. |
| `email` | String (UK) | Unique email address for login. |
| `password_hash` | String | Bcrypt-hashed password. |
| `tier` | String | Access level: `free`, `standard`, `premium`. |
| `is_admin` | Boolean | Flag for administrative dashboard access. |
| `created_at` | Timestamp | Account creation time. |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

### Resume & Artifacts (`resumes`)
The `resumes` table stores both the raw text extracted from uploads (PDF/DOCX) and the structured JSON results produced by AI enhancement.

| Field | Type | Constraints |
| :--- | :--- | :--- |
| `user_id` | UUID | FK to `users.id` |
| `original_text` | Text | Raw text parsed from files. |
| `enhanced_text` | Text | AI-optimized resume content. |
| `ats_score` | Float | Calculated ATS optimization score. |
| `plk_score` | Float | Personal Language Key resonance score. |

Sources: [reports/DEPLOYMENT_STATUS.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

### Bucket Drops (`bucket_drops`)
A specialized table for the "Bucket Drops" feature, capturing stream-of-consciousness input for neurodivergent-friendly thought capture.

```python
class BucketDrop(Base):
    __tablename__ = 'bucket_drops'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    raw_transcript = Column(Text, nullable=False)
    structured_summary = Column(JSON, nullable=True)
    session_type = Column(String(50), default='general')
    audio_duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```
Sources: [FEATURE_INTEGRATION_GUIDE.md:86-100](), [QUICK_REFERENCE.md]()

## Connection & Engine Configuration

The backend implements a smart engine selection strategy to handle different infrastructure requirements, specifically optimizing for Vercel's serverless environment.

### Connection Strategy Flow
The following flowchart depicts how the backend selects the appropriate database driver and pooling strategy based on the environment.

```mermaid
flowchart TD
    Start[Database Initialization] --> EnvCheck{Environment?}
    EnvCheck -- Vercel=1 --> ProdEngine[PostgreSQL Engine]
    ProdEngine --> NullPool[NullPool Strategy]
    NullPool --> Supabase[Supabase Pooler Port 6543]

    EnvCheck -- Local --> DevEngine[SQLite Engine]
    DevEngine --> QueuePool[QueuePool Strategy]
    QueuePool --> WAL[WAL Mode + Pragmas]

    Supabase --> Connect[Established Connection]
    WAL --> Connect
```

### Serverless Optimization (NullPool)
In production (Vercel + Supabase), the system uses `NullPool`. This is critical for serverless environments where persistent connection pools (like SQLAlchemy's default `QueuePool`) would lead to rapid connection exhaustion on the Supabase free tier (60 connection limit). 
Sources: [backend/app/Technical-Rebuild-Report.md:215-240]()

### Connection Parameters
*   **Production Port:** 6543 (Supabase Transaction Mode Pooler).
*   **SSL Mode:** `require` (Enforced for all remote connections).
*   **Pragmas (SQLite only):** `journal_mode=WAL`, `synchronous=NORMAL`, `foreign_keys=ON`.
Sources: [backend/app/Technical-Rebuild-Report.md:165-185](), [backend/app/Technical-Rebuild-Report.md:255-270]()

## AI & Cognitive Modeling
The database schema extends beyond traditional CRUD to model cognitive states and AI-driven insights. 

### AI Analysis & Chat Sessions
*   **`ai_analyses`**: Stores results from LLM calls (Gemini/OpenAI), including `analysis_type` and `llm_provider`.
*   **`chat_sessions`**: Groups `chat_messages` by interaction mode (e.g., Career Story Mode, Accomplishment Mode).
*   **`memories`**: Stores context persistence for the Billy AI engine to maintain continuity across sessions.
Sources: [comprehensive_reports/comprehensive_state_report.md](), [DEPLOYMENT_READY_STATUS.md]()

## Summary
The Database Schema & Models in Resume Rockstar provide a robust framework for neurodivergent-serving AI applications. By leveraging UUIDs for security, JSON fields for unstructured AI insights, and an environment-aware connection strategy, the system maintains high performance and scalability. The integration of "Bucket Drops" and "Memories" tables specifically addresses the project's goal of creating a persistent "cognitive scaffold" for its users.
Sources: [README.md](), [DEPLOYMENT_READY_STATUS.md]()

### File Storage Solutions

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/routers/resume.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/resume.py)
- [backend/app/routers/bucket_drops.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/bucket_drops.py)
- [comprehensive_reports/DEPLOYMENT_STATUS.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/DEPLOYMENT_STATUS.md)
- [reports/DEPLOYMENT_STATUS.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/DEPLOYMENT_STATUS.md)
- [comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
</details>

# File Storage Solutions

## Introduction
File Storage Solutions within the ResRock project provide a robust infrastructure for handling user-uploaded content, specifically resumes and audio-based "Bucket Drops." The system leverages S3-compatible cloud storage through Supabase to ensure scalability and persistent access to assets across the application's lifespan. By integrating cloud storage with AI-driven parsing and database persistence, the solution enables neurodivergent users to capture and optimize their professional narratives without the friction of manual data entry.

The scope of this system covers the end-to-end lifecycle of a file: from the initial frontend upload to backend validation, third-party cloud storage, text extraction (parsing), and final metadata storage in PostgreSQL. This architecture supports core features such as [Resume Optimization](#resume-optimization) and [Bucket Drops](#bucket-drops-integration).

Sources: [comprehensive_reports/DEPLOYMENT_STATUS.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Architecture and Components

The storage architecture is built upon a multi-tier approach involving the API layer (FastAPI), the storage layer (Supabase Storage), and the data layer (PostgreSQL). 

### Storage Infrastructure
ResRock utilizes Supabase Storage, which is S3-compatible, for physical file persistence. The system requires specific "buckets" to be configured in the Supabase Dashboard.

| Bucket Name | Purpose | Configuration |
| :--- | :--- | :--- |
| `resumes` | Stores PDF, DOCX, and TXT resume files. | Public for `get_public_url()` access. |
| `uploads` | General file uploads including images and attachments. | Optional/Public. |

Sources: [comprehensive_reports/DEPLOYMENT_STATUS.md](), [reports/DEPLOYMENT_STATUS.md]()

### Data Flow Overview
When a file is uploaded, the backend performs dual actions: it streams the file to the Supabase cloud bucket and simultaneously passes the file buffer to specialized parsers for text extraction.

```mermaid
graph TD
    User[User Client] -->|POST /api/resume/upload| API[FastAPI Backend]
    subgraph Storage_Process[Storage Processing]
        API -->|Validate| Check[File Type Check]
        Check -->|Stream| S3[Supabase Storage S3]
        Check -->|Parse| P1[pdfplumber/docx Parser]
    end
    S3 -->|Return URL| API
    P1 -->|Return Text| API
    API -->|Metadata + URL| DB[(PostgreSQL)]
    API -->|Success Response| User
```
This diagram illustrates the parallel processing of files for both persistence and analysis.
Sources: [comprehensive_reports/DEPLOYMENT_STATUS.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Resume Upload and Parsing

The resume storage system is designed to handle multiple file formats, specifically targeting extraction for AI analysis. 

### Supported Formats and Parsers
The backend utilizes specialized Python libraries to extract text content from binary file formats.

*   **.pdf**: Primary extraction is handled by `pdfplumber`, with `PyPDF2` as a fallback or alternative to resolve import dependencies.
*   **.docx**: Handled by `python-docx`.
*   **.txt**: Standard UTF-8 decoding.

Sources: [comprehensive_reports/DEPLOYMENT_STATUS.md](), [reports/DEPLOYMENT_STATUS.md]()

### API Endpoints for Resume Storage

| Endpoint | Method | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/resume/upload` | POST | `file`, `analyze_now` | Uploads to Supabase, parses text, and returns a public URL. |
| `/api/resume/analyze` | POST | `file` | Performs deep AI analysis on the uploaded file buffer. |

Sources: [comprehensive_reports/DEPLOYMENT_STATUS.md](), [reports/DEPLOYMENT_STATUS.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Bucket Drops and Audio Storage

The "Bucket Drops" feature utilizes storage for capturing stream-of-consciousness audio thoughts. These are processed via a STT (Speech-to-Text) adapter before storage.

### Audio Integration Flow
Audio files are handled via the `bucket_drops` router, which integrates with the `stt_adapter` to transcribe file bytes into raw text before saving the record.

```mermaid
sequenceDiagram
    participant U as User
    participant B as /api/bucket-drops/upload
    participant S as STT Adapter
    participant ST as Supabase Storage
    participant DB as Database

    U->>B: Upload Audio File
    B->>S: transcribe_file_bytes(audio)
    S-->>B: Raw Text Transcript
    B->>ST: Store Audio File
    ST-->>B: Audio File URL
    B->>DB: Save Record (Transcript + URL)
    B-->>U: Success (Analysis + ID)
```
The sequence demonstrates how audio is converted to text and stored simultaneously.
Sources: [backend/app/routers/bucket_drops.py](), [reports/DEPLOYMENT_STATUS.md]()

## Implementation Details

### Configuration Requirements
The storage solution depends on specific environment variables for cloud connectivity.

```bash
# S3/Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```
Sources: [comprehensive_reports/DEPLOYMENT_STATUS.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

### Error Handling and Validation
The storage system implements several layers of validation to ensure data integrity:
1.  **File Type Validation**: Only PDF, DOCX, and TXT are permitted for resumes.
2.  **Initialization Checks**: Logs warnings if the Supabase Storage client fails to initialize.
3.  **Parsing Graceful Failures**: If a PDF is corrupted or a scanned image, the system returns specific parse error logs.

Sources: [comprehensive_reports/DEPLOYMENT_STATUS.md](), [reports/DEPLOYMENT_STATUS.md]()

## Database Persistence
Metadata regarding stored files is persisted in the PostgreSQL database to link cloud assets to user profiles.

| Field | Type | Description |
| :--- | :--- | :--- |
| `original_text` | TEXT | The raw text extracted from the file. |
| `file_path` | VARCHAR | The path/key to the file in Supabase Storage. |
| `status` | VARCHAR | Current status of the upload (e.g., success, pending). |
| `user_id` | UUID (FK) | Links the file to a specific user account. |

Sources: [comprehensive_reports/comprehensive_state_report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Conclusion
The File Storage Solutions in ResRock integrate seamless cloud persistence with immediate content extraction. By utilizing a public bucket strategy for resumes and a managed STT pipeline for bucket drops, the system ensures that user data is not only safely stored but also immediately available for AI-driven career enhancement and cognitive scaffolding.

Sources: [comprehensive_reports/DEPLOYMENT_STATUS.md](), [reports/DEPLOYMENT_STATUS.md]()

### Memory & Session Management

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/routers/memories.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/memories.py)
- [backend/app/routers/chat.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/chat.py)
- [backend/app/models/bucket_drop.py](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [frontend/src/components/MemoryTimeline.tsx](https://github.com/faagestalt-web/ResRock/blob/main/DEPLOYMENT_READY_STATUS.md)
- [backend/app/main.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/main.py)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [DEPLOYMENT_READY_STATUS.md](https://github.com/faagestalt-web/ResRock/blob/main/DEPLOYMENT_READY_STATUS.md)

</details>

# Memory & Session Management

Memory & Session Management in Resume Rockstar provides a persistent cognitive infrastructure for neurodivergent professionals. The system is designed to capture fleeting insights, maintain context across long-term career narratives, and organize these data points into accessible, structured formats. It functions as "cognitive scaffolding," ensuring that user context is preserved even when cognitive transitions occur.

The system comprises three primary layers: **Chat Sessions**, which manage interactive dialogues; **Memories**, which store long-term context and synthesized accomplishments; and **Bucket Drops**, which serve as zero-friction entry points for raw thoughts and voice recordings.

## System Architecture and Data Flow

The management of memories and sessions follows a tiered architecture involving frontend visualization, backend API orchestration, and a PostgreSQL database layer for persistence.

```mermaid
graph TD
    subgraph Client_Layer["Frontend Layer"]
        UI[MemoryTimeline UI]
        CH[Chat Interface]
        BD[BucketDrop Widget]
    end

    subgraph API_Layer["Backend (FastAPI)"]
        MR[Memories Router]
        CR[Chat Router]
        BR[Bucket Drops Router]
        BE[Billy AI Engine]
    end

    subgraph Data_Layer["Database (PostgreSQL)"]
        DB_M[(Memories Table)]
        DB_S[(Chat Sessions Table)]
        DB_B[(Bucket Drops Table)]
    end

    UI --> MR
    CH --> CR
    BD --> BR
    
    MR --> DB_M
    CR --> DB_S
    BR --> DB_B
    
    BE -.->|Synthesize| MR
    BE -.->|Analyze| BR
```
*The diagram above illustrates the interaction between frontend components, specialized backend routers, and the persistent storage tables.*
Sources: [DEPLOYMENT_READY_STATUS.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Chat Session Management

Chat sessions are the primary mechanism for interactive resume building. They maintain a history of messages and can be categorized by "mode" to provide specialized AI guidance.

### Session Characteristics
- **Mode-Based Processing**: Sessions can operate in `Career Story Mode`, `Accomplishment Mode`, or `Guided Chat`.
- **Context Persistence**: Sessions store individual messages linked to a specific session ID, ensuring continuity across interactions.
- **Tier-Gated Access**: The system implements rate limiting and feature access (e.g., unlimited history) based on the user's subscription tier (Free, Standard, Premium).

| Component | Description | Source |
|-----------|-------------|--------|
| `chat_sessions` | Database table storing metadata like user ID, mode, and creation time. | [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]() |
| `chat_messages` | Individual message records linked to a session (Role, Content). | [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]() |
| `GET /api/chat/history` | Endpoint to retrieve chronological session data. | [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]() |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [README.md]()

## Memories and Cognitive Scaffolding

Memories represent a refined layer of data, often synthesized from chat sessions or document uploads. They are designed for context persistence and long-term visualization through the `MemoryTimeline`.

### Core Memory Logic
The memory system allows for the creation of "Accomplishment" records which are achievement-focused statements derived from user input. These records can be "synthesized" with the Billy AI engine to transform raw work experience into professional narratives.

```mermaid
sequenceDiagram
    participant U as User
    participant MR as Memories Router
    participant BE as Billy AI Engine
    participant DB as PostgreSQL

    U->>MR: POST /api/memories/ (with synthesize=true)
    MR->>BE: Request Synthesis
    BE-->>MR: Return Refined Achievement
    MR->>DB: Save Memory Record
    DB-->>MR: Confirm Save
    MR-->>U: Return Synthesized Memory
```
*Synthesis flow for creating achievement-focused memory records.*
Sources: [backend/app/routers/memories.py](), [Droid_404_Critical_Fixes.md]()

### Memory API Endpoints
Endpoints are registered in the main application entry point to handle lifecycle operations for user memories.

- `GET /api/memories/`: Retrieves a list of memories, supporting parameters for `category`, `tag`, and `limit`.
- `POST /api/memories/`: Creates a new memory record, with an optional flag for `synthesize_with_billy`.

Sources: [backend/app/main.py](), [Droid_404_Critical_Fixes.md]()

## Bucket Drops: Zero-Friction Capture

Bucket Drops serve as the intake layer for Memory & Session Management. They are designed for "lightning-capture" of fleeting insights without requiring the user to immediately organize the data.

### Data Capture Types
1. **Text Drops**: Quick captures of written thoughts or "rambles."
2. **Audio Drops**: Voice recordings processed through a Speech-to-Text (STT) adapter.

### Persistence and Analysis
Bucket drops are stored with raw transcripts and optional structured summaries. For premium users, the Billy AI engine performs a "consciousness analysis" on these drops to extract themes, goals, and professional insights that can later be promoted to the Memory layer.

| Field | Type | Description |
|-------|------|-------------|
| `raw_transcript` | TEXT | The original captured input. |
| `structured_summary` | JSON | AI-generated analysis of the drop (Premium only). |
| `session_type` | VARCHAR | Categorization (e.g., 'general', 'experience'). |

Sources: [QUICK_REFERENCE.md](), [DEPLOYMENT_READY_STATUS.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Conclusion

Memory & Session Management acts as the persistent backbone of the Resume Rockstar platform. By leveraging a tiered approach—moving from raw Bucket Drops to interactive Chat Sessions and finally to synthesized Memories—the system ensures that neurodivergent professionals can capture information in real-time while maintaining a coherent, structured career narrative over time. This infrastructure directly supports the "Digital Scaffolding" philosophy by compensating for cognitive load limitations through persistent, AI-curated context.


## Frontend Components

### UI Framework & Feature Gates

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [frontend/src/app/enhanced-statsig-provider.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/app/enhanced-statsig-provider.tsx)
- [frontend/components.json](https://github.com/faagestalt-web/ResRock/blob/main/frontend/components.json)
- [frontend/src/components/FeatureGates/ATSAnalysisCard.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/components/FeatureGates/ATSAnalysisCard.tsx)
- [frontend/src/components/ui/button.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/components/ui/button.tsx)
- [frontend/src/app/layout.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/app/layout.tsx)
- [frontend/src/app/providers.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/app/providers.tsx)
</details>

# UI Framework & Feature Gates

The UI Framework and Feature Gate system in ResRock provides a robust architecture for delivering a personalized, neurodivergent-friendly interface. It leverages Next.js 14, Tailwind CSS, and Shadcn UI components to create a consistent design language, while utilizing Statsig for dynamic feature flagging and experimentation. This combination allows for a "consciousness-serving" application that adapts its layout and features based on user specific needs and access tiers.

The framework is structured around an atomic design approach with foundational UI primitives (like buttons and inputs) managed through `components.json`, and advanced logic-heavy components that react to feature gates.

## UI Component Architecture

The ResRock frontend utilizes a modular component architecture based on Radix UI primitives and Tailwind CSS styling. This architecture is defined and managed through a central configuration that specifies aliases and dependencies for various UI elements.

### UI Primitives and Shadcn Integration
The system uses `shadcn/ui` for foundational components, which are configured to reside in the `src/components/ui` directory. Components are built using a utility-first CSS approach with Tailwind, ensuring high customizability and performance.

| Component Path | Description | Key Features |
| :--- | :--- | :--- |
| `src/components/ui/button.tsx` | Standard button primitive | Supports variants (default, destructive, outline), sizes, and `asChild` for composition. |
| `src/components/ui/input.tsx` | Basic text input | Styled for accessibility and consistency within the ResRock theme. |
| `src/components/ui/card.tsx` | Container for content | Used as the base for complex units like `ATSAnalysisCard`. |

Sources: [frontend/components.json:1-40](), [frontend/src/components/ui/button.tsx:1-45]()

### Layout and Provider Pattern
To manage cross-cutting concerns like authentication, theming, and feature flagging, ResRock employs a provider wrapper pattern. This ensures that client-side hooks are available throughout the component tree while maintaining compatibility with Next.js Server Components.

```mermaid
flowchart TD
    RL[Root Layout] --> P[Providers Wrapper]
    P --> ALP[AdaptiveLayoutProvider]
    P --> AP[AuthProvider]
    P --> ESP[EnhancedStatsigProvider]
    ESP --> Pages[Application Pages]
```
The diagram shows the hierarchy of context providers that wrap the application content.
Sources: [frontend/src/app/providers.tsx:7-17](), [frontend/src/app/layout.tsx:18-35]()

## Feature Gates and Statsig Integration

ResRock implements sophisticated feature flagging through an `EnhancedStatsigProvider`. This system allows the application to toggle visibility of features like ATS Analysis or advanced AI career story modes based on user segments or experimental buckets.

### Enhanced Statsig Provider
The `EnhancedStatsigProvider` is responsible for initializing the Statsig SDK with the user's identity and providing a loading state while the feature gates are being fetched. It wraps the application to ensure that any component can check feature status using Statsig hooks.

*   **SDK Key**: Retrieved from `process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY`.
*   **User Identification**: Uses user IDs and emails to determine gate eligibility.
*   **Loading UI**: Displays a dedicated loading state to prevent flickering of gate-protected content.

Sources: [frontend/src/app/enhanced-statsig-provider.tsx:5-45]()

### Gate-Protected Components
Specific features are encapsulated in "Gate" components. For example, the `ATSAnalysisCard` checks if a specific gate is enabled before rendering the full analysis interface. If the gate is closed, it may render a placeholder or nothing at all.

```mermaid
sequenceDiagram
    participant User
    participant Card as ATSAnalysisCard
    participant SDK as Statsig SDK
    User->>Card: Access Analysis Page
    Card->>SDK: useGate("ats_analysis_enabled")
    alt Gate is Open
        SDK-->>Card: true
        Card->>Card: Render Analysis Metrics
    else Gate is Closed
        SDK-->>Card: false
        Card->>Card: Render Upgrade Prompt
    end
```
This flow illustrates how the UI dynamically adapts based on remote feature gate configurations.
Sources: [frontend/src/components/FeatureGates/ATSAnalysisCard.tsx:10-40]()

## Design Configuration

The visual framework is grounded in a `tailwind.config.js` and `components.json` setup that defines the theme, spacing, and component behavior.

### Framework Configuration
The `components.json` file dictates the project structure and how UI components are generated and referenced.

| Option | Value | Purpose |
| :--- | :--- | :--- |
| `style` | `default` | Uses the standard Shadcn design tokens. |
| `rsc` | `true` | Supports React Server Components. |
| `tsx` | `true` | Uses TypeScript for all component generation. |
| `tailwind.config` | `tailwind.config.js` | Path to the central styling configuration. |

Sources: [frontend/components.json:1-20]()

## Critical Framework Fixes

During the development of the UI framework, several critical architectural issues were identified and addressed to ensure stability and build success:

1.  **File Extensions**: Renaming components from `.ts` to `.tsx` was required to support JSX syntax within TypeScript files.
2.  **Provider Wrapper**: The creation of `src/app/providers.tsx` as a `'use client'` component was necessary to prevent Server Component violations when using hooks like `useState` and `useContext` in the root layout.
3.  **Dependency Management**: Ensuring `@heroicons/react` and testing frameworks like `jest` were properly installed to support the UI components and their verification.

Sources: [FRONTEND_DEBUG_SUMMARY.md:10-50](), [FRONTEND_FIX_CHECKLIST.md:15-40]()

## Conclusion

The UI Framework and Feature Gate system in ResRock provides the necessary infrastructure for a dynamic and accessible user experience. By combining atomic UI components with a centralized feature management system through Statsig, the project enables rapid iteration and tier-based feature delivery. This architecture ensures that the "cognitive scaffolding" intended by the project remains flexible and responsive to user needs.

### Resume Studio Interface

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [frontend/src/components/ResumeStudio/DocumentUpload.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/components/ResumeStudio/DocumentUpload.tsx)
- [frontend/src/components/ResumeStudio/VoiceInput.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/components/ResumeStudio/VoiceInput.tsx)
- [frontend/src/pages/resume-studio.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/pages/resume-studio.tsx)
- [frontend/src/stores/tapestryStore.ts](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/stores/tapestryStore.ts)
- [backend/app/routers/resume.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/resume.py)
- [Resume-Rockstar-v1.1-main/Droid_404_Critical_Fixes.md](https://github.com/faagestalt-web/ResRock/blob/main/Droid_404_Critical_Fixes.md)
</details>

# Resume Studio Interface

## Introduction
The Resume Studio Interface serves as the primary workspace within the Resume Rockstar platform for crafting and optimizing professional resumes. It is designed specifically for neurodivergent professionals, employing a "cognitive scaffolding" approach that moves away from traditional, linear resume building in favor of narrative-driven and multi-modal input methods.

The interface integrates advanced AI capabilities via the Billy Engine to help users articulate their value. It supports diverse input methods, including interactive AI chat, voice transcription, and document parsing. These inputs are not only used to generate resume sections but also to auto-populate the Tapestry Studio, a system that tracks career "narrative threads" and key memories.
Sources: [README.md](), [Droid_404_Critical_Fixes.md:12-15](), [NOTEBOOKLM_INPUT.md:Part 3]()

## Core Components and Architecture

### Multi-Modal Input System
The Resume Studio utilizes a modular component architecture to handle different data entry methods. This allows users to choose the mode that best fits their current cognitive load or preference.

*   **Voice Input:** Uses a specialized component and the `navigator.mediaDevices` API to capture audio, which is then sent to a backend transcription service enhanced by the Billy Engine.
*   **Document Upload:** Handles PDF, DOCX, and TXT files. It performs a two-step process: uploading the file to Supabase storage and then parsing it for both structured resume data and "Tapestry" insights.
*   **AI Chat Assistant:** (Integrated via the main Studio page) Provides Guided, Career Story, and Accomplishment modes for interactive content generation.

Sources: [Droid_404_Critical_Fixes.md:58-65, 137-142, 239-250](), [NOTEBOOKLM_INPUT.md:Part 3]()

### Architecture Diagram: Data Ingestion and Processing
The following diagram illustrates how various inputs are processed through the Resume Studio and integrated into the backend and state management stores.

```mermaid
flowchart TD
    User[User Interface] --> Voice[VoiceInput Component]
    User --> Upload[DocumentUpload Component]
    User --> Chat[AI Chat Assistant]
    
    Voice -->|Audio Blob| V_API[/api/voice/transcribe/]
    V_API -->|Enhanced Transcript| UI_Update[Update Resume Fields]
    
    Upload -->|File| S_Store[(Supabase Storage)]
    S_Store -->|File URL| P_API[/api/resume/parse/]
    
    P_API -->|Parsed Data| UI_Update
    P_API -->|Tapestry Insights| T_Store[[tapestryStore Zustand]]
    
    T_Store -->|Career Moments| B_API[/api/bucket-drops/capture/]
```
Sources: [Droid_404_Critical_Fixes.md:83-120, 155-190, 220-235](), [comprehensive_state_report.md:Architecture Overview]()

## Feature Breakdown

### 1. Voice-Powered Resume Building
The `VoiceInput` component enables users to speak naturally about their experiences. The system records audio in `audio/webm;codecs=opus` format and utilizes the Billy Engine to enhance the raw transcript, making it more professional while retaining the user's authentic voice.

| Function/Ref | Description | Source |
| :--- | :--- | :--- |
| `startRecording` | Accesses microphone and initializes `MediaRecorder`. | [Droid_404_Critical_Fixes.md:73-95]() |
| `transcribeAudio` | Sends audio blob to `/api/voice/transcribe` with `enhance_with_billy: true`. | [Droid_404_Critical_Fixes.md:108-125]() |
| `onTranscriptReceived` | Callback to append generated text to the active resume section. | [Droid_404_Critical_Fixes.md:122, 246-249]() |

### 2. Intelligent Document Parsing
The `DocumentUpload` component automates the transition from old resumes to the new platform. It extracts structured data for immediate field population and deeper career insights for long-term narrative building.

```mermaid
sequenceDiagram
    participant U as User
    participant C as DocumentUpload Component
    participant S as Supabase Storage
    participant B as Backend Parser
    participant T as Tapestry Store

    U->>C: Selects PDF/DOCX
    C->>S: POST /api/upload/resume
    S-->>C: file_url, file_id
    C->>B: POST /api/resume/parse (extract_for_tapestry=true)
    B-->>C: parsed_data, tapestry_insights
    C->>T: addExtractedData(insights)
    Note over C,T: Auto-populates experiences & skills
```
Sources: [Droid_404_Critical_Fixes.md:144-190](), [DEPLOYMENT_STATUS.md:File Upload Flow]()

### 3. Tapestry Studio Integration
A key feature of the interface is the automatic population of the Tapestry Studio. When a document is parsed, the system extracts "Career Moments" and "Narrative Threads." These are stored in a Zustand-based `tapestryStore` and also sent to the `bucket-drops` API to create persistent career memories.

**Extracted Insights Schema:**
*   **Experiences:** Title/role, company, dates, and description.
*   **Skills:** A unique set of demonstrated technical and soft skills.
*   **Achievements:** Specific career "wins" categorized as accomplishments.
*   **Narrative Threads:** Connecting themes identified by Billy Module-2.

Sources: [Droid_404_Critical_Fixes.md:192-218, 264-285](), [PACKAGE_CONTENTS.md:Frontend]()

## Technical Implementation Details

### API Endpoints for Resume Studio
The interface interacts with several specific endpoints to facilitate its operations:

| Endpoint | Method | Purpose | Source |
| :--- | :--- | :--- | :--- |
| `/api/voice/transcribe` | POST | Transcribes audio and enhances text via Billy. | [Droid_404_Critical_Fixes.md:115]() |
| `/api/upload/resume` | POST | Stores physical files in Supabase buckets. | [Droid_404_Critical_Fixes.md:156]() |
| `/api/resume/parse` | POST | Extracts structured JSON from uploaded documents. | [Droid_404_Critical_Fixes.md:164]() |
| `/api/bucket-drops/capture` | POST | Captures career moments for long-term memory. | [Droid_404_Critical_Fixes.md:198]() |
| `/api/memories/` | POST | Stores achievements synthesized by AI. | [Droid_404_Critical_Fixes.md:210]() |

### State Management (Zustand)
The `tapestryStore` manages the local state of extracted insights. It uses the `persist` middleware to ensure career data remains available across browser sessions.

```typescript
// Example of the addExtractedData logic
addExtractedData: (newData) => set((state) => ({
  data: {
    experiences: [...state.data.experiences, ...(newData.experiences || [])],
    skills: [...new Set([...state.data.skills, ...(newData.skills || [])])],
    achievements: [...state.data.achievements, ...(newData.achievements || [])],
    narrative_threads: [...state.data.narrative_threads, ...(newData.narrative_threads || [])]
  }
}))
```
Sources: [Droid_404_Critical_Fixes.md:225-238]()

## Conclusion
The Resume Studio Interface represents a departure from static form-filling. By integrating voice, document parsing, and AI-driven synthesis into a single environment, it reduces the executive function burden on users. The tight integration with the Tapestry Studio ensures that every input contributes to a larger, persistent narrative of the professional's career journey, facilitating easier resume updates and interview preparation in the future.
Sources: [Droid_404_Critical_Fixes.md:289-293](), [NOTEBOOKLM_INPUT.md:Part 5]()

### Voice Processor & Transcription

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [frontend/src/lib/hooks/useVoiceInput.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/lib/hooks/useVoiceInput.tsx)
- [frontend/src/components/ResumeStudio/VoiceInput.tsx](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/components/ResumeStudio/VoiceInput.tsx)
- [backend/app/services/voice_processor.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/services/voice_processor.py)
- [backend/app/routers/voice.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/voice.py)
- [PHASE_A_B_DIAGNOSTIC_AND_IMPLEMENTATION_PLAN.md](https://github.com/faagestalt-web/ResRock/blob/main/PHASE_A_B_DIAGNOSTIC_AND_IMPLEMENTATION_PLAN.md)
- [Droid_404_Critical_Fixes.md](https://github.com/faagestalt-web/ResRock/blob/main/Droid_404_Critical_Fixes.md)

</details>

# Voice Processor & Transcription

The Voice Processor & Transcription system in Resume Rockstar is a specialized module designed to facilitate zero-friction career experience capture for neurodivergent professionals. By allowing users to naturally narrate their career stories or accomplishments, the system overcomes the executive function challenges associated with a "blank page" and formal writing.

The system is integrated into the **Resume Studio** and the **Bucket Drops** feature, providing a bridge between spoken narrative and structured resume data. It utilizes a frontend recording interface that communicates with a FastAPI backend, leveraging high-performance transcription services like OpenAI's Whisper API to convert audio into usable text.
Sources: [PHASE_A_B_DIAGNOSTIC_AND_IMPLEMENTATION_PLAN.md](), [Droid_404_Critical_Fixes.md]()

## System Architecture & Data Flow

The voice processing pipeline spans from the user's browser to external AI services. The frontend captures raw audio using the MediaRecorder API, which is then transmitted as a multipart form-data payload to the backend.

### Voice Integration Flow
The following diagram illustrates the end-to-end flow from the initial audio capture to the final text transcription.

```mermaid
flowchart TD
    User[User Interface] -->|Start Recording| Media[MediaRecorder API]
    Media -->|Audio Chunks| Blob[Audio Blob .webm]
    Blob -->|POST /api/voice/transcribe| Router[Voice Router]
    Router -->|Validation| Service[VoiceProcessor Service]
    Service -->|Request| Whisper[OpenAI Whisper API]
    Whisper -->|Raw Transcript| Billy[Billy AI Engine]
    Billy -->|Enhanced Text| Router
    Router -->|JSON Response| User
```
Sources: [Droid_404_Critical_Fixes.md:46-95](), [backend/app/services/voice_processor.py]()

## Frontend Components

The frontend implementation centers around the `VoiceInput` component and the `useVoiceInput` hook, providing a reactive interface for recording.

### VoiceInput Component
Located in `frontend/src/components/ResumeStudio/VoiceInput.tsx`, this component manages the UI states for recording (idle, recording, processing). It uses `lucide-react` for visual indicators and `sonner` for user notifications.

Key responsibilities include:
*   Requesting microphone permissions via `navigator.mediaDevices.getUserMedia`.
*   Managing `MediaRecorder` lifecycle (start, stop, data available).
*   Handling the audio blob creation with the `audio/webm;codecs=opus` mime-type.
*   Dispatching the audio to the transcription endpoint.

Sources: [Droid_404_Critical_Fixes.md:46-80](), [frontend/src/components/ResumeStudio/VoiceInput.tsx]()

### Client-Side Transcription Logic
The frontend prepares a `FormData` object containing the audio file and an `enhance_with_billy` flag. This flag triggers the backend to not only transcribe but also refine the text using the project's specialized AI persona.

```typescript
const transcribeAudio = async (audioBlob: Blob) => {
  setIsProcessing(true);
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('enhance_with_billy', 'true');

    const response = await axios.post('/api/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    // Final text prioritizes enhanced version over raw transcript
    const { billy_enhanced, transcript } = response.data;
    onTranscriptReceived(billy_enhanced || transcript);
  } finally {
    setIsProcessing(false);
  }
};
```
Sources: [Droid_404_Critical_Fixes.md:82-108]()

## Backend Implementation

The backend is composed of a FastAPI router that handles HTTP requests and a service layer that communicates with external APIs.

### Voice Router
The `backend/app/routers/voice.py` file defines the entry point for transcription requests. It performs basic validation and passes the audio bytes to the service layer.

| Endpoint | Method | Input | Description |
| :--- | :--- | :--- | :--- |
| `/api/voice/transcribe` | POST | `audio` (UploadFile), `enhance_with_billy` (bool) | Transcribes audio and optionally enhances it with Billy AI. |

Sources: [backend/app/routers/voice.py](), [Droid_404_Critical_Fixes.md:86-89]()

### VoiceProcessor Service
The `VoiceProcessor` service handles the technical details of the transcription process. While currently relying on OpenAI's Whisper API, the architecture is designed for multi-provider fallbacks.

**Current Capabilities:**
*   **Format Validation:** Supports `.wav`, `.mp3`, `.m4a`, and `.ogg`.
*   **Size Constraints:** Enforces a 25MB file limit.
*   **Whisper Integration:** Direct calls to the Whisper API for raw transcription.

Sources: [PHASE_A_B_DIAGNOSTIC_AND_IMPLEMENTATION_PLAN.md:143-157]()

### AI Enhancement (Billy Integration)
When the `enhance_with_billy` flag is set, the raw transcript is passed to the **Billy AI Engine**. This engine applies narrative-aware refinements specifically tuned for neurodivergent career storytelling, transforming fragmented speech into professional resume language.
Sources: [Droid_404_Critical_Fixes.md:100-103](), [PHASE_A_B_DIAGNOSTIC_AND_IMPLEMENTATION_PLAN.md:23-35]()

## Sequence of Operations

The interaction between the user and the system follows a strictly defined sequence of events:

```mermaid
sequenceDiagram
    participant U as User
    participant V as VoiceInput Component
    participant R as Voice Router (Backend)
    participant W as Whisper API
    
    U->>V: Click Mic Button
    V->>V: navigator.mediaDevices.getUserMedia()
    V-->>U: Recording Started (Toast)
    U->>V: Click Stop
    V->>V: Create Blob (webm/opus)
    V->>R: POST /api/voice/transcribe (FormData)
    R->>W: audio_bytes to Whisper
    W-->>R: "I led a team that built..."
    Note right of R: Optional: Billy AI Enhancement
    R-->>V: JSON {transcript: "...", billy_enhanced: "..."}
    V->>U: Update UI with final text
```
Sources: [Droid_404_Critical_Fixes.md:58-105](), [backend/app/services/voice_processor.py]()

## Summary
The Voice Processor & Transcription module serves as a critical accessibility feature within Resume Rockstar. By combining browser-based audio capture with backend AI services, it allows users to convert raw spoken experiences into professional resume content. The architecture ensures low-latency feedback while providing a foundation for future enhancements such as streaming transcription and Text-to-Speech (TTS) capabilities.
Sources: [PHASE_A_B_DIAGNOSTIC_AND_IMPLEMENTATION_PLAN.md:154-159](), [Droid_404_Critical_Fixes.md:283]()


## Backend Systems

### FastAPI Application Structure

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/main.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/main.py)
- [backend/app/core/config.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/core/config.py)
- [backend/app/core/database.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/core/database.py)
- [backend/app/Technical-Rebuild-Report.md](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/Technical-Rebuild-Report.md)
- [comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)
- [backend/requirements.txt](https://github.com/faagestalt-web/ResRock/blob/main/backend/requirements.txt)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
</details>

# FastAPI Application Structure

The FastAPI application serves as the core backend engine for the Resume Rockstar platform. It is designed with a modular architecture that separates configuration, database management, and business logic into distinct layers. This structure supports "consciousness-serving" AI features for neurodivergent professionals by providing a robust, scalable environment for LLM integrations, file processing, and real-time user interactions.

The backend is built using Python 3.12 and leverages FastAPI's asynchronous capabilities to handle high-concurrency tasks such as AI chat sessions and resume parsing. It is specifically optimized for deployment in serverless environments like Vercel through custom connection pooling strategies.

Sources: [comprehensive_reports/comprehensive_state_report.md](), [backend/app/Technical-Rebuild-Report.md]()

## Core Application Components

The application entry point is located in `backend/app/main.py`. This file initializes the FastAPI instance, configures middleware, and registers the various API routers that handle different functional domains of the system.

### Application Initialization and Middleware
The application uses the `FastAPI` class to create the main application object. Key configurations include:
*   **CORS Middleware:** Configured to allow cross-origin requests from the Next.js frontend, restricted to specific origins defined in settings for security.
*   **Router Registration:** Routes are grouped into logical modules such as `auth`, `chat`, `resume`, `upload`, and `admin`.
*   **Health Checks:** A dedicated `/health` endpoint is provided to monitor both application status and database connectivity.

Sources: [backend/app/main.py:1-70](), [backend/app/Technical-Rebuild-Report.md]()

### Backend Architecture Overview
The diagram below illustrates the high-level request flow from the client through the FastAPI middleware and routers to the data and AI layers.

```mermaid
flowchart TD
    Client[Web/Mobile Client] -->|HTTP Request| Main[main.py: FastAPI App]
    Main --> Middleware[CORS/Logging Middleware]
    Middleware --> Routers{API Routers}
    
    Routers -->|Auth| AuthR[auth.py]
    Routers -->|Resume| ResR[resume.py]
    Routers -->|Chat| ChatR[chat.py]
    Routers -->|Admin| AdminR[admin.py]
    
    AuthR & ResR & ChatR & AdminR -->|Depends| DB_Session[Database Session]
    AuthR & ResR & ChatR & AdminR -->|Business Logic| Services[Service Layer]
    
    Services --> DB[(PostgreSQL DB)]
    Services --> LLM[AI/LLM Services]
```
The diagram shows the modular separation between routing, dependency injection (database sessions), and external service integration.
Sources: [backend/app/Technical-Rebuild-Report.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Configuration and Environment Management

Configuration is managed via Pydantic Settings in `backend/app/core/config.py`. This approach ensures type safety and provides validation for environment variables.

### Environment Variables
The system strictly separates configuration from code. Critical secrets, such as database URLs and API keys, are never hardcoded and must be provided via `.env` files or environment settings in production.

| Configuration Key | Type | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | string | PostgreSQL connection string (Supabase) |
| `JWT_SECRET_KEY` | string | Secret used for signing authentication tokens |
| `ENV` | string | Current environment (development, production) |
| `BILLY_API_KEY` | string | API key for the custom Billy AI Engine |
| `CORS_ORIGINS` | list | List of allowed origins for cross-site requests |

Sources: [backend/app/core/config.py](), [backend/app/Technical-Rebuild-Report.md]()

## Database Layer and Session Management

The database layer, defined in `backend/app/core/database.py`, uses SQLAlchemy 2.0. It features a dual-engine configuration logic that detects the environment to optimize connection performance.

### Connection Strategy
To prevent connection exhaustion in serverless environments like Vercel, the application implements specific pooling strategies:
*   **NullPool:** Used in production (Vercel) to ensure connections are closed immediately after each request.
*   **QueuePool:** Used in traditional server environments to maintain a pool of warm connections for efficiency.
*   **SQLite Support:** The backend supports SQLite for local development, utilizing WAL (Write-Ahead Logging) mode for concurrent access.

Sources: [backend/app/core/database.py:1-110](), [backend/app/Technical-Rebuild-Report.md]()

```mermaid
flowchart TD
    Config[core/config.py] --> DB_Module[core/database.py]
    DB_Module --> DetectEnv{Environment?}
    
    DetectEnv -->|Vercel/Production| NullPool[NullPool Engine]
    DetectEnv -->|Local Dev| SQLite[SQLite Engine + WAL]
    DetectEnv -->|Standard Server| QueuePool[QueuePool Engine]
    
    NullPool & SQLite & QueuePool --> SessionLocal[SessionLocal Factory]
    SessionLocal --> get_db[get_db Dependency]
    get_db --> API_Route[FastAPI Endpoint]
```
This flow illustrates how the application dynamically builds the SQLAlchemy engine based on the environment to ensure reliability.
Sources: [backend/app/Technical-Rebuild-Report.md]()

## API Route Inventory

The application exposes multiple REST endpoints categorized by functional domain. All protected routes require a valid JWT Bearer token.

### Authentication and User Management
```python
# Defined in backend/app/routers/auth.py
POST /api/auth/register  # Create new user
POST /api/auth/login     # Authenticate and receive JWT
GET  /api/auth/me        # Retrieve current user profile
```
Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [backend/app/main.py]()

### Resume and Chat Services
*   **Resume Upload:** Handles PDF, DOCX, and TXT parsing via specialized services.
*   **AI Chat:** Supports multiple modes including "Career Story" and "Accomplishment" modes.
*   **Bucket Drops:** Provides a friction-less thought capture interface for neurodivergent users to record ideas for later integration into resumes.

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/chat/message` | POST | Send message to AI assistant |
| `/api/upload/resume` | POST | Upload and extract text from resume files |
| `/api/bucket-drops/text` | POST | Capture text-based thoughts |
| `/api/admin/health` | GET | Comprehensive system health check |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Conclusion

The FastAPI application structure of Resume Rockstar is engineered for high performance and modularity. By leveraging Pydantic for configuration and a dual-strategy database layer, the system maintains high availability across varied deployment environments. Its clear separation of concerns allows for rapid development of complex AI features while ensuring the stability of core authentication and data persistence services.

Sources: [backend/app/Technical-Rebuild-Report.md](), [comprehensive_reports/comprehensive_state_report.md]()

### API Routes & Endpoints

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/routers/bucket_drops.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/bucket_drops.py)
- [backend/app/routers/auth.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/auth.py)
- [backend/app/routers/resume.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/resume.py)
- [backend/app/routers/admin.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/admin.py)
- [backend/app/routers/chat.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/routers/chat.py)
- [backend/app/main.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/main.py)
</details>

# API Routes & Endpoints

## Introduction
The Resume Rockstar API is built using the FastAPI framework, providing a robust backend for neurodivergent professional support. The architecture is organized into modular routers that handle specific functional domains such as authentication, resume processing, AI-driven chat, and "Bucket Drops" for thought capture. 

The system leverages asynchronous Python to handle complex AI integrations (Google Gemini, OpenAI) and file processing tasks. Authentication is managed through JWT tokens, ensuring secure access to user-specific data across the various modules.
Sources: [backend/app/Technical-Rebuild-Report.md](), [Resume-Rockstar-v1.1-main/README.md]()

## Core API Structure
The application centralizes its routing logic in `backend/app/main.py`, where various feature-specific routers are registered. This modularity allows for clear separation of concerns between user management, AI services, and administrative functions.

### Architecture Overview
The following diagram illustrates the high-level flow of a request through the API Layer:

```mermaid
flowchart TD
    User[User/Client] --> Gateway[FastAPI App/Main]
    Gateway --> Auth[Auth Router]
    Gateway --> AI[AI/Chat Routers]
    Gateway --> Files[Upload/Resume Routers]
    Gateway --> Admin[Admin Router]
    
    Auth --> DB[(PostgreSQL)]
    AI --> LLM[Gemini/OpenAI]
    Files --> Storage[Supabase Storage]
```
The API serves as a bridge between the Next.js frontend and external services like Supabase and various LLM providers.
Sources: [Resume-Rockstar-v1.1-main/comprehensive_reports/comprehensive_state_report.md](), [Resume-Rockstar-v1.1-main/scripts/generate-mermaid-diagrams.py]()

## Functional Endpoints

### Authentication & User Management
The authentication system handles user registration, secure login via JWT, and profile management. It includes role-based access control to distinguish between standard users and administrators.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Creates a new user account. |
| POST | `/api/auth/login` | Authenticates user and returns JWT. |
| POST | `/api/auth/refresh` | Refreshes an expired access token. |
| GET | `/api/auth/me` | Retrieves current authenticated user info. |

Sources: [Resume-Rockstar-v1.1-main/README.md](), [Resume-Rockstar-v1.1-main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

### Resume & File Processing
This module handles the ingestion and analysis of professional documents. It supports PDF, DOCX, and TXT formats, utilizing specialized parsers like `pdfplumber` and `python-docx`.

```mermaid
sequenceDiagram
    participant U as User
    participant R as Resume Router
    participant P as Parser Service
    participant S as Supabase Storage

    U->>R: POST /api/resume/upload (File)
    R->>P: Extract Text
    P-->>R: Plain Text String
    R->>S: Save Original File
    S-->>R: Storage URL
    R-->>U: Return URL + Text Preview
```
Sources: [Resume-Rockstar-v1.1-main/reports/DEPLOYMENT_STATUS.md](), [Resume-Rockstar-v1.1-main/backend/app/Technical-Rebuild-Report.md]()

### AI Chat & "Bucket Drops"
The AI system provides interactive guidance. The "Bucket Drops" feature allows users to capture unstructured thoughts which are then analyzed by the Billy AI service.

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/bucket-drops/text` | POST | Captures text thoughts for AI analysis. |
| `/api/bucket-drops/upload` | POST | Uploads audio for Speech-to-Text conversion. |
| `/api/bucket-drops/list` | GET | Retrieves a history of captured thoughts. |
| `/api/chat/guided` | POST | Initiates a structured AI coaching session. |

Sources: [Resume-Rockstar-v1.1-main/QUICK_REFERENCE.md](), [Resume-Rockstar-v1.1-main/COMPLETE_INTEGRATION_AUDIT.md]()

### Administrative Endpoints
Administrators have access to system-wide health metrics, user analytics, and LLM usage statistics to monitor platform performance and costs.

*   **System Health:** `GET /api/admin/health` checks database connectivity and service status.
*   **User Analytics:** `GET /api/admin/users` provides a list of registered users and their tiers.
*   **AI Metrics:** `GET /api/admin/llm-stats` tracks token usage and provider performance.

Sources: [Resume-Rockstar-v1.1-main/README.md](), [Resume-Rockstar-v1.1-main/reports/DEPLOYMENT_STATUS.md]()

## Implementation Details

### Request Validation
The API utilizes Pydantic schemas for strict request body validation. For example, the `BucketDrop` creation expects a specific JSON structure:

```python
# Example logic for Bucket Drop creation
@router.post("/text")
async def create_text_bucket_drop(
    drop_data: BucketDropCreate, 
    current_user = Depends(get_current_user)
):
    # Logic to process text via BillyService
    analysis = await billy_service.analyze(drop_data.content)
    # Save to DB
    ...
```
Sources: [Resume-Rockstar-v1.1-main/INTEGRATION_AUDIT_REPORT.md](), [Resume-Rockstar-v1.1-main/COMPLETE_INTEGRATION_AUDIT.md]()

### Database Interaction
Endpoints interact with the PostgreSQL database through SQLAlchemy. In serverless environments like Vercel, the API is configured with `NullPool` to prevent connection exhaustion.
Sources: [backend/app/Technical-Rebuild-Report.md]()

## Summary
The Resume Rockstar API Routes and Endpoints provide a comprehensive interface for neurodivergent professional development. By combining traditional CRUD operations with advanced AI processing and secure file management, the API supports complex workflows like real-time resume optimization and cognitive state tracking. The modular router design ensures the system remains maintainable and extensible for future feature deployments.
Sources: [Resume-Rockstar-v1.1-main/README.md](), [Resume-Rockstar-v1.1-main/comprehensive_reports/comprehensive_state_report.md]()

### Database Migrations (Alembic)

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/Technical-Rebuild-Report.md](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/Technical-Rebuild-Report.md)
- [backend/FIX_ALEMBIC_GUIDE.md](https://github.com/faagestalt-web/ResRock/blob/main/backend/FIX_ALEMBIC_GUIDE.md)
- [ALEMBIC_QUICKSTART.md](https://github.com/faagestalt-web/ResRock/blob/main/ALEMBIC_QUICKSTART.md)
- [ALEMBIC_MIGRATION_AUDIT.md](https://github.com/faagestalt-web/ResRock/blob/main/ALEMBIC_MIGRATION_AUDIT.md)
- [backend/MIGRATION_EMERGENCY_FIX.md](https://github.com/faagestalt-web/ResRock/blob/main/backend/MIGRATION_EMERGENCY_FIX.md)
- [scripts/create_tables.sh](https://github.com/faagestalt-web/ResRock/blob/main/scripts/create_tables.sh)
</details>

# Database Migrations (Alembic)

## Introduction
The Database Migration system in Resume Rockstar utilizes Alembic to manage schema evolutions for its PostgreSQL (Supabase) and SQLite databases. It ensures that the database state remains synchronized with the SQLAlchemy models across development, staging, and production environments. The system is designed to handle the complexities of a serverless deployment on Vercel while maintaining a clear, linear history of changes to core application tables, feature-specific modules, and admin analytics.

The migration architecture supports a "Consciousness-Serving" AI platform by providing robust persistence for cognitive tracking, AI chat sessions, and user profiles. It includes automated scripts for table creation and verification, as well as emergency procedures for fixing broken migration chains that may occur during rapid AI-assisted development.

Sources: [backend/app/Technical-Rebuild-Report.md](), [ALEMBIC_MIGRATION_AUDIT.md:5-15](), [scripts/create_tables.sh:1-15]()

## Migration Lifecycle and Architecture
The migration process is governed by a linear dependency chain where each revision points to a single parent. This ensures a predictable upgrade path and prevents branching in the database schema.

### Migration Dependency Chain
The following diagram illustrates the progression of the database schema through various revisions:

```mermaid
flowchart TD
    M01[0001: Initial Tables] --> M02[0002: is_admin]
    M02 --> M03[0003: stripe_customer]
    M03 --> M04[0004: chat_sessions]
    M04 --> M05[0005: admin_audit]
    M05 --> M06[0006: analytics_views]
    M06 --> M07[0007: llm_request_logs]
    M07 --> M08[0008: payment_meta]
    M08 --> M09[0009: billy_tables]
    M09 --> M10[186144f1b0d7: bucket_drops]
    M10 --> HEAD((HEAD))
```
The migration history consists of 10 primary revisions, culminating in the `186144f1b0d7` revision which adds the `bucket_drops` table.
Sources: [ALEMBIC_MIGRATION_AUDIT.md:120-135](), [ALEMBIC_QUICKSTART.md:5-15]()

### Core Migration Commands
Developers interact with the migration system primarily through the Alembic CLI. The system distinguishes between standard upgrades, state verification, and emergency resets.

| Command | Purpose | Usage Context |
| :--- | :--- | :--- |
| `alembic upgrade head` | Advances database to the latest schema version | Deployment or local update |
| `alembic current` | Displays the current revision of the database | Troubleshooting state |
| `alembic stamp <rev>` | Manually sets database version without running SQL | Fixing broken migration chains |
| `alembic revision --autogenerate` | Generates a new migration file based on model changes | Development |

Sources: [ALEMBIC_QUICKSTART.md:9-25](), [FIX_ALEMBIC_GUIDE.md:20-35](), [scripts/create_tables.sh:100-115]()

## Schema Composition
The system manages 11 distinct tables categorized by their role within the Resume Rockstar ecosystem.

### Entity Relationship Overview
The database structure connects users to their profiles, resumes, and various AI-driven interactions.

```mermaid
erDiagram
    USERS ||--o{ PROFILES : owns
    USERS ||--o{ RESUMES : creates
    USERS ||--o{ CHAT_SESSIONS : participates
    USERS ||--o{ BUCKET_DROPS : captures
    USERS ||--o{ PAYMENTS : executes
    USERS ||--o{ BILLY_TRACES : generates
    
    USERS {
        uuid id
        string email
        string tier
        boolean is_admin
    }
    
    BUCKET_DROPS {
        integer id
        text raw_transcript
        json structured_summary
    }
```
Sources: [ALEMBIC_QUICKSTART.md:44-60](), [ALEMBIC_MIGRATION_AUDIT.md:200-215]()

### Data Models and Migration Mapping
Every SQLAlchemy model in the `backend/app/models/` directory is aligned with a corresponding migration to ensure 100% schema consistency.

*   **Core Tables:** `users`, `profiles`, `resumes`, `chat_sessions`.
*   **Feature Tables:** `bucket_drops` (added in revision `186144f1b0d7`), `billy_context_states`, `billy_traces`.
*   **Admin/Analytics:** `admin_actions`, `admin_notes`, `llm_request_logs`, `payments`.

Sources: [ALEMBIC_MIGRATION_AUDIT.md:22-65](), [ALEMBIC_QUICKSTART.md:46-55]()

## Environment-Specific Configuration
Alembic is configured differently depending on the execution environment to optimize for performance and serverless constraints.

### Engine Configuration Logic
The system detects the environment and selects the appropriate connection strategy:

```mermaid
graph TD
    A[Start Migration] --> B{Check Environment}
    B -->|Local Dev| C[Use SQLite]
    B -->|Production/Vercel| D[Use PostgreSQL]
    C --> E[QueuePool + WAL Mode]
    D --> F[NullPool for Serverless]
    E --> G[Execute Migration]
    F --> G
```

*   **Development (Local):** Typically uses SQLite with `WAL` (Write-Ahead Logging) mode and `QueuePool` for concurrent reads.
*   **Production (Vercel + Supabase):** Uses PostgreSQL via a Supabase pooler. Crucially, it employs `NullPool` to prevent connection exhaustion in serverless environments where persistent connections are not viable.

Sources: [backend/app/Technical-Rebuild-Report.md:135-155](), [backend/app/Technical-Rebuild-Report.md:500-520]()

## Troubleshooting and Emergency Fixes
A common issue in AI-assisted development is the "Broken Migration Chain," where a specific revision (e.g., `0004_update_chat_sessions`) cannot be located, halting the upgrade process.

### Emergency Recovery Procedure
When the migration chain is broken but the database already contains the required tables, the "Force Stamp" method is used to synchronize Alembic's internal state.

1.  **Verify Tables:** Confirm that core tables (e.g., `users`, `bucket_drops`) exist using `psql "$DATABASE_URL" -c "\dt"`.
2.  **Apply Stamp:** Use `alembic stamp 186144f1b0d7` (or an emergency consolidated revision like `9999_consolidated`) to tell Alembic that the database is at the latest version.
3.  **Verification:** Run `alembic current` to confirm the head revision is recognized.

Sources: [FIX_ALEMBIC_GUIDE.md:10-40](), [backend/MIGRATION_EMERGENCY_FIX.md:10-35]()

### Automation Scripts
The project provides `scripts/create_tables.sh`, which automates the initialization and migration process. It handles environment variable loading, connection string validation (fixing common typos like `postresgresql`), and runs a Python-based verification to ensure all 11 tables are present and have the correct column counts.

Sources: [scripts/create_tables.sh:35-80](), [scripts/create_tables.sh:145-175]()

## Summary
The Database Migration system provides a reliable framework for evolving the Resume Rockstar schema. By enforcing a linear dependency chain and utilizing environment-specific engine configurations like `NullPool` for Vercel, the system balances development flexibility with production stability. Automated verification scripts and clear emergency recovery paths ensure that the data layer remains robust, supporting the application's sophisticated AI and cognitive tracking features.

### Security & Rate Limiting

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/api/auth.py](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [backend/app/api/webhooks.py](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [frontend/src/middleware/adminAuth.tsx](https://github.com/faagestalt-web/ResRock/blob/main/FRONTEND_DELIVERABLES.txt)
- [backend/app/main.py](https://github.com/faagestalt-web/ResRock/blob/main/PACKAGE_CONTENTS.md)
- [backend/app/api/chat.py](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)

</details>

# Security & Rate Limiting

## Introduction
The Security and Rate Limiting framework within Resume Rockstar is a multi-layered system designed to protect user data, ensure equitable resource distribution, and safeguard against malicious exploitation. The system integrates robust authentication protocols, role-based access control (RBAC), and tier-aware request throttling to maintain high availability and system integrity.

The architecture spans both the frontend (Next.js) and backend (FastAPI), utilizing industry-standard technologies such as JSON Web Tokens (JWT), Bcrypt hashing, and Supabase Row Level Security (RLS). This ensures that every request, whether it is a chat interaction or a file upload, is validated against the user's identity and subscription tier.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Authentication and Authorization
The project employs a robust authentication system managed through JWT and Bcrypt hashing. Users must authenticate to access non-public routes, with the system providing tokens that are validated by backend middleware for every request.

### Core Auth Components
- **JWT Validation**: Ensures requests contain a valid, non-expired token.
- **Bcrypt Hashing**: Secures user passwords before storage in the PostgreSQL database.
- **Admin Role Management**: Restricts sensitive administrative endpoints to authorized users only.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

### Admin Authentication Flow
The frontend implements an `adminAuth` middleware to intercept attempts to access restricted dashboard areas. This middleware verifies the user's session and roles before allowing the component to render.

```mermaid
sequenceDiagram
    participant User as "Admin User"
    participant Mid as "Admin Middleware"
    participant Auth as "Auth Provider"
    participant Page as "Admin Dashboard"

    User->>Mid: Access /admin
    Mid->>Auth: Check session & roles
    alt is authorized
        Auth-->>Mid: Valid Admin Session
        Mid->>Page: Render Component
    else is unauthorized
        Auth-->>Mid: Invalid/Non-Admin
        Mid--xUser: Redirect to Login/Unauthorized
    end
```
Sources: [frontend/src/middleware/adminAuth.tsx](), [FRONTEND_DELIVERABLES.txt]()

## Rate Limiting Architecture
The system prevents API abuse through rate limiting enforced at the backend level. Throttling is applied globally and specifically to resource-intensive features like the AI Chat system.

### Throttling Tiers
Rate limits are applied per user to ensure system stability. For the chat system, the default limit is set to **10 requests per minute per user**. 

| Feature | Rate Limit | Scope |
| :--- | :--- | :--- |
| Global API Access | Standard Throttling | Per User / IP |
| Chat System | 10 requests / minute | Per User |
| Auth Endpoints | Strict Throttling | Per IP |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

### Request Flow with Throttling
```mermaid
flowchart TD
    Req[Incoming Request] --> Key[Identify User/IP]
    Key --> Check{Rate Limit Exceeded?}
    Check -- No --> Proc[Process Request]
    Check -- Yes --> Err[429 Too Many Requests]
    Proc --> Resp[Return 200 OK]
```
Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Tier-Based Access Control
Security extends to resource usage through tier gating. Access to specific AI models and upload quotas is restricted based on the user's subscription level (Free, Standard, or Premium).

### Tier Gating Features
- **Upload Quotas**: Maximum file size and count are restricted by tier.
- **AI Access**: Premium features like "Billy AI analysis" or "Guided Chat" require specific membership levels.
- **Webhook Verification**: External services like Stripe use signed webhooks to securely update user tiers.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [PACKAGE_CONTENTS.md]()

### Access Control Logic
```mermaid
graph TD
    UserReq[User Request] --> Auth[JWT Auth Check]
    Auth --> TierCheck{Check User Tier}
    TierCheck -- Premium --> All[Access All Features]
    TierCheck -- Standard --> Lim[Access Limited Features]
    TierCheck -- Free --> Min[Basic Access Only]
    All --> Exec[Execute Logic]
    Lim --> Exec
    Min --> Exec
```
Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Data Security & Integrity
The project implements several hardening measures to protect data at rest and in transit.

- **Row Level Security (RLS)**: Implemented in Supabase to ensure users can only query their own data.
- **Webhook Signature Verification**: Used for endpoints such as `POST /api/webhooks` to verify that requests originate from trusted providers like Stripe.
- **Encryption**: Data is encrypted both in transit (TLS) and at rest within the Supabase infrastructure.
- **Environment Management**: Sensitive credentials (e.g., `JWT_SECRET`, `BILLY_API_KEY`) are stored in strictly controlled `.env` files and never exposed to the client-side unless prefixed with `NEXT_PUBLIC_`.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Summary
Security and Rate Limiting in Resume Rockstar are foundational components that protect the system from both external attacks and internal resource exhaustion. By combining JWT-based authentication, admin-specific middleware, and tier-aware rate limiting, the platform ensures a secure and equitable experience for all users. The use of signed webhooks and Supabase RLS further strengthens the data integrity layer, making the application production-ready and resilient.


## Deployment & Infrastructure

### Local Setup & Docker

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [scripts/setup.sh](https://github.com/faagestalt-web/ResRock/blob/main/scripts/README.md)
- [scripts/dev.sh](https://github.com/faagestalt-web/ResRock/blob/main/scripts/README.md)
- [docker-compose.yml](https://github.com/faagestalt-web/ResRock/blob/main/Docker/Daemon/README.md)
- [Docker/Daemon/README.md](https://github.com/faagestalt-web/ResRock/blob/main/Docker/Daemon/README.md)
- [comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)
- [scripts/README.md](https://github.com/faagestalt-web/ResRock/blob/main/scripts/README.md)
</details>

# Local Setup & Docker

The Resume Rockstar v2.0 local development environment is designed to provide high parity with production through a comprehensive Docker-based orchestration. It integrates a Next.js frontend, a FastAPI backend, and a complete self-hosted Supabase stack including PostgreSQL, Auth (GoTrue), Realtime, and Storage APIs.

This setup allows developers to run the entire application lifecycle locally, from database migrations and AI service integration to frontend development with hot-reloading. The environment is managed through a suite of utility scripts and a centralized `docker-compose.yml` configuration.

Sources: [Docker/Daemon/README.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Core Infrastructure & Docker Orchestration

The project uses Docker Compose to manage 13+ integrated containers. This stack is divided into three primary layers: the Resume Rockstar application services, the Supabase local stack, and infrastructure utilities.

### System Architecture Diagram

The following diagram illustrates how the Dockerized components interact within the local network.

```mermaid
flowchart TD
    subgraph Client_Layer [Client Access]
        Browser[Web Browser :3000]
        Studio[Supabase Studio :54323]
    end

    subgraph App_Layer [Application Services]
        Frontend[Next.js Frontend]
        Backend[FastAPI Backend :8000]
    end

    subgraph Supabase_Stack [Supabase Services]
        Kong[Kong API Gateway :54321]
        Auth[GoTrue Auth]
        Rest[PostgREST API]
        Realtime[Realtime Service]
        Storage[Storage API]
        Meta[Postgres Meta]
    end

    subgraph Data_Layer [Data Persistence]
        Postgres[(PostgreSQL :54322)]
    end

    Browser --> Frontend
    Frontend --> Backend
    Frontend --> Kong
    Backend --> Postgres
    Kong --> Auth
    Kong --> Rest
    Kong --> Realtime
    Kong --> Storage
    Studio --> Meta
    Meta --> Postgres
    Auth & Rest & Realtime & Storage --> Postgres
```
The diagram shows the routing through the Kong API Gateway and the central role of the PostgreSQL database.
Sources: [Docker/Daemon/README.md:14-177](), [comprehensive_reports/comprehensive_state_report.md]()

### Key Container Services

| Service | Image / Base | Port | Description |
| :--- | :--- | :--- | :--- |
| **frontend** | `node:20-alpine` | 3000 | Next.js 14 application with hot-reloading. |
| **backend** | `python:3.11-slim` | 8000 | FastAPI server running business logic and AI integrations. |
| **postgres** | `supabase/postgres:17.2.0.54` | 54322 | Primary PostgreSQL 17 database. |
| **kong** | `kong:2.8.1` | 54321 | API Gateway routing requests to Supabase services. |
| **studio** | `supabase/studio` | 54323 | Web-based database management UI. |
| **auth** | `supabase/gotrue` | Internal | Handles JWT-based authentication and user management. |

Sources: [Docker/Daemon/README.md:17-200](), [scripts/README.md:162-175]()

## Local Development Setup

Setting up the environment involves preparing environment variables, installing dependencies, and initializing the database.

### Initial Installation Steps
The `scripts/setup.sh` script automates the prerequisite checks and service initialization:
1. **Prerequisite Check**: Verifies Python 3.11+ and Node.js 20+ are installed.
2. **Backend Setup**: Creates a virtual environment and installs requirements via `pip`.
3. **Frontend Setup**: Installs Node modules via `npm install`.
4. **Environment Initialization**: Generates `.env` and `.env.local` files from templates.
5. **Database Initialization**: Runs `alembic upgrade head` to apply migrations.

Sources: [scripts/README.md:7-40](), [Docker/Daemon/README.md:434-477]()

### Environment Configuration
The system requires specific variables for AI services and authentication. Key variables include:

```bash
# Backend .env
DATABASE_URL=postgresql://postgres:password@postgres:5432/postgres
JWT_SECRET_KEY=your-secure-secret
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
Sources: [Docker/Daemon/README.md:383-430](), [scripts/README.md:55-100]()

## Database Management

The repository includes scripts to synchronize data between the local Docker environment and production Supabase instances.

### Sync Workflow Diagram

```mermaid
flowchart TD
    Pull[make db-pull] --> DumpProd[pg_dump Production]
    DumpProd --> LocalReset[Drop Local Schema]
    LocalReset --> LocalRestore[pg_restore to Docker]
    
    Push[make db-push] --> DumpLocal[pg_dump Docker]
    DumpLocal --> RemoteConfirm{Confirm Production Write?}
    RemoteConfirm -->|Yes| RemoteRestore[pg_restore to Supabase Cloud]
```
The diagram outlines the sequence for moving data between environments using `pg_dump` and `pg_restore`.
Sources: [Docker/Daemon/README.md:237-379]()

### Database Utility Commands

| Command | Script | Description |
| :--- | :--- | :--- |
| `make db-pull` | `scripts/db-pull.sh` | Pulls production Supabase data and restores it to the local Docker container. |
| `make db-push` | `scripts/db-push.sh` | Dumps the local Docker DB and pushes it to production (requires confirmation). |
| `make db-reset` | `scripts/db-reset.sh` | Drops the local database and re-runs Alembic migrations and seed data. |

Sources: [Docker/Daemon/README.md:483-518](), [scripts/README.md:244-263]()

## Execution and Maintenance

### Development Server
To start the development environment without Docker (using local processes), the `scripts/dev.sh` script launches both the backend and frontend concurrently:
- **Backend**: `uvicorn app.main:app --reload --port 8000`
- **Frontend**: `npm run dev` (on port 3000)

Sources: [scripts/README.md:112-140]()

### Health Monitoring
The `scripts/health-check.sh` utility performs status checks on three core areas:
1. **API Health**: Pings `http://localhost:8000/health`.
2. **Web Health**: Verifies `http://localhost:3000` returns a 200 status code.
3. **Database Health**: Executes a Python-based `db_healthcheck()` to verify the connection.

Sources: [scripts/README.md:195-218]()

## Summary

The local setup for Resume Rockstar provides a robust, production-mirroring environment using Docker Compose and the Supabase stack. By centralizing infrastructure in containers and providing scripts for database synchronization, environment generation, and health monitoring, the project ensures consistent development across various local environments while maintaining strict security and data integrity through its push/pull workflows.

### Deployment Guides

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/Technical-Rebuild-Report.md](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/Technical-Rebuild-Report.md)
- [backend/app/Backend-Rebuild-Summary.md](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/Backend-Rebuild-Summary.md)
- [PACKAGE_CONTENTS.md](https://github.com/faagestalt-web/ResRock/blob/main/PACKAGE_CONTENTS.md)
- [reports/README_REPORTS.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/README_REPORTS.md)
- [_LAUNCH_PACKAGE/LAUNCH_CHECKLIST.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/LAUNCH_CHECKLIST.md)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
</details>

# Deployment Guides

The Resume Rockstar project utilizes a decoupled architecture requiring synchronized deployment of its frontend and backend components. The deployment strategy focuses on serverless environments, specifically leveraging Vercel for the frontend and Google Cloud Run or Vercel for the backend, supported by Supabase as the persistent data layer. These guides provide a roadmap for moving the application from local development to production-ready status.

The primary purpose of these guides is to ensure that the "Consciousness-Serving" AI features, such as Bucket Drops and Billy AI, remain operational across different environments. This involves strict management of environment variables, database connection pooling strategies tailored for serverless functions, and systematic verification through automated health checks.

## Deployment Architecture Overview

The system architecture is designed for scalability and high availability. It separates the presentation layer (Next.js) from the logic layer (FastAPI), both of which interact with a managed PostgreSQL instance on Supabase.

```mermaid
graph TD
    User[User Browser] --> Frontend[Vercel: Next.js Frontend]
    Frontend --> Backend[Cloud Run/Vercel: FastAPI Backend]
    Backend --> DB[(Supabase PostgreSQL)]
    Backend --> AI[AI Services: Gemini/OpenAI]
    Backend --> Storage[Supabase Storage]
    
    subgraph "Data & AI Layer"
    DB
    AI
    Storage
    end
```
*Visual representation of the production deployment flow showing the relationship between hosting providers and external services.*
Sources: [backend/app/Technical-Rebuild-Report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Backend Deployment Strategy

The backend requires specific configurations to handle serverless execution models, particularly concerning database connection management.

### Serverless Connection Pooling
A critical component of the backend deployment is the use of `NullPool` when deploying to Vercel. Unlike traditional servers that use `QueuePool` to maintain persistent connections, serverless functions require ephemeral connections to avoid exhausting the Supabase connection limit (60 connections on the free tier).

| Pool Type | Environment | Behavior |
| :--- | :--- | :--- |
| **NullPool** | Vercel / Serverless | Opens and closes a connection for every request. |
| **QueuePool** | Local / Railway | Maintains a pool of 5-15 persistent connections for reuse. |

Sources: [backend/app/Technical-Rebuild-Report.md](), [backend/app/Backend-Rebuild-Summary.md]()

### Vercel Backend Integration
To host the FastAPI application on Vercel, a Mangum adapter is used to wrap the ASGI application, converting requests into an HTTP format compatible with Vercel Functions.

```python
# vercel_handler.py example
from mangum import Mangum
from app.main import app

handler = Mangum(app)
```
Sources: [backend/app/Technical-Rebuild-Report.md](), [backend/app/Backend-Rebuild-Summary.md]()

## Database Configuration

The project uses the Supabase Pooler (Port 6543) for production environments. This endpoint is optimized for transaction-mode pooling, which is better suited for serverless invocations than direct connections.

### Connection Parameters
*   **SSL Mode**: Required for Supabase security (`?sslmode=require`).
*   **Application Name**: Used to identify connections in logs (`&application_name=resume_rockstar`).
*   **Driver**: `postgresql+psycopg` for SQLAlchemy compatibility with `psycopg3`.

Sources: [backend/app/Technical-Rebuild-Report.md](), [backend/app/Backend-Rebuild-Summary.md]()

## Launch Checklist & Verification

Deployment is divided into phases to ensure stability, starting with local validation and ending with a full public launch.

### Deployment Phases

```mermaid
flowchart TD
    P1[Phase 1: Local Validation] --> P2[Phase 2: Staging Deployment]
    P2 --> P3[Phase 3: Soft Launch]
    P3 --> P4[Phase 4: Full Launch]
    
    subgraph "Verification Tasks"
    V1[Health Check /health]
    V2[DB Migration check]
    V3[CORS Verification]
    end
    
    P2 -.-> V1
    P2 -.-> V2
    P2 -.-> V3
```
*Process flow for the multi-week launch strategy.*
Sources: [_LAUNCH_PACKAGE/LAUNCH_CHECKLIST.md](), [reports/README_REPORTS.md]()

### Environment Variables
A comprehensive set of environment variables must be configured in the deployment platform (Vercel/Cloud Run).

| Variable | Description | Requirement |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase connection string with Pooler port 6543. | Critical |
| `JWT_SECRET_KEY` | Secret key for generating and validating tokens. | Critical |
| `ENV` | Set to `production` or `staging`. | Required |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend domains. | Required |
| `GEMINI_API_KEY` | Key for Google AI services. | Required for AI features |

Sources: [backend/app/Technical-Rebuild-Report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Verification and Rollback

Once deployed, the system status is verified using a dedicated health endpoint. A successful deployment returns a JSON response indicating "connected" status for the database and the correct environment string.

### Health Check Sequence
```mermaid
sequenceDiagram
    participant Admin as DevOps/Admin
    participant API as Backend API
    participant DB as Database
    
    Admin->>API: GET /health
    API->>DB: SELECT 1 (Test Connection)
    DB-->>API: Success
    API-->>Admin: {"status": "ok", "database": "connected"}
```
*Sequence diagram for the automated health check procedure.*
Sources: [backend/app/Technical-Rebuild-Report.md](), [backend/app/Backend-Rebuild-Summary.md]()

### Rollback Procedure
In the event of a critical failure during deployment:
1.  **Disable Sign-ups**: Show a maintenance page to prevent new data entry.
2.  **Assessment**: Identify if the failure is code-related or database-related.
3.  **Git Revert**: Roll back to the previous known-good commit.
4.  **Database Downgrade**: If migrations were applied, use `alembic downgrade -1`.

Sources: [_LAUNCH_PACKAGE/LAUNCH_CHECKLIST.md]()

The deployment of Resume Rockstar v1.1 is characterized by its transition to a robust, serverless-ready architecture. By implementing `NullPool` strategies for database connections and using Mangum for Vercel integration, the system achieves the scalability required for an AI-driven platform while maintaining the security and performance standards necessary for neurodivergent professional support.

### Observability: Sentry & Braintrust

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [backend/app/core/sentry_config.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/core/sentry_config.py)
- [frontend/src/sentry.client.config.ts](https://github.com/faagestalt-web/ResRock/blob/main/frontend/src/sentry.client.config.ts)
- [backend/app/services/braintrust_evals.py](https://github.com/faagestalt-web/ResRock/blob/main/backend/app/services/braintrust_evals.py)
- [braintrust/cli.ts](https://github.com/faagestalt-web/ResRock/blob/main/braintrust/cli.ts)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [comprehensive_reports/comprehensive_state_report.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/comprehensive_state_report.md)
- [INTEGRATION_COMPLETE_SUMMARY.md](https://github.com/faagestalt-web/ResRock/blob/main/INTEGRATION_COMPLETE_SUMMARY.md)
</details>

# Observability: Sentry & Braintrust

## Introduction
Observability within the Resume Rockstar project is maintained through a multi-layered approach using Sentry for error tracking and performance monitoring, alongside Braintrust for Large Language Model (LLM) evaluation and usage analytics. This system provides deep visibility into both traditional application errors and the specific performance metrics of AI-driven features like the Billy AI engine.

The observability stack ensures that developers can monitor real-time error alerts, session replays, and AI response quality. By integrating these tools across both the Next.js frontend and FastAPI backend, the project maintains a production-grade monitoring environment that tracks the reliability of resume optimization and user interactions.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()

## Sentry: Error Tracking and Performance
Sentry is utilized as the primary tool for real-time error monitoring and performance tracking across the entire stack. It is configured to capture exceptions, provide session replays for debugging, and monitor the performance of API endpoints.

### Backend Configuration
The FastAPI backend initializes Sentry using a centralized configuration that defines environment-specific settings. It is designed to capture all unhandled exceptions and monitor transaction traces for backend services.

| Configuration Option | Type | Description |
|----------------------|------|-------------|
| `SENTRY_DSN` | String | Data Source Name for backend error reporting. |
| `ENVIRONMENT` | String | Indicates if the app is in production or development. |
| `traces_sample_rate` | Float | Percentage of transactions to capture for performance monitoring. |

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [backend/app/core/sentry_config.py]()

### Frontend Configuration
The Next.js frontend utilizes `sentry.client.config.ts` to initialize the Sentry SDK on the client side. Key features include:
*   **Replay Integration**: Captures video-like replays of user sessions to diagnose UI bugs.
*   **Sample Rates**: Configurable rates for both performance traces and session replays.

```mermaid
graph TD
    UserAction[User Interaction] --> FE[Frontend Next.js]
    FE -- Error Detected --> SentryFE[Sentry Client SDK]
    SentryFE -- Upload Trace/Log --> SentryCloud[Sentry Cloud Dashboard]
    FE -- API Call --> BE[Backend FastAPI]
    BE -- Exception Caught --> SentryBE[Sentry Python SDK]
    SentryBE -- Upload Trace/Log --> SentryCloud
```
*The diagram shows how errors from both the frontend and backend are independently reported to the Sentry Cloud platform for centralized monitoring.*

Sources: [frontend/src/sentry.client.config.ts](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Braintrust: AI & LLM Observability
Braintrust is integrated to monitor the quality and cost of LLM responses generated by the Billy AI service. It focuses on evaluating the effectiveness of AI features such as Career Story Mode and Accomplishment Mode.

### Key Monitoring Functions
Braintrust tracks specific AI-related metrics that traditional observability tools like Sentry do not cover:
*   **LLM Response Quality**: Evaluating the accuracy and relevance of generated resume content.
*   **Cost Tracking**: Monitoring the financial expenditure of API calls to providers like Google Gemini or OpenAI.
*   **Usage Analytics**: Tracking which AI modules are most frequently accessed by users.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [INTEGRATION_COMPLETE_SUMMARY.md]()

### AI Request Pipeline
When the Billy AI service processes a request (e.g., analyzing a "Bucket Drop"), the interaction is logged to Braintrust for offline evaluation.

```mermaid
sequenceDiagram
    participant B as Billy Service
    participant LLM as AI Provider (Gemini/GPT)
    participant BT as Braintrust
    B->>LLM: Generate Response
    LLM-->>B: Response Data
    B->>BT: Log Interaction (Prompt + Output)
    Note over BT: Performance & Cost Analysis
```
*The sequence diagram illustrates the logging of AI interactions to Braintrust for quality control and cost monitoring.*

Sources: [backend/app/services/braintrust_evals.py](), [INTEGRATION_COMPLETE_SUMMARY.md]()

## Observability Infrastructure Summary
The combination of these tools creates a comprehensive monitoring strategy that covers the entire user journey.

| Feature | Sentry | Braintrust |
|---------|--------|------------|
| **Scope** | Application-wide (FE & BE) | AI/LLM Specific |
| **Primary Data** | Exceptions, Traces, Replays | Prompts, Outputs, Metrics |
| **Objective** | Stability & Performance | Quality & Cost Efficiency |
| **Integration** | SDKs in Main Entry Points | Logging in Service Layer |

Sources: [comprehensive_reports/comprehensive_state_report.md](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md]()

## Conclusion
The observability framework in Resume Rockstar, powered by Sentry and Braintrust, provides a robust safety net for production deployments. By capturing both code-level errors and AI-specific performance metrics, the system enables rapid debugging and continuous improvement of the core AI value proposition. This dual-tool approach ensures that the "consciousness-serving" application remains reliable and cost-effective as it scales.

Sources: [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](), [comprehensive_reports/comprehensive_state_report.md]()


## Testing & Quality Assurance

### Automated Testing Suite

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [TEST_SUITE_IMPLEMENTATION_SUMMARY.md](https://github.com/faagestalt-web/ResRock/blob/main/TEST_SUITE_IMPLEMENTATION_SUMMARY.md)
- [TESTING_SUITE_SUMMARY.md](https://github.com/faagestalt-web/ResRock/blob/main/TESTING_SUITE_SUMMARY.md)
- [WORKFLOW_AND_AGENTS_SETUP.md](https://github.com/faagestalt-web/ResRock/blob/main/WORKFLOW_AND_AGENTS_SETUP.md)
- [START_TESTING.md](https://github.com/faagestalt-web/ResRock/blob/main/START_TESTING.md)
- [TEST_QUICK_REFERENCE.md](https://github.com/faagestalt-web/ResRock/blob/main/TEST_QUICK_REFERENCE.md)
- [TEST_EXECUTION_REPORT.md](https://github.com/faagestalt-web/ResRock/blob/main/TEST_EXECUTION_REPORT.md)
</details>

# Automated Testing Suite

The Automated Testing Suite for Resume Rockstar is a comprehensive, multi-layered validation framework designed to ensure the reliability of AI-driven resume optimization and user workflows. It covers the entire application stack, from backend FastAPI routes and AI services to frontend React components and state management. The suite is integrated into the CI/CD pipeline, providing automated execution, coverage reporting, and security scanning.

The suite utilizes a "back-to-front" strategy, encompassing over 160 assertions across 79+ new test cases. It validates critical paths such as authentication, payment processing via Stripe, AI-driven chat interactions with the "Billy" engine, and complex resume parsing workflows.

Sources: [TEST_SUITE_IMPLEMENTATION_SUMMARY.md](), [START_TESTING.md]()

## 1. Suite Architecture and Organization

The testing infrastructure is partitioned into backend, frontend, and integration layers, each utilizing industry-standard frameworks and specialized configurations.

### 1.1 Technical Stack
| Layer | Framework | Purpose |
| :--- | :--- | :--- |
| **Backend** | pytest | API route and service logic validation |
| **Frontend** | Jest / React Testing Library | Component rendering and user interaction |
| **Integration** | pytest-asyncio | End-to-end workflow and multi-service data flow |
| **CI/CD** | GitHub Actions | Automated orchestration and reporting |

Sources: [TEST_SUITE_IMPLEMENTATION_SUMMARY.md](), [WORKFLOW_AND_AGENTS_SETUP.md]()

### 1.2 Execution Pipeline
The testing process follows a structured four-phase execution flow to ensure build stability before generating final reports.

```mermaid
flowchart TD
    Start[run_comprehensive_tests.sh] --> P1[Phase 1: Backend Tests]
    P1 --> P1_A[Route Tests - 50+ cases]
    P1 --> P1_B[Service Tests - 40+ cases]
    
    P1_B --> P2[Phase 2: Frontend Tests]
    P2 --> P2_A[Type Checking & Linting]
    P2 --> P2_B[Jest Component Tests]
    
    P2_B --> P3[Phase 3: Build Verification]
    P3 --> P3_A[Frontend Build]
    P3 --> P3_B[Health Checks]
    
    P3_B --> P4[Phase 4: Summary Report]
    P4 --> End[Success/Failure Summary]
```
This diagram illustrates the sequential progression from low-level backend validation to high-level build verification.
Sources: [TEST_SUITE_IMPLEMENTATION_SUMMARY.md](), [TESTING_SUITE_SUMMARY.md]()

## 2. Backend Testing Implementation

Backend testing focuses on FastAPI routers and specialized services, including AI orchestration and file parsing.

### 2.1 API Route Validation
The suite includes `test_routes_comprehensive.py` (800+ lines) to validate the integrity of REST endpoints. Key areas of focus include:
- **Authentication**: Signup, login, token refresh, and logout flows.
- **Admin**: System health metrics and access control.
- **AI/Chat**: Message delivery to the Billy service and training progression.
- **Rate Limiting**: Ensuring 429 responses are triggered correctly during high-frequency requests.

Sources: [TEST_SUITE_IMPLEMENTATION_SUMMARY.md](), [TEST_EXECUTION_REPORT.md]()

### 2.2 Service and AI Logic
Testing for core services is contained within `test_services_comprehensive.py`. This ensures that the logic behind AI generation and resume optimization is robust.

| Service | Tested Functionality |
| :--- | :--- |
| **AI Orchestrator** | LLM fallback logic and prompt validation |
| **LLM Cascade** | Gemini primary LLM with fallback to Groq |
| **PLK Engine** | Personal Language Key detection and emotional resonance scoring |
| **ATS Optimizer** | Keyword optimization and formatting validation |

Sources: [TEST_SUITE_IMPLEMENTATION_SUMMARY.md](), [START_TESTING.md]()

## 3. Frontend Testing Implementation

Frontend tests utilize Jest and React Testing Library to simulate user environments and verify UI/UX consistency.

### 3.1 Component and State Testing
Tests target critical user interfaces such as the `BillyPlayground` and `AdminDashboard`.
- **User Events**: Simulates clicks, touches (critical for mobile support), and keyboard navigation.
- **State Management**: The `TapestryStore.test.ts` validates data accumulation, deduplication, and `localStorage` persistence.
- **Accessibility**: Verifies ARIA labels and semantic HTML for compliance.

Sources: [TEST_SUITE_IMPLEMENTATION_SUMMARY.md](), [TESTING_SUITE_SUMMARY.md]()

### 3.2 Frontend Workflow Sequence
```mermaid
sequenceDiagram
    participant User as "User Interface"
    participant Jest as "Jest/RTL"
    participant API as "Mock API/Axios"
    
    User->>Jest: Trigger Interaction (Click/Type)
    Jest->>API: Intercept API Call
    API-->>Jest: Return Mock Data
    Jest->>User: Re-render with State Change
    Note over Jest: Assert Component Output
```
This sequence shows how frontend tests isolate components by mocking backend responses to verify UI state transitions.
Sources: [TEST_SUITE_IMPLEMENTATION_SUMMARY.md](), [START_TESTING.md]()

## 4. Automation and CI/CD Orchestration

The system uses a centralized agents registry and GitHub Actions to automate the testing lifecycle.

### 4.1 Agents Registry
A centralized registry (`.github/agents-registry.yml`) defines specialized "droids" for testing tasks:
- **backend-test-executor**: Manages pytest execution and coverage.
- **frontend-test-executor**: Handles Jest and TypeScript type checking.
- **security-scanner**: Conducts vulnerability scans on dependencies.
- **mermaid-diagram-generator**: Automatically generates visual documentation.

Sources: [WORKFLOW_AND_AGENTS_SETUP.md]()

### 4.2 Data Flow for Automated Reporting
```mermaid
graph TD
    Tests[Test Execution] --> Artifacts[XML/JSON Results]
    Artifacts --> DocGen[Documentation Generator]
    Artifacts --> CovRep[Coverage Reporter]
    DocGen --> Wiki[Wiki/Markdown Reports]
    CovRep --> Final[Final Comprehensive Report]
```
The workflow collects raw test data and transforms it into human-readable documentation and visual diagrams.
Sources: [WORKFLOW_AND_AGENTS_SETUP.md]()

## 5. Test Configuration and Utilities

The suite relies on specific configuration files to maintain environment consistency.

- **`backend/pytest.ini`**: Configures test discovery, output formatting, and custom markers (unit, integration, slow).
- **`frontend/jest.config.js`**: Integrates Next.js path aliases (`@/`) and sets coverage thresholds.
- **`frontend/jest.setup.js`**: Mocks the Next.js router, navigation, and `window.matchMedia` for the test environment.
- **`run_live_tests.py`**: A cross-platform Python runner providing color-coded output and performance timing.

Sources: [START_TESTING.md](), [TESTING_SUITE_SUMMARY.md](), [TEST_QUICK_REFERENCE.md]()

The Automated Testing Suite serves as a critical quality gate for Resume Rockstar. By combining granular unit tests with end-to-end integration workflows, the suite identifies regressions in AI logic, ensures security through strict authentication testing, and maintains UI responsiveness across devices. The automated reporting and agent-based orchestration ensure that documentation remains synchronized with the current state of the codebase.

### Droid End-to-End Testing

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [Resume-Rockstar-v1.1-main/reports/Droid.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/Droid.md)
- [Resume-Rockstar-v1.1-main/reports/Droid_Agent.md](https://github.com/faagestalt-web/ResRock/blob/main/reports/Droid_Agent.md)
- [Resume-Rockstar-v1.1-main/WORKFLOW_AND_AGENTS_SETUP.md](https://github.com/faagestalt-web/ResRock/blob/main/WORKFLOW_AND_AGENTS_SETUP.md)
- [Resume-Rockstar-v1.1-main/scripts/generate-mermaid-diagrams.py](https://github.com/faagestalt-web/ResRock/blob/main/scripts/generate-mermaid-diagrams.py)
- [Resume-Rockstar-v1.1-main/TEST_SUITE_IMPLEMENTATION_SUMMARY.md](https://github.com/faagestalt-web/ResRock/blob/main/TEST_SUITE_IMPLEMENTATION_SUMMARY.md)
- [Resume-Rockstar-v1.1-main/comprehensive_reports/Droid.md](https://github.com/faagestalt-web/ResRock/blob/main/comprehensive_reports/Droid.md)
</details>

# Droid End-to-End Testing

Droid End-to-End (E2E) Testing is a comprehensive validation framework designed to systematically review, test, and document the launch readiness of the Resume Rockstar application. It utilizes the Droid CLI in conjunction with the Billy Reasoning Engine to simulate real-world user interactions across the entire technology stack, ensuring that integrated features perform correctly from the frontend to the backend data layer.

The testing scope encompasses critical revenue-generating paths, including AI-driven resume enhancement, secure payment processing via Stripe, and complex authentication workflows. This framework serves as the final gating mechanism for cloud deployment, requiring verification of 15 API routers and core product philosophies such as authentic PLK (Personal Language Key) voice amplification.

Sources: [reports/Droid_Agent.md](), [reports/Droid.md:4-8]()

## Test Architecture and Orchestration

The Droid testing environment is orchestrated through a centralized registry that manages specialized automation agents. The pipeline is designed for parallel execution across multiple environments to maximize efficiency and coverage.

### Agent Registry and Responsibilities
Testing is distributed among several specialized agents defined in the system's workflow configuration. Key agents include the `test-and-docs-orchestrator`, which manages the overall lifecycle, and the `backend-test-executor` and `frontend-test-executor`, which handle environment-specific logic.

| Agent ID | Responsibility |
| :--- | :--- |
| `test-and-docs-orchestrator` | Main workflow orchestrator for the testing pipeline. |
| `backend-test-executor` | Executes Python/pytest suites, database setup, and coverage. |
| `frontend-test-executor` | Manages Jest/TypeScript execution and type-checking. |
| `test-report-compiler` | Aggregates results from various test phases into a final report. |

Sources: [WORKFLOW_AND_AGENTS_SETUP.md:38-60]()

### Test Execution Pipeline
The following diagram illustrates the automated flow of the testing pipeline, from environment setup to final report generation and notification.

```mermaid
flowchart TD
    Start([Workflow Triggered]) --> GetCode[Get Source Code]
    GetCode --> BackendEnv[Setup Backend Env<br/>Python 3.9-3.11]
    GetCode --> FrontendEnv[Setup Frontend Env<br/>Node 18-20]
    
    BackendEnv --> RunBE[Run Backend Tests<br/>pytest --cov]
    FrontendEnv --> RunFE[Run Frontend Tests<br/>jest --coverage]
    
    RunBE --> BECheck{Tests Pass?}
    RunFE --> FECheck{Tests Pass?}
    
    BECheck -->|Yes| IntTest[Integration Tests]
    FECheck -->|Yes| IntTest
    
    IntTest --> GenDocs[Generate Docs & Diagrams]
    GenDocs --> Compile[Compile Final Report]
    Compile --> Success([Pipeline Success])
    
    BECheck -->|No| FailEnd([❌ Pipeline Failed])
    FECheck -->|No| FailEnd
```
This diagram represents the sequence of environment initialization, parallel test execution, and documentation synthesis.
Sources: [scripts/generate-mermaid-diagrams.py:53-108]()

## Core Test Domains

The Droid manifest organizes E2E testing into five distinct priority-based domains. P0 tests represent launch-critical features where failure blocks deployment.

### 1. Authentication and Onboarding (P0)
These tests verify user registration, login persistence, and the "Guided Discovery" routing logic. A critical check is performed to ensure the "Admin loop bug" is resolved, preventing administrators from being redirected incorrectly to onboarding.

*   **Key Endpoints:** `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/guided-discovery`.
*   **Success Criteria:** Successful JWT token generation and role-based access control (RBAC) validation.

Sources: [reports/Droid.md:12-25]()

### 2. AI and Resume Studio Features (P0)
This domain tests the integration with the Billy AI engine and file processing capabilities. It ensures that resume enhancements follow the STAR (Situation, Task, Action, Result) method and that linguistic patterns are correctly extracted.

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as Backend API
    participant LLM as Billy AI Service
    participant DB as PostgreSQL

    FE->>API: POST /api/studio/enhance
    API->>LLM: Send content + STAR prompt
    LLM-->>API: Analysis Results
    API->>DB: Store Enhanced Content
    API-->>FE: Return Enhanced Result
```
This sequence shows the interaction between the frontend, the backend API, and the Billy AI service during a resume enhancement request.
Sources: [reports/Droid.md:57-73](), [scripts/generate-mermaid-diagrams.py:23-51]()

### 3. Payment Processing (P0)
Droid simulates Stripe webhooks to verify subscription upgrades and downgrades. The suite includes specific test cases for successful payments, declined cards, and 3D Secure challenges.

*   **Test Cards:** 4242 (Success), 4000 0000 0000 0002 (Declined), 4000 0027 6000 3184 (3DS).
*   **Logic:** Validates that `payment_intent.succeeded` webhooks correctly upgrade the user's tier in the database.

Sources: [reports/Droid.md:111-125]()

## Go-Live Gating Criteria

The system employs a strict gating policy based on Droid execution results. Automated "Recursive Fix Loops" are triggered if any P0 test fails.

### Launch Status Indicators
The application is only approved for cloud deployment when specific metrics are met:

| Criteria | Required Threshold |
| :--- | :--- |
| P0 Tests Pass | 100% (Auth, AI, Payments) |
| Error Rate | < 5% |
| P95 Response Time | < 3 seconds |
| API Routers | 15/15 Operational |

Sources: [reports/Droid.md:197-206](), [reports/Droid_Agent.md:11-13]()

### Automated Fix Loop
If a P0 test fails, the Billy Reasoning Engine analyzes the error logs and suggests a fix. The Droid CLI can automatically apply these fixes to the codebase (e.g., increasing timeouts in `app/services/billy.py`) and re-run the failed tests until the gate criteria are met.
Sources: [reports/Droid.md:214-230]()

## Execution Commands
Developers and Droid agents execute tests using the Droid CLI. The framework supports parallel execution and targeted testing.

```bash
# Execute only critical P0 paths
droid run test-suite \
  --tests "AUTH-*,AI-001,AI-002,AI-003,PAY-001,PAY-002,PAY-007" \
  --parallel 3 \
  --report-format json
```
Sources: [reports/Droid.md:180-186]()

The Droid End-to-End Testing system provides a bulletproof, transparent artifact for stakeholders, ensuring that all launch blockers are systematically identified, documented, and resolved before production release.
Sources: [reports/Droid_Agent.md:37-41]()


## Extensibility & Development Workflow

### Development Workflows & Scripts

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [WORKFLOW_AND_AGENTS_SETUP.md](https://github.com/faagestalt-web/ResRock/blob/main/WORKFLOW_AND_AGENTS_SETUP.md)
- [scripts/generate-mermaid-diagrams.py](https://github.com/faagestalt-web/ResRock/blob/main/scripts/generate-mermaid-diagrams.py)
- [README_DEBUG_PACKAGE.txt](https://github.com/faagestalt-web/ResRock/blob/main/README_DEBUG_PACKAGE.txt)
- [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md](https://github.com/faagestalt-web/ResRock/blob/main/_LAUNCH_PACKAGE/REPO_SNAPSHOT.md)
- [FRONTEND_DEBUG_SUMMARY.md](https://github.com/faagestalt-web/ResRock/blob/main/FRONTEND_DEBUG_SUMMARY.md)
- [FRONTEND_DEBUG_INDEX.md](https://github.com/faagestalt-web/ResRock/blob/main/FRONTEND_DEBUG_INDEX.md)
</details>

# Development Workflows & Scripts

## Introduction
Development workflows in the Resume Rockstar project are designed to automate testing, documentation, and system analysis through a centralized "Agents Registry" and automated CI/CD pipelines. This ecosystem ensures high code quality and system transparency for neurodivergent-focused professional tools by integrating parallel testing across multiple environments (Python 3.9-3.11 and Node 18-20) with automatic documentation generation.

The workflow infrastructure encompasses a wide array of specialized scripts for generating Mermaid diagrams, compiling technical reports, and performing frontend debugging. These tools are orchestrated primarily through GitHub Actions, providing a robust pipeline from code push to final documentation artifacts.

Sources: [WORKFLOW_AND_AGENTS_SETUP.md:7-14](), [_LAUNCH_PACKAGE/REPO_SNAPSHOT.md:8-13]()

## Automated Test & Documentation Pipeline
The core of the development cycle is the "Test & Documentation Pipeline" orchestrated via GitHub Actions. This pipeline handles environment setup, parallel test execution, and the synthesis of documentation from test artifacts.

### CI/CD Pipeline Flow
The workflow is triggered by pushes to `main`, `staging`, or `develop` branches, as well as pull requests. It employs parallel execution for backend and frontend tests to minimize feedback loops.

```mermaid
flowchart TD
    Trigger([Workflow Triggered]) --> Setup[Setup Environments]
    Setup --> Backend[Backend Tests: Python 3.9-3.11]
    Setup --> Frontend[Frontend Tests: Node 18-20]
    
    Backend --> BE_Cov[Backend Coverage Report]
    Frontend --> FE_Cov[Frontend Coverage Report]
    
    BE_Cov --> Integration[Integration Tests]
    FE_Cov --> Integration
    
    Integration --> Security[Security Scanning: safety & npm audit]
    Security --> Docs[Generate Docs & Diagrams]
    Docs --> Report[Compile Final Report]
    Report --> Notify[Send Notifications]
    
    style Backend fill:#f9f,stroke:#333,stroke-width:2px
    style Frontend fill:#f9f,stroke:#333,stroke-width:2px
    style Docs fill:#bbf,stroke:#333,stroke-width:2px
```
The diagram shows the transition from parallel testing to sequential analysis and reporting.
Sources: [WORKFLOW_AND_AGENTS_SETUP.md:85-115](), [scripts/generate-mermaid-diagrams.py:59-108]()

### Key Jobs and Artifacts
| Job | Runtime Environment | Primary Output |
| :--- | :--- | :--- |
| **backend-tests** | Python 3.9, 3.10, 3.11 | JUnit XML, `coverage.json`, `htmlcov/` |
| **frontend-tests** | Node 18.x, 20.x | `jest-results.json`, coverage directory |
| **security-scan** | Ubuntu Latest | `safety-report.json` |
| **generate-documentation** | Python (jinja2, pyyaml) | `test-report.md`, `architecture-overview.md` |

Sources: [WORKFLOW_AND_AGENTS_SETUP.md:120-165]()

## Centralized Agents Registry
The system utilizes an "Agents Registry" as a single source of truth for all automation agents and custom droids. This registry defines the capabilities and statuses of 12 distinct agents used throughout the lifecycle.

### Registry Components
*   **`.github/agents-registry.yml`**: Human-readable configuration for 12 agents and 2 major workflows.
*   **`.github/agents-manifest.json`**: Machine-readable format for programmatic CI/CD access.
*   **Active Agents**: Includes categories like Test Executors (Backend/Frontend), Security Scanners, and Documentation Generators.

Sources: [WORKFLOW_AND_AGENTS_SETUP.md:21-65]()

## Documentation Generation Scripts
A suite of Python scripts automates the creation of visual and textual documentation based on the system state and test results.

### Mermaid Diagram Generation
The script `scripts/generate-mermaid-diagrams.py` programmatically generates five critical system views to ensure documentation always matches the current architecture.

| Diagram File | Description |
| :--- | :--- |
| `api-sequence.mmd` | Request/Response flow including Auth and LLM services. |
| `test-flowchart.mmd` | Full CI/CD execution logic. |
| `architecture-components.mmd` | Layered view from Client to Data/External services. |
| `data-flow.mmd` | Resume processing stages (Parse -> Analyze -> Score). |
| `auth-flow.mmd` | User login and JWT token pair generation. |

Sources: [scripts/generate-mermaid-diagrams.py:20-255](), [WORKFLOW_AND_AGENTS_SETUP.md:200-240]()

### Report Compilation Logic
The `compile-report.py` and `generate-docs.py` scripts aggregate data from test artifacts to create a unified summary.
```mermaid
sequenceDiagram
    participant S as generate-docs.py
    participant A as Test Artifacts
    participant R as final-report.md
    
    S->>A: find_test_artifacts()
    A-->>S: XML/JSON Reports
    S->>S: parse_junit_xml()
    S->>S: generate_coverage_section()
    S->>R: save_documentation()
```
Sources: [WORKFLOW_AND_AGENTS_SETUP.md:183-195](), [WORKFLOW_AND_AGENTS_SETUP.md:245-255]()

## Frontend Debugging & Fix Workflows
Specific workflows exist for resolving critical frontend issues identified during development, such as file extension mismatches or missing dependencies.

### Automated Fix Workflow
The project includes a `fix_frontend_issues.sh` script to automate common recovery tasks. It follows a multi-phase approach:
1.  **Phase 1**: Renames `.ts` files containing JSX to `.tsx`.
2.  **Phase 2**: Updates import paths and alias references.
3.  **Phase 3**: Injects a `providers.tsx` wrapper to resolve Server/Client component conflicts.
4.  **Phase 4**: Fixes environment variable typos (e.g., `postresgresql` to `postgresql`).

Sources: [FRONTEND_DEBUG_SUMMARY.md:20-55](), [FRONTEND_DEBUG_INDEX.md:120-145]()

### Critical Issue Resolution
| Issue Identified | Resolution Script Action |
| :--- | :--- |
| Server Component using Client Hooks | Creates `src/app/providers.tsx` and updates root layout. |
| Missing `@heroicons/react` | Runs `npm install @heroicons/react`. |
| Jest Not Installed | Installs `jest`, `@testing-library/react`, and `ts-jest`. |

Sources: [README_DEBUG_PACKAGE.txt:60-75](), [FRONTEND_DEBUG_SUMMARY.md:30-65]()

## Local Development Reference
Developers can replicate CI environment behaviors locally using specific command-line utilities provided in the `scripts/` directory.

```bash
# Execute full test suite locally
python run_live_tests.py

# Generate all system diagrams
python scripts/generate-mermaid-diagrams.py --output ./diagrams

# Compile the final documentation report
python scripts/compile-report.py --artifacts-dir ./test-artifacts --output final-report.md
```
Sources: [WORKFLOW_AND_AGENTS_SETUP.md:320-335](), [FRONTEND_DEBUG_INDEX.md:165-175]()

## Conclusion
The Development Workflows & Scripts within Resume Rockstar provide an automated framework for maintaining a complex AI-integrated platform. By centralizing agent definitions in a registry and utilizing programmatic diagram and report generation, the project maintains a high degree of technical accuracy and observability. This automated infrastructure reduces manual maintenance overhead while ensuring that critical security and performance metrics are tracked across every commit.
