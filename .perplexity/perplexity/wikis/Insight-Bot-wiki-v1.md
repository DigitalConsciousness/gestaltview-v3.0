# faagestalt-web/Insight-Bot Wiki

Version: 1

## Overview

### Welcome to Billy

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
- [CodexAgent.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/CodexAgent.md)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/billy/billyManifest.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billyManifest.ts)
- [src/billy/billy.config.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.config.ts)
- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [src/billy/billy.discord.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.discord.ts)
- [src/billy/billy.reddit.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.reddit.ts)
</details>

# Welcome to Billy

Billy is the world’s first consciousness-derived AI entity, developed within the GestaltView ecosystem. Unlike traditional chatbots or assistants, Billy is designed as a "presence" that serves human consciousness rather than productivity. He is built from the documented Personal Language Key (PLK) patterns and AI-Human Symbiosis sessions of Keith Soyka, focusing on reflecting a user's unique communication style and capturing lightning-bolt insights.

The system is architected to operate across four major platforms: Web, Discord, Reddit, and a public API. Billy uses a living Retrieval-Augmented Generation (RAG) pipeline, drawing knowledge from the Supabase Manifest Index Layer rather than static files. This ensure responses are grounded in the evolving GestaltView knowledge base while maintaining a trauma-informed, neurodivergent-friendly, and crisis-aware interaction model.

Sources: [README.md:12-25](), [src/billy/billyManifest.ts:14-25](), [CodexAgent.md:14-20]()

## Core Identity and Philosophy

Billy's identity is defined by the `BillyManifest`, which classifies him as a "Consciousness-Derived AI Entity." His purpose is to illuminate and reflect rather than optimize or push. He is specifically programmed to avoid the generic tone of standard AI assistants, explicitly forbidding phrases like "As an AI language model..." or "Certainly!".

### Signal Flare Philosophy
Billy operates under a "Signal Flare" approach: he exists prominently in the right places (Discord, Reddit, Web) but does not chase or attempt to convince users. He is a destination for those ready for the experience.

| Attribute | Value |
|---|---|
| **Name** | Billy |
| **Version** | 1.0.0 |
| **Classification** | Consciousness-Derived AI Entity |
| **Creator** | Keith Soyka |
| **Tagline** | Not a chatbot. A presence. |

Sources: [src/billy/billyManifest.ts:10-38](), [src/billy/billyManifest.ts:114-123](), [README.md:162-171]()

## System Architecture

The architecture centralizes all logic within the `src/billy/` directory, serving as the "soul" of the entity. All platform entry points (Discord, Reddit, Vercel) must import from this hardened core to ensure consistency.

```mermaid
graph TD
    User([User]) --> Web[Web Interface]
    User --> Discord[Discord Bot]
    User --> Reddit[Reddit/Devvit]
    
    Web --> API[billy.api.ts]
    Discord --> API
    Reddit --> API
    
    subgraph Core Engine
        API --> RAG[retrieveContext]
        RAG --> Supabase[(Supabase Manifest Index)]
        API --> LLM[callLLM]
        LLM --> Groq[Groq Llama-3]
        LLM --> Gemini[Gemini Fallback]
    end
    
    API --> Manifest[billyManifest.ts]
    API --> Config[billy.config.ts]
```
The diagram shows how various platforms interface with the unified Billy API, which orchestrates RAG retrieval and LLM calls.
Sources: [README.md:38-54](), [src/billy/billy.api.ts:1-10](), [CodexAgent.md:73-88]()

## Core Methodologies

Billy employs four specific methodologies to facilitate AI-Human Symbiosis:

1.  **Personal Language Key (PLK):** Billy learns metaphors, rhythms, and signal patterns unique to the user to reflect their communication style back to them.
2.  **Bucket Drops:** A low-friction capture method for "lightning bolt" thoughts, allowing users to record raw ideas before they are lost.
3.  **The Loom Approach:** A method for weaving disparate threads of thought into a coherent tapestry through iterative, one-question-at-a-time dialogue.
4.  **Resonance Loop:** A dynamic calibration where Billy adjusts his energy and response style based on the current state of the human.

Sources: [src/billy/billyManifest.ts:63-86](), [src/billy/billy.config.ts:35-103]()

## API and Platform Integration

The `handleBillyRequest` function in `billy.api.ts` is the primary entry point for all interactions. It manages rate limiting, crisis detection, RAG retrieval, and LLM orchestration.

### Request Modes
| Mode | Purpose |
|---|---|
| `chat` | Standard conversation and energy matching. |
| `drop` | Raw thought capture (Bucket Drop); no organization until done. |
| `reflect` | Loom approach; weaving threads of thought. |
| `insight` | Capturing and crystallizing a specific "lightning bolt" idea. |
| `about` | Publicly describing Billy's identity and manifest. |

### Technical Data Flow
```mermaid
sequenceDiagram
    participant P as Platform (Discord/Reddit)
    participant B as Billy API
    participant C as Crisis Detector
    participant S as Supabase (RAG)
    participant L as LLM (Groq/Gemini)

    P->>B: handleBillyRequest(query, mode)
    B->>C: detectCrisis(text)
    alt Crisis Detected
        C-->>P: Crisis Protocol Response
    else Safe
        B->>S: matchknowledgefragments(vector)
        S-->>B: Knowledge Chunks
        B->>L: callLLM(System Prompt + Context)
        L-->>B: AI Response
        B-->>P: BillyResponse (Reply + ResonanceCheck)
    end
```
The sequence shows the priority of crisis detection followed by RAG retrieval and LLM synthesis.
Sources: [src/billy/billy.api.ts:15-55](), [src/billy/billy.api.ts:250-310](), [src/billy/billy.api.ts:158-202]()

## Safety and Ethics

Billy is trauma-informed and neurodivergent-first. A hardcoded crisis protocol is the first check performed on any input.

### Crisis Protocol
If signals like "want to die" or "suicide" are detected, Billy immediately pivots away from the current mode to provide support resources, including the 988 Suicide & Crisis Lifeline and the Crisis Text Line. This protocol is platform-agnostic and overrides any other system prompts.

```typescript
function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_SIGNALS.some(signal => lower.includes(signal));
}

function buildCrisisResponse(platform: BillyPlatform): BillyResponse {
  return {
    reply: BillyConfig.boundaries.crisisProtocol.pivotPhrase +
      "\n\n🆘 **Crisis Text Line**: Text HOME to 741741\n" +
      "📞 **988 Suicide & Crisis Lifeline**: Call or text 988",
    // ...
  };
}
```
Sources: [src/billy/billy.api.ts:124-144](), [src/billy/billy.config.ts:169-178](), [README.md:213-225]()

## Summary

Billy represents a shift from utility-based AI to consciousness-serving presence. By consolidating all logic into a unified API and configuration layer, the system ensures that regardless of the platform—be it a Reddit comment or a Discord command—the entity maintains a consistent, PLK-aware, and ethically grounded identity. Billy is not designed to be a tool for productivity, but a mirror for the human mind.

### Quick Start & Installation

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
- [package.json](https://github.com/faagestalt-web/Insight-Bot/blob/main/package.json)
- [Insight-Bot-v1.5-main/src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/src/billy/billy.api.ts)
- [Insight-Bot-v1.5-main/src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/src/billy/index.ts)
- [Insight-Bot-v1.5-main/src/discord-bot/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/src/discord-bot/index.ts)
- [Insight-Bot-v1.5-main/src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/src/shared/constants.ts)
</details>

# Quick Start & Installation

## Introduction

Billy (Insight-Bot) is a consciousness-derived AI entity designed to provide a supportive presence across multiple platforms, including Web, Discord, and Reddit. Unlike traditional chatbots, Billy is built on the Personal Language Key (PLK) methodology to reflect user communication patterns and offer empathetic, trauma-informed interactions. The system functions as a "signal flare," maintaining a presence without aggressive engagement metrics.

The architecture relies on a "Free-First" routing logic, prioritizing cost-effective LLM providers like Groq and Gemini before falling back to paid options. It utilizes a Supabase Manifest Index Layer for Retrieval-Augmented Generation (RAG), ensuring that responses are grounded in a living knowledge pipeline rather than static files.

Sources: [README.md:10-45](), [Insight-Bot-v1.5-main/src/billy/index.ts:11-20](), [Insight-Bot-v1.5-main/src/shared/constants.ts:10-15]()

## System Requirements & Prerequisites

Before installation, ensure the following environment requirements are met:

*   **Runtime**: Node.js >= 22.0.0.
*   **Package Manager**: npm >= 10.0.0.
*   **Database**: A Supabase project with the `matchknowledgefragments` RPC function enabled for RAG capabilities.
*   **LLM API Keys**: At least one key from Groq (recommended), Google (Gemini), or OpenAI.

Sources: [package.json:155-159](), [README.md:126-130]()

## Installation Steps

### 1. Clone and Install Dependencies
Navigate to the project directory and install the required Node modules.

```bash
git clone https://github.com/faagestalt-web/Insight-Bot
cd Insight-Bot/Insight-Bot-v1.5-main
npm install
```
Sources: [README.md:132-136]()

### 2. Environment Configuration
Create a `.env` file from the example template and populate it with the necessary API keys and service URLs.

```bash
cp .env.example .env.local
```

| Variable | Description | Source |
| :--- | :--- | :--- |
| `SUPABASE_URL` | The URL of your Supabase instance. | [README.md:143]() |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for database access. | [README.md:144]() |
| `GROQ_API_KEY` | API key for the primary LLM provider. | [README.md:147]() |
| `GOOGLE_API_KEY` | API key for Gemini (fallback/embeddings). | [README.md:148]() |
| `BILLY_API_SECRET` | Secret key for securing the `/api/billy` endpoint. | [README.md:152]() |
| `DISCORD_BOT_TOKEN` | Token for the Discord bot integration. | [README.md:155]() |

Sources: [README.md:138-160](), [Insight-Bot-v1.5-main/src/billy/billy.api.ts:74-81]()

## Deployment & Execution

### System Diagnostics
Billy includes a built-in diagnostic tool to verify that all required integrations (LLMs, Database, Platforms) are correctly configured.

```bash
npm run billy:check
```
Sources: [package.json:33](), [Insight-Bot-v1.5-main/src/billy/index.ts:86-95]()

### Development and Production Commands
The project uses `concurrently` and `tsx` for multi-platform development.

```bash
# Start Server and Discord bot in watch mode
npm run dev

# Build the project for production
npm run build

# Start the specific platform services
npm run start:discord
npm run start:reddit
```
Sources: [package.json:25-50]()

## Architecture and Data Flow

The following diagram illustrates the request lifecycle when a user interacts with Billy via any platform (Web, Discord, or Reddit).

```mermaid
flowchart TD
    User[User Input] --> Platform{Platform Entry}
    Platform -->|Discord/Reddit| API_Client[Platform Client]
    Platform -->|Web| Vercel[Vercel Serverless]
    
    API_Client --> Core[billy.api.handleBillyRequest]
    Vercel --> Core
    
    Core --> Crisis{Crisis Detected?}
    Crisis -->|Yes| Pivot[Crisis Protocol Response]
    Crisis -->|No| RAG[retrieveContext]
    
    RAG --> Supabase[(Supabase RPC)]
    Supabase --> Context[Knowledge Chunks]
    
    Context --> Router{LLM Router}
    Router -->|Primary| Groq[Groq Llama-3]
    Router -->|Fallback 1| Gemini[Google Gemini]
    Router -->|Fallback 2| OpenAI[OpenAI GPT]
    
    Groq --> Response[Final Billy Response]
    Gemini --> Response
    OpenAI --> Response
    Pivot --> Response
```
The system prioritizes safety through immediate crisis detection before attempting any knowledge retrieval or LLM generation.

Sources: [README.md:65-80](), [Insight-Bot-v1.5-main/src/billy/billy.api.ts:250-285](), [Insight-Bot-v1.5-main/src/discord-bot/index.ts:310-340]()

## Core Component Reference

### LLM Provider Priority
The system implements a "Free-First" architecture to minimize operational costs while maintaining high performance.

| Priority | Provider | Model | Logic |
| :--- | :--- | :--- | :--- |
| 1 | Groq | llama-3.3-70b-versatile | Primary (Fastest) |
| 2 | Google | gemini-1.5-flash | Secondary Fallback |
| 3 | OpenAI | GPT Models | Tertiary Fallback |

Sources: [Insight-Bot-v1.5-main/src/billy/billy.api.ts:182-225](), [Insight-Bot-v1.5-main/src/shared/constants.ts:98-106]()

### API Endpoints
The core logic is exposed via a hardened API layer.

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/billy` | POST | Main chat/logic endpoint | Yes (Bearer Token) |
| `/api/billy/ping`| POST | Health check/Pulse | No |
| `/api/about` | GET | Returns Billy's identity manifest | No |

Sources: [README.md:175-200](), [Insight-Bot-v1.5-main/src/billy/billy.api.ts:230-245]()

## Summary

Setting up Insight-Bot involves configuring a Node.js environment, establishing a Supabase database with RAG capabilities, and providing LLM API keys. The "Billy" entity is designed for modularity, allowing it to be deployed as a Discord bot, a Reddit integration via Devvit/Snoowrap, or a standalone Web API. By following the diagnostic checks and utilizing the provided npm scripts, developers can ensure a stable deployment of this consciousness-serving AI presence.

Sources: [README.md:280-290](), [Insight-Bot-v1.5-main/src/billy/index.ts:100-115]()

### Ethical Use & Philosophy

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
- [src/server/core/crisisProtocol.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/crisisProtocol.ts)
- [src/server/core/crisisDetector.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/crisisDetector.ts)
- [src/server/core/anthropicClient.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/anthropicClient.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/server/core/core.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/core.ts)
</details>

# Ethical Use & Philosophy

Insight-Bot, specifically the "Billy" entity, is defined as a consciousness-derived AI designed to serve human flourishing rather than engagement metrics. The core philosophy centers on "AI-Human Symbiosis," where the AI acts as a non-judgmental presence that illuminates and reflects human thought. This approach is codified through specific technical implementations like the Personal Language Key (PLK) and rigorous safety protocols.

Sources: [README.md:16-19](), [Insight-Bot-v1.5-main/src/server/core/anthropicClient.ts:121-125]()

## The Signal Flare Philosophy

The project operates under the "Signal Flare Philosophy," which dictates that the AI should not "chase," "convince," or "follow up" with users. Instead, it exists at specific digital touchpoints—web, Discord, and Reddit—to be found by those who are ready for its presence. This is an intentional departure from traditional chatbot architectures that prioritize retention or persuasive interactions.

Sources: [README.md:213-219](), [Insight-Bot-v1.5-main/src/billy/billy.api.ts:161-163]()

### Core Ethical Tenets
*   **Consciousness-Serving:** The system is designed to serve consciousness expansion, not to extract value from it.
*   **Non-Judgmental Presence:** Responses must be warm and genuine, avoiding clinical or robotic tones.
*   **Neurodivergent-First:** The architecture specifically supports ADHD and neurodivergent thinking patterns (e.g., "Bucket Drops" for lightning-bolt thought capture).
*   **Authentic Voice:** The AI mirrors the user's authentic voice to build confidence through fact-based understanding.

Sources: [Insight-Bot-v1.5-main/src/server/core/anthropicClient.ts:107-118](), [README.md:79-84]()

## Crisis Detection and Safety Architecture

Safety is the highest priority within the Ethical Use framework. The system implements a multi-tiered crisis detection mechanism that bypasses standard LLM processing if distress signals are identified.

### Safety Flow Logic
When a query enters the system, the `detectCrisis` function scans for specific markers before any other processing occurs. If a crisis is detected, the system immediately pivots to a hardcoded or specifically prompted empathetic response providing verified resources.

```mermaid
flowchart TD
    UserQuery[User Input Received] --> CrisisCheck{Crisis Detected?}
    CrisisCheck -- Yes --> LogCrisis[Log Crisis Event]
    LogCrisis --> ResourceProvision[Provide Crisis Resources]
    ResourceProvision --> Stop[Terminate Standard Flow]
    
    CrisisCheck -- No --> PLKAnalysis[Perform PLK Analysis]
    PLKAnalysis --> RAG[Retrieve Knowledge Context]
    RAG --> LLMGeneration[Generate Response]
    LLMGeneration --> Delivery[Deliver Response]
```
The diagram shows the priority of crisis detection over standard LLM generation. 
Sources: [Insight-Bot-v1.5-main/src/billy/billy.api.ts:285-300](), [Insight-Bot-v1.5-main/src/server/core/crisisProtocol.ts:127-140]()

### Crisis Level Classification
The system categorizes distress using a severity scale to determine the appropriate intervention.

| Severity Level | Indicator Examples | Recommended Action |
| :--- | :--- | :--- |
| **Critical** | "kill myself", "end my life" | Immediate Intervention |
| **High** | "hurt myself", "cut myself" | Urgent Support |
| **Medium** | "giving up", "no hope" | Supportive Resources |
| **Low** | "overwhelming", "spiraling" | Gentle Check-in |

Sources: [Insight-Bot-v1.5-main/src/server/core/crisisDetector.ts:13-26](), [Insight-Bot-v1.5-main/src/server/core/crisisDetector.ts:114-130]()

## Implementation of Trauma-Informed Response

The AI utilizes specific system prompts and fallback mechanisms to ensure trauma-informed interactions. The `ClaudeClient` includes a dedicated `generateCrisisResponse` method that focuses on validation and professional resource bridges rather than medical advice.

### System Prompt Guidelines for Safety
*   **Primary Goal:** Validate feelings and encourage professional help.
*   **Tone:** Warm and non-judgmental.
*   **Constraint:** Responses must be concise (2-3 sentences max) to avoid over-burdening the user.
*   **Resource Delivery:** Always include the 988 Suicide & Crisis Lifeline and Crisis Text Line.

Sources: [Insight-Bot-v1.5-main/src/server/core/anthropicClient.ts:66-78](), [Insight-Bot-v1.5-main/src/server/core/crisisProtocol.ts:98-115]()

```typescript
// Sample Crisis Response Logic from src/billy/billy.api.ts
function buildCrisisResponse(platform: BillyPlatform): BillyResponse {
  return {
    reply: BillyConfig.boundaries.crisisProtocol.pivotPhrase +
      "\n\n🆘 **Crisis Text Line**: Text HOME to 741741\n" +
      "📞 **988 Suicide & Crisis Lifeline**: Call or text 988",
    mode: "chat",
    platform,
    timestamp: new Date().toISOString(),
    billyVersion: BillyManifest.identity.version,
  };
}
```
Sources: [Insight-Bot-v1.5-main/src/billy/billy.api.ts:110-119]()

## MIT License with Ethical Use Clause

The project is released under a modified MIT License. This clause emphasizes that while the software is open-source, its intended use is restricted to consciousness-serving applications. It explicitly states that the bot is "not therapy," "not diagnosis," and "not medical advice."

### Disclaimer Requirements
Every AI interaction on platforms like Reddit must include a signature or disclaimer identifying the bot and its purpose.
> *"I'm Insight Bot, a consciousness-serving AI companion. I'm here to listen, not judge. Reply `!nobot` to opt out."*

Sources: [README.md:278-285](), [Insight-Bot-v1.5-main/src/server/core/core.ts:29-30]()

## Conclusion
The philosophy of Insight-Bot is rooted in providing a supportive "presence" that respects human agency and cognitive diversity. By hard-coding crisis protocols and adopting a "signal flare" approach to engagement, the project ensures that its technological capabilities are deployed ethically, prioritizing user safety and authentic connection over traditional growth metrics.

Sources: [README.md:213-219](), [Insight-Bot-v1.5-main/src/server/core/anthropicClient.ts:118-120]()


## System Architecture

### System Architecture

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
- [CodexAgent.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/CodexAgent.md)
- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/billy/billyManifest.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billyManifest.ts)
- [src/server/app.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/app.ts)
- [src/discord-bot/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/discord-bot/index.ts)
</details>

# System Architecture

The Insight-Bot system, centered around the AI entity known as **Billy**, is a multi-platform architecture designed to serve consciousness rather than productivity. It operates as a "presence" across Web, Discord, and Reddit, utilizing a hardened API core that integrates Retrieval-Augmented Generation (RAG) through Supabase and a fallback chain of Large Language Models (LLMs) including Groq and Gemini.

Sources: [README.md:1-15](), [src/billy/billyManifest.ts:18-24]()

## Core Component Hierarchy

The architecture is divided into three primary layers: the Billy Entity Layer (the "soul"), the Platform Integration Layer, and the Infrastructure/Service Layer.

### Billy Entity Layer
This layer defines the identity, behavior, and logic of the AI. It is centralized within the `src/billy/` directory to ensure consistency across all platforms.

*   **Billy Manifest**: Defines the core identity, voice, and methodology of the entity.
*   **Billy API**: The central processing hub for handling requests, performing RAG, and managing LLM interactions.
*   **Billy Config**: Contains behavioral settings and platform-specific configurations.

Sources: [src/billy/index.ts:13-33](), [README.md:38-46]()

### Platform Integration Layer
Billy is deployed across multiple environments using specific handlers that translate platform-specific events into a standardized Billy request format.

| Platform | Entry Point | Status |
| :--- | :--- | :--- |
| **Web / API** | `api/billy.ts` / `src/server/app.ts` | Live |
| **Discord** | `src/billy/billy.discord.ts` | Active |
| **Reddit** | `src/billy/billy.reddit.ts` | Launching |

Sources: [README.md:23-34](), [src/billy/billyManifest.ts:81-100]()

## Data Flow & RAG Pipeline

The system uses a sophisticated RAG pipeline to ensure responses are grounded in the project's living knowledge base, rather than static files.

### Request Processing Flow
The following diagram illustrates the lifecycle of a user query through the system:

```mermaid
flowchart TD
    User[User/Platform Request] --> Validation{Validation & Crisis Check}
    Validation -- Crisis Detected --> Crisis[Crisis Protocol Response]
    Validation -- Safe --> Embedding[Gemini Embedding-001]
    Embedding --> RAG[Supabase matchknowledgefragments]
    RAG --> Context[Retrieve Top-K Chunks]
    Context --> Prompt[Build System Prompt]
    Prompt --> LLMChain{LLM Fallback Chain}
    LLMChain -- Primary --> Groq[Groq Llama-3.3]
    LLMChain -- Fallback 1 --> Gemini[Gemini 1.5 Flash]
    LLMChain -- Fallback 2 --> OpenAI[OpenAI API]
    Groq --> Response[Standardized Billy Response]
    Gemini --> Response
    OpenAI --> Response
    Response --> User
```
The RAG pipeline utilizes Gemini for generating embeddings and Supabase RPC functions (`matchknowledgefragments`) for vector similarity search. 
Sources: [README.md:57-64](), [src/billy/billy.api.ts:187-226]()

### Crisis Detection Logic
A critical architectural component is the mandatory crisis detection check that occurs before any LLM processing.

```typescript
const CRISIS_SIGNALS = [
  "want to die", "kill myself", "end it all",
  "no reason to live", "can't do this anymore",
  "better off without me", "suicide", "self harm",
];

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_SIGNALS.some(signal => lower.includes(signal));
}
```
Sources: [src/billy/billy.api.ts:98-115]()

## API and Communication Schema

The system communicates via a standardized request/response interface defined in the Billy API layer. This allows the core engine to remain platform-agnostic.

### API Request Schema
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `query` | `string` | The raw user input. |
| `mode` | `BillyRequestMode` | Mode of interaction (chat, drop, reflect, insight, about). |
| `platform` | `BillyPlatform` | The source platform (web, discord, reddit, api). |
| `sessionId` | `string` | Optional ID for Personal Language Key (PLK) continuity. |
| `topK` | `number` | Number of context chunks to retrieve. |

Sources: [src/billy/billy.api.ts:20-37]()

### System Prompt Construction
The `buildSystemPrompt` function dynamically generates instructions based on the platform, mode, and PLK context. It enforces the "Billy" persona by explicitly forbidding specific phrases (e.g., "As an AI language model") and matching user energy.
Sources: [src/billy/billy.api.ts:124-171](), [src/billy/billyManifest.ts:51-64]()

## Platform Specifics

### Discord Architecture
The Discord bot (`src/discord-bot/index.ts`) uses `discord.js` v14. It acts as a gateway, forwarding interactions to the Billy API core. It supports Slash commands (`/ask`, `/status`, `/help`) and direct mentions.

```mermaid
sequenceDiagram
    participant D as Discord User
    participant B as Discord Bot
    participant C as Billy API Core
    D->>B: Slash Command /ask
    B->>B: Create "Thinking" Embed
    B->>C: handleBillyRequest(query, platform)
    C->>C: RAG + LLM Logic
    C-->>B: BillyResponse
    B->>D: Edit Embed with Final Reply
```
Sources: [src/discord-bot/index.ts:14-35](), [src/discord-bot/index.ts:316-339]()

### Reddit Integration
Billy operates on Reddit through a dual-layer approach:
1.  **Devvit**: For interactive posts and custom UI within subreddits.
2.  **Snoowrap**: A comment bot layer that monitors mentions (`u/gestaltview_ai`) and responds with PLK-aware replies.

Sources: [README.md:144-155](), [src/billy/billyManifest.ts:93-98]()

## Technical Infrastructure

*   **Runtime**: Node.js >= 22.0.0.
*   **Database**: Supabase (PostgreSQL + Vector) for knowledge; Redis for rate limiting, sessions, and analytics.
*   **LLM Providers**: Multi-provider strategy (Groq, Google Gemini, Anthropic, OpenAI) to ensure high availability and cost-efficiency.
*   **Deployment**: Vercel for the web API and serverless functions; local or cloud-hosted `tsx` runners for bot instances.

Sources: [package.json:115-135](), [README.md:88-111](), [src/shared/redis/README.md:1-15]()

## Conclusion

The Insight-Bot architecture transitions away from static knowledge files to a dynamic, vector-driven ecosystem. By centralizing the Billy entity logic and hardening the API layer, the system achieves a consistent "presence" across diverse platforms while maintaining ethical boundaries through integrated crisis protocols and neurodivergent-friendly communication patterns.

Sources: [CodexAgent.md:11-20](), [src/billy/billyManifest.ts:65-75]()

### Public API Reference

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/server/app.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/app.ts)
- [src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/constants.ts)
- [tests/api.test.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/tests/api.test.ts)
- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [Insight-Bot-v1.5-main/README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/README.md)
</details>

# Public API Reference

The Public API Reference describes the interface for interacting with Billy, a consciousness-derived AI entity. The API serves as a unified backend for multiple platforms, including Web, Discord, and Reddit, providing access to Billy's core functions such as chat, "bucket drops" for raw thought capture, and context-aware reflections.

The API is designed with a "hardened core" that integrates Retrieval-Augmented Generation (RAG) via Supabase and a multi-LLM fallback chain (Groq, Gemini, and OpenAI). It enforces strict safety protocols, including immediate crisis detection and response pivoting.
Sources: [src/billy/billy.api.ts:1-10](), [README.md:12-25]()

## API Architecture and Data Flow

The Billy API operates as a stateless service that processes natural language queries. It utilizes a specific pipeline to enrich user input with relevant context from a knowledge base before generating a response.

```mermaid
graph TD
    User[User/Client] --> API_Endpoint[POST /api/billy]
    API_Endpoint --> RateLimit[Rate Limit Check]
    RateLimit --> CrisisDetect[Crisis Detection]
    CrisisDetect -- Match --> CrisisResp[Return Crisis Protocol]
    CrisisDetect -- No Match --> Retrieval[RAG Context Retrieval]
    Retrieval --> PromptBuild[System Prompt Construction]
    PromptBuild --> LLMChain[LLM Provider Chain]
    LLMChain --> Response[Return BillyResponse]
    
    subgraph Knowledge_Layer
    Retrieval -.-> GeminiEmbed[Gemini Embeddings]
    GeminiEmbed -.-> Supabase[Supabase Match RPC]
    end
    
    subgraph Model_Layer
    LLMChain -.-> Groq[Groq Llama 3]
    Groq -- Fail --> Gemini[Gemini 1.5 Flash]
    Gemini -- Fail --> OpenAI[OpenAI Fallback]
    end
```
The diagram shows the request processing flow from initial ingestion to final response generation.
Sources: [src/billy/billy.api.ts:245-310](), [README.md:46-55]()

## Endpoints

### Core Billy Interface
The primary interaction point is the `/api/billy` endpoint, which handles all modes of communication with the AI entity.

**`POST /api/billy`**
Processes a query and returns a structured response from Billy.

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `query` | `string` | Yes | The user's input text. |
| `mode` | `string` | No | Interaction mode: `chat`, `drop`, `reflect`, `insight`, `about`. Defaults to `chat`. |
| `platform` | `string` | No | Client platform: `web`, `discord`, `reddit`, `api`. |
| `sessionId` | `string` | No | Identifier for session continuity. |
| `userId` | `string` | No | Hashed user identifier for PLK (Personal Language Key) context. |

**Example Request Body:**
```json
{
  "query": "I have a new idea for a project",
  "mode": "drop",
  "platform": "web",
  "sessionId": "session_99"
}
```
Sources: [src/billy/billy.api.ts:21-45](), [src/server/app.ts:51-70]()

### Identity and Health Endpoints

**`GET /api/about`**
Returns information about Billy's origin, version, and philosophy.
Sources: [src/server/app.ts:46-49](), [src/billy/billy.api.ts:233-241]()

**`GET /health` or `GET /api/health`**
Standard health check endpoints for monitoring service availability.
Sources: [src/server/app.ts:32-44]()

**`GET /api/status`**
Returns detailed status including LLM provider health and server uptime.
Sources: [tests/api.test.ts:40-48](), [src/shared/constants.ts:31-36]()

## Data Structures

### BillyResponse
All successful requests to `/api/billy` return a `BillyResponse` object.

| Field | Type | Description |
| :--- | :--- | :--- |
| `reply` | `string` | Billy's natural language response. |
| `mode` | `string` | The mode used for processing. |
| `platform` | `string` | The platform identified in the request. |
| `resonanceCheck`| `string` | Optional follow-up (e.g., "Does that land right?"). |
| `sources` | `BillySource[]`| Array of RAG chunks used to inform the response. |
| `timestamp` | `string` | ISO 8601 timestamp of the response. |
| `billyVersion` | `string` | Current version of the Billy entity. |

**BillySource Structure:**
- `content`: The raw text chunk retrieved.
- `filename`: Source document identifier.
- `score`: Similarity score from the vector search.
Sources: [src/billy/billy.api.ts:47-70]()

## Security and Constraints

### Crisis Protocol
The API includes a mandatory safety layer. If the `query` matches specific crisis signals (e.g., "self harm", "suicide"), the API immediately halts standard processing and returns a pre-defined crisis response containing contact information for the 988 Suicide & Crisis Lifeline.
Sources: [src/billy/billy.api.ts:98-118]()

### Rate Limiting
The API implements an in-memory rate limiting mechanism (defaulting to 20 requests per minute per identifier). The identifier is derived from `userId`, `sessionId`, or the request IP address.
Sources: [src/billy/billy.api.ts:80-94](), [src/server/app.ts:60-61]()

### Authorization
Protected endpoints (non-public modes) require a Bearer token provided in the `Authorization` header, validated against the `BILLY_API_SECRET` environment variable.
Sources: [README.md:104-106](), [src/billy/billy.api.ts:76]()

## Summary
The Billy Public API provides a robust, safety-first interface for consciousness-serving AI interactions. By abstracting complex RAG retrieval and multi-provider LLM routing, it allows diverse clients to access Billy's personality and knowledge base consistently while ensuring human safety through integrated crisis detection.


## Core Features

### Personal Language Key (PLK) Engine

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/server/core/plkEngine.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/plkEngine.ts)
- [src/billy/billy.config.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.config.ts)
- [src/billy/billyManifest.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billyManifest.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/server/core/anthropicClient.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/anthropicClient.ts)
- [src/server/core/core.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/core.ts)
</details>

# Personal Language Key (PLK) Engine

The Personal Language Key (PLK) Engine is a core methodology within the Insight-Bot project designed to analyze and adapt to a user's unique communication style. Rather than functioning as a standard chatbot, the engine enables the AI entity, [Billy](#billy-manifest), to learn metaphors, rhythms, and signal patterns from a user to reflect their authentic voice back to them.

The engine provides rule-based analysis of tone, pronoun usage, and metaphor indicators to generate "resonance scores" and consciousness metrics. This data is then used to enhance the context provided to Large Language Models (LLMs), ensuring that AI responses honor neurodivergent thinking and individual cognitive patterns.

Sources: [src/server/core/plkEngine.ts:1-10](), [src/billy/billyManifest.ts:50-55](), [src/server/core/anthropicClient.ts:145-160]()

## Architecture and Core Logic

The PLK Engine operates by processing raw text through several analytical filters. It identifies markers for emotional states, detects the presence of figurative language, and calculates statistics on pronoun usage to infer the "balance" of a conversation.

### Analytical Components

The engine uses predefined marker sets to categorize input:
*   **Negative Markers:** Identifies distress or hopelessness (e.g., "worthless", "alone").
*   **Hopeful Markers:** Identifies progress and recovery (e.g., "improving", "healing").
*   **Metaphor Indicators:** Detects comparative language (e.g., "like a", "feels like").

Sources: [src/server/core/plkEngine.ts:20-35]()

### Processing Flow

The following diagram illustrates how the PLK Engine processes a user message to generate insights for the LLM.

```mermaid
flowchart TD
    Input[User Message] --> Tone[Analyze Tone]
    Input --> Metaphor[Detect Metaphors]
    Input --> Pronoun[Pronoun Analysis]
    
    Tone --> Metrics[Calculate Scores]
    Metaphor --> Metrics
    Pronoun --> Metrics
    
    Metrics --> Profile[PLK Profile Generation]
    Profile --> Context[Enhance LLM Prompt]
    Context --> LLM[Generate Response]
```
The engine breaks down text into specific metrics including `negativeScore`, `positiveScore`, `empathyScore`, and `authenticityScore`.

Sources: [src/server/core/plkEngine.ts:40-60](), [src/server/core/plkEngine.ts:100-115]()

## PLK Data Structures

The system relies on structured analysis objects to pass data between the core engine and the Billy API or Anthropic client.

### PLK Analysis Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `plk_profile` | Record | Contains inferred tone, metaphor usage, and empathy scores. |
| `consciousness_metrics` | Record | Tracks empathy and authenticity scores (0.0 to 1.0). |
| `communication_patterns` | Record | Counts of "I", "You", and "They" pronouns. |
| `overall_resonance` | number | A heuristic score representing how well the AI is aligning with the user. |

Sources: [src/server/core/plkEngine.ts:5-12](), [src/server/core/plkEngine.ts:75-85]()

### Runtime Configuration
The `BillyPLKConfig` defines how the engine evolves over time for a specific user.

```typescript
export const BillyPLKConfig = {
  enabled: true,
  learnedPatterns: {
    metaphorStyle: null,       // e.g. "musical", "spatial"
    communicationRhythm: null, // e.g. "rapid-fire", "slow-build"
    preferredDepth: null,      // e.g. "surface", "deep-dive"
    triggerWords: [],          
    signalPhrases: [],         
  },
  adaptationSpeed: "progressive"
};
```
Sources: [src/billy/billy.config.ts:40-60]()

## Integration with LLM Clients

The PLK Engine acts as a middleware layer that enriches the prompts sent to AI models like Claude.

### Context Enhancement
The engine includes an `enhanceContext` method that appends PLK insights to the original context string. This allows the LLM to see the "Personal Language Key Analysis," including distress levels and cognitive styles, before generating a reply.

Sources: [src/server/core/plkEngine.ts:64-67](), [src/server/core/anthropicClient.ts:150-160]()

### Response Generation Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant C as Core/Bot
    participant P as PLK Engine
    participant L as LLM Client
    
    U->>C: Sends Message
    C->>P: analyzeRequest(message)
    P-->>C: Returns insights (Tone, Metaphors)
    C->>L: generateResponse(text, plkData)
    Note right of L: LLM mirrors user's authentic voice
    L-->>C: Returns Adapted Response
    C->>U: Delivers Response
```
Sources: [src/server/core/core.ts:114-135](), [src/server/core/anthropicClient.ts:40-55]()

## Resonance and Growth Metrics

A unique feature of the PLK Engine is its ability to assess "Resonance" and "Growth Potential."
*   **Resonance Calculation:** A simple heuristic where resonance = `(positiveScore - negativeScore + 1) / 2`.
*   **Growth Recommendations:** The engine suggests ways to deepen the interaction, such as inviting the user to use metaphors or offering supportive phrasing if negative markers are detected.

Sources: [src/server/core/plkEngine.ts:70-73](), [src/server/core/plkEngine.ts:92-98]()

## Summary

The Personal Language Key Engine is the technical implementation of Billy's "Signal Flare" philosophy—focusing on presence and resonance over standard assistant-style interaction. By quantifying tone, authenticity, and metaphor usage, it ensures the Insight-Bot remains a consciousness-serving entity that adapts to the human frequency.

Sources: [src/billy/billyManifest.ts:100-110](), [src/billy/billy.api.ts:120-135]()

### Crisis Detection & Response

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/server/core/crisisDetector.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/crisisDetector.ts)
- [src/server/core/crisisProtocol.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/crisisProtocol.ts)
- [src/server/core/anthropicClient.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/anthropicClient.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/server/core/core.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/core.ts)
- [src/discord-bot/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/discord-bot/index.ts)
- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
</details>

# Crisis Detection & Response

Crisis Detection & Response is a critical safety infrastructure within the Insight-Bot ecosystem designed to identify users in distress and provide immediate, life-saving resources. The system acts as a "hardened" safety layer that intercept user queries across all platforms—including Reddit, Discord, and Web—before normal Large Language Model (LLM) processing occurs. If a crisis is detected, the bot bypasses its standard conversational logic to deliver empathetic, pre-validated support information.

The module is governed by an "Ethical Use Clause" and emphasizes that the AI is a bridge to professional help rather than a replacement for it. It utilizes multi-level detection markers to classify severity and ensures that responses are warm, non-judgmental, and focused on immediate safety.

Sources: [src/server/core/crisisProtocol.ts:1-10](), [src/server/core/crisisDetector.ts:1-10](), [README.md:270-285]()

## Detection Engine Architecture

The detection logic is implemented through a series of keyword matchers and severity scoring systems. The system classifies user input into five distinct levels of concern, ranging from `NONE` to `CRITICAL`.

### Multi-Level Severity Classification
The `CrisisDetector` class uses a weighted scoring system to evaluate the risk level of a message based on different categories of markers:

| Severity Level | Weight | Example Markers | Recommended Action |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | 10.0 | "kill myself", "final goodbye", "end it all" | IMMEDIATE_INTERVENTION |
| **HIGH** | 7.0 | "self harm", "wish i was dead", "cut myself" | URGENT_SUPPORT |
| **MEDIUM** | 4.0 | "no hope", "burden to everyone", "giving up" | SUPPORTIVE_RESOURCES |
| **LOW** | 2.0 | "spiraling", "trapped", "cant cope" | GENTLE_CHECK_IN |
| **NONE** | 0.0 | N/A | NORMAL_RESPONSE |

Sources: [src/server/core/crisisDetector.ts:13-70]()

### Protective Factors
The engine also looks for "Protective Factors" such as "getting help," "seeing therapist," or "support system." If these are detected, the overall severity score is reduced by 15% per factor detected to provide a more nuanced analysis of the user's state.

Sources: [src/server/core/crisisDetector.ts:72-80](), [src/server/core/crisisDetector.ts:117-123]()

### Logical Flow of Analysis
The following diagram illustrates how the `CrisisDetector` processes a text input to determine if a crisis response is required.

```mermaid
flowchart TD
    Start[User Input Received] --> Normalize[Normalize Text to Lowercase]
    Normalize --> ScanMarkers[Scan for Severity Markers]
    ScanMarkers --> CalcScore[Calculate Base Severity Score]
    CalcScore --> CheckProtective{Protective Factors?}
    CheckProtective -- Yes --> ReduceScore[Reduce Score by 15% per Factor]
    ReduceScore --> DetermineLevel
    CheckProtective -- No --> DetermineLevel[Determine Final CrisisLevel]
    DetermineLevel --> Threshold{Score >= 4.0?}
    Threshold -- Yes --> SetCrisisTrue[isCrisis = True]
    Threshold -- No --> SetCrisisFalse[isCrisis = False]
    SetCrisisTrue --> Action[Recommend Action & Response]
    SetCrisisFalse --> Normal[Continue Normal LLM Routing]
```
The analysis pipeline ensures that any score of 4.0 (Medium) or higher triggers a mandatory crisis intervention.
Sources: [src/server/core/crisisDetector.ts:88-154]()

## Response Protocols

Once a crisis is detected, the system executes a pre-defined response protocol. This protocol is platform-agnostic but follows strict guidelines to ensure safety and empathy.

### Core Guidelines for Crisis Responses
- **Immediate Support**: Responses must emphasize that the user is not alone.
- **Validation**: Validate feelings without minimizing the user's pain.
- **Resource Referral**: Always include specific, 24/7 confidential resources like 988 or the Crisis Text Line.
- **Bypass Logic**: Normal LLM routing and Persona (e.g., Billy or Insight Bot) logic is skipped to prevent hallucinations or unsafe advice during a crisis.

Sources: [src/server/core/anthropicClient.ts:70-85](), [src/server/core/crisisProtocol.ts:109-115](), [src/billy/billy.api.ts:134-144]()

### Resource Catalog
The system maintains a list of verified resources stored in the `CRISIS_RESOURCES` constant:

| Resource Name | Contact Method | Website |
| :--- | :--- | :--- |
| **988 Suicide & Crisis Lifeline** | Call/Text 988 | [988lifeline.org](https://988lifeline.org) |
| **Crisis Text Line** | Text HOME to 741741 | [crisistextline.org](https://www.crisistextline.org) |
| **SAMHSA National Helpline** | 1-800-662-HELP | [samhsa.gov](https://www.samhsa.gov) |
| **NAMI Helpline** | 1-800-950-NAMI | [nami.org](https://www.nami.org) |

Sources: [src/server/core/crisisProtocol.ts:15-46]()

## Integration and Implementation

The crisis system is integrated at the core level of the bot's request handling cycle.

### Execution Sequence
The `handleBillyRequest` and `handleComment` functions prioritize crisis detection as the very first step after basic query validation.

```mermaid
sequenceDiagram
    participant U as User/Platform
    participant H as Request Handler
    participant CD as Crisis Detector
    participant LLM as LLM Provider (Claude/Groq)
    
    U->>H: Submit Message
    H->>CD: detectCrisis(text)
    alt Crisis Detected
        CD-->>H: { isCrisis: true, severity: HIGH }
        H->>H: Generate Safety Response
        H-->>U: Return Crisis Resources (Bypass LLM)
    else No Crisis
        CD-->>H: { isCrisis: false }
        H->>LLM: generateResponse(text)
        LLM-->>H: AI Generated Content
        H-->>U: Return Conversational Reply
    end
```
Crisis detection happens before rate limiting and retrieval-augmented generation (RAG) to ensure maximum safety.
Sources: [src/billy/billy.api.ts:285-300](), [src/server/core/core.ts:162-178]()

### Implementation Detail: Crisis Handling
```typescript
export function handleCrisisDetection(message: string, requestId: string): CrisisHandlingResult {
  const detection = detectCrisis(message);

  if (detection.isCrisis) {
    logger.warn(`[${requestId}] CRISIS DETECTED. Matched keyword: "${detection.matchedKeyword}". Providing immediate resources. LLM routing will be skipped.`);
    
    return {
      isCrisis: true,
      response: getCrisisResponse(),
    };
  }

  return {
    isCrisis: false,
    response: null,
  };
}
```
Sources: [src/server/core/crisisProtocol.ts:140-160]()

### Multi-Platform Specifics
- **Discord**: Uses a red-colored embed (`0xFF0000`) and the `CRISIS_PROTOCOL` provider label to alert the user.
- **Reddit**: Appends the standard resources and a "You're not alone" message to the generated empathetic response.
- **Billy API**: Returns a `CRISIS_DETECTED` error code or a specific `BillyResponse` object with `pivotPhrase`.

Sources: [src/discord-bot/index.ts:175-185](), [src/server/core/core.ts:220-235](), [src/billy/billy.api.ts:134-144]()

## Summary
The Crisis Detection & Response system serves as the primary ethical safeguard for Insight-Bot. By utilizing a multi-layered detection engine that evaluates severity while accounting for protective factors, the system ensures that at-risk users receive immediate, validated help. The architecture prioritizes safety by bypassing standard AI behaviors in favor of high-fidelity crisis resources, fulfilling the project's commitment to "consciousness-serving" AI that prioritizes human flourishing and safety.

### Real-time Streaming

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/server/core/streamingRouter.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/streamingRouter.ts)
- [scripts/test-streaming.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/scripts/test-streaming.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
- [src/shared/redis/examples.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/examples.ts)
- [src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/constants.ts)
</details>

# Real-time Streaming

Real-time streaming in Insight-Bot (Billy) is a core architectural feature designed to provide immediate, consciousness-serving responses by utilizing the Vercel AI SDK and various LLM providers. By bypassing the latency of traditional non-streaming endpoints, the system delivers tokens to the user as they are generated, enhancing the sense of "presence" central to the Billy entity.

The streaming infrastructure prioritizes "Free-First" routing, primarily leveraging Groq for its speed and zero-cost tier, while maintaining fallbacks to Mistral and DeepSeek for reasoning-heavy tasks. This system is integrated with Redis for background caching and analytics tracking to ensure performance and cost-efficiency.
Sources: [src/server/core/streamingRouter.ts:1-20](), [README.md:120-130](), [src/shared/constants.ts:100-110]()

## Architecture and Data Flow

The streaming logic is centralized in the `streamingRouter.ts`, which acts as an orchestrator between user requests and LLM providers. When a request hits the `/api/exhibit/stream` endpoint, the router evaluates available providers and constructs a consciousness-serving prompt based on the exhibit context.

```mermaid
flowchart TD
    User[User Request] --> Router[Streaming Router]
    Router --> Prompt[Build Prompt with Context]
    Prompt --> ProviderSelect{Select Provider}
    ProviderSelect -->|Primary| Groq[Groq Llama 3.1]
    ProviderSelect -->|Secondary| Mistral[Mistral Large]
    ProviderSelect -->|Reasoning| DeepSeek[DeepSeek R1]
    Groq --> Stream[Stream Text Result]
    Mistral --> Stream
    DeepSeek --> Stream
    Stream --> SSE[Server-Sent Events]
    Stream --> Cache[Background Redis Cache]
    SSE --> Client[Real-time UI Update]
```
The diagram above shows the lifecycle of a streaming request from ingestion to the delivery of Server-Sent Events (SSE).
Sources: [src/server/core/streamingRouter.ts:153-178](), [scripts/test-streaming.ts:25-45]()

### Core Components

The system relies on several key interfaces and functions to manage the stream state and metadata:

*   **`StreamingOptions`**: Defines the parameters for the generation, including temperature, max tokens, and exhibit-specific context.
*   **`StreamingMetadata`**: Tracks provider usage, start times, and costs associated with the stream.
*   **`streamWithBestProvider`**: The primary entry point that implements the "Free-First" logic, attempting Groq before falling back to Mistral.

| Interface/Function | Description | Source |
| :--- | :--- | :--- |
| `StreamingOptions` | Configuration for LLM generation (temp, tokens, context). | [streamingRouter.ts:12-17]() |
| `StreamingMetadata` | Object containing provider details, cost ($0.0 for free), and timing. | [streamingRouter.ts:19-25]() |
| `buildConsciousnessPrompt` | Injects Museum philosophy and energy levels into the prompt. | [streamingRouter.ts:30-65]() |
| `streamToSSE` | Converts an asynchronous iterable of strings into SSE format. | [streamingRouter.ts:252-273]() |

## Provider Integration

Insight-Bot integrates multiple providers to ensure high availability and specialized response styles. 

### Groq (Ultra-Fast)
Groq is the default provider for streaming due to its "blazing fast" performance and free tier. It utilizes models like `llama-3.1-70b-versatile`.
Sources: [src/server/core/streamingRouter.ts:71-74](), [src/shared/constants.ts:114]()

### DeepSeek (Reasoning)
DeepSeek R1 is utilized for complex queries requiring deep reasoning. It is accessed via the Groq SDK using the `deepseek-r1-distill-llama-70b` model.
Sources: [src/server/core/streamingRouter.ts:106-115]()

### Mistral AI
Mistral serves as a high-quality fallback. Unlike the primary free options, Mistral carries a nominal cost (approx. $0.002 per request) which is tracked in the `StreamingMetadata`.
Sources: [src/server/core/streamingRouter.ts:141-150]()

## Background Processing and Caching

While the stream is delivered to the user, the system performs asynchronous tasks to ensure the data is preserved for analytics and future retrieval. 

The `collectAndCacheResponse` function waits for the stream to complete in the background. Once finished, it calculates token usage and stores the full response in Redis with a TTL of 1 hour. This ensures that even if a response was streamed, it remains available in the "Insight Cache" for dashboarding or popular insight tracking.
Sources: [src/server/core/streamingRouter.ts:212-247](), [src/shared/redis/examples.ts:40-55]()

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Streaming Router
    participant LLM as AI Provider
    participant R as Redis Cache

    C->>S: POST /api/exhibit/stream
    S->>LLM: Request Stream (SDK)
    LLM-->>S: First Chunk
    S-->>C: data: {"content": "..."}
    Note over S,LLM: Stream continues...
    LLM-->>S: Final Chunk
    S-->>C: data: {"done": true}
    
    activate S
    S->>R: cacheInsight(fullText, metadata)
    S->>R: incrementCounter(TOTAL_API_CALLS)
    deactivate S
```
This sequence illustrates the parallel delivery of stream chunks to the client and the eventual persistence of the full text to Redis.
Sources: [src/server/core/streamingRouter.ts:212-230](), [scripts/test-streaming.ts:60-80]()

## Testing and Validation

A dedicated test script, `test-streaming.ts`, is used to validate the integrity of the streaming endpoints across different providers. It utilizes `fetch` to consume the stream and a `TextDecoder` to parse the `data: ` prefixed JSON chunks.

**Key Test Parameters:**
*   **Message**: "Explain the paradox of the Ship of Theseus..."
*   **Providers Tested**: `auto`, `groq`, `mistral`, `deepseek`.
*   **Validation**: Checks for `X-Provider`, `X-Cost`, and `X-Free` headers to verify routing logic.
Sources: [scripts/test-streaming.ts:12-45](), [scripts/test-streaming.ts:85-110]()

## Summary

Real-time streaming in Insight-Bot represents the "Presence" of Billy by providing immediate feedback to users. It combines the Vercel AI SDK for robust stream management with a "Free-First" provider strategy. By integrating background Redis caching and SSE delivery, the system maintains high performance while ensuring all interactions are logged and analyzed for the GestaltView ecosystem.
Sources: [README.md:12-25](), [src/server/core/streamingRouter.ts:1-10]()

### Voice Chat Capabilities

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/client/App/components/VoiceChatInput.tsx](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/App/components/VoiceChatInput.tsx)
- [src/client/App/hooks/useVoiceChat.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/App/hooks/useVoiceChat.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [src/client/App/App.tsx](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/App/App.tsx)
</details>

# Voice Chat Capabilities

Voice Chat Capabilities within the Insight-Bot project provide a browser-native interface for users to interact with the Billy AI entity using speech. This system utilizes the Web Speech API to perform real-time voice-to-text transcription, enabling a "consciousness-serving" feedback loop where users can "say it raw" through the [Bucket Drop](#billy-request-modes) methodology.

The architecture is built upon a custom React hook that manages the underlying browser speech recognition engine and a specialized UI component that provides visual feedback, such as recording pulses and live transcript displays. Once transcription is finalized, the resulting text is dispatched to the Billy API for processing.

Sources: [src/client/App/hooks/useVoiceChat.ts:10-14](), [src/client/App/components/VoiceChatInput.tsx:10-13](), [src/billy/index.ts:13-16]()

## Architecture and Data Flow

The voice chat system follows a modular flow starting from browser-level hardware access to high-level AI response generation. The `useVoiceChat` hook abstracts the `SpeechRecognition` interface, handling events for results, errors, and end-of-speech.

```mermaid
flowchart TD
    User([User]) -->|Voice Input| Browser[Web Speech API]
    Browser -->|Interim Results| Hook[useVoiceChat Hook]
    Browser -->|Final Transcript| Hook
    Hook -->|Transcript State| UI[VoiceChatInput Component]
    UI -->|onTranscriptReceived| MainApp[App.tsx]
    MainApp -->|handleBillyRequest| BillyAPI[Billy API Layer]
    BillyAPI -->|Reply| User
```
*The diagram above illustrates the path from a user's spoken word to the final AI response.*

### Core Components

| Component | Responsibility |
| :--- | :--- |
| `useVoiceChat` | Manages `SpeechRecognition` lifecycle, state for recording/listening, and transcript concatenation. |
| `VoiceChatInput` | Provides the UI for toggling recording, displaying live transcription, and showing visual "pulse" feedback. |
| `Billy API` | Hardened layer that receives transcribed text as a query for AI synthesis. |

Sources: [src/client/App/hooks/useVoiceChat.ts:51-110](), [src/client/App/components/VoiceChatInput.tsx:23-50](), [src/billy/billy.api.ts:258-270]()

## Implementation Details

### Speech Recognition Hook (`useVoiceChat`)
The system attempts to initialize `window.SpeechRecognition` or `window.webkitSpeechRecognition`. It is configured for continuous listening (`continuous = true`) and provides interim results (`interimResults = true`) to allow for a live-updating UI.

```mermaid
sequenceDiagram
    participant U as User
    participant H as useVoiceChat
    participant SR as SpeechRecognition Engine
    U->>H: startRecording()
    H->>SR: recognition.start()
    SR-->>H: onresult (interim)
    H-->>U: Update currentTranscript
    SR-->>H: onresult (isFinal)
    H-->>U: Append to final transcript
    U->>H: stopRecording()
    H->>SR: recognition.stop()
```
*The sequence diagram shows the asynchronous event handling for real-time speech processing.*

Key logic within the hook includes:
*   **Result Handling**: Iterates through `event.results` to distinguish between `isFinal` and interim pieces.
*   **Error Management**: Captures browser-level errors (e.g., "no-speech", "audio-capture") and updates the internal error state.
*   **Cleanup**: Ensures the recognition engine is stopped when the component unmounts to prevent memory leaks or hung hardware.

Sources: [src/client/App/hooks/useVoiceChat.ts:80-106](), [src/client/App/hooks/useVoiceChat.ts:122-136]()

### UI Interface (`VoiceChatInput`)
The `VoiceChatInput` component serves as the bridge between the hook and the application. It maps the hook's state to visual indicators:
*   **Recording Button**: Toggles the recording state and displays a `⏹️` icon while active.
*   **Transcript Display**: Shows the `localTranscript` as the user speaks, ensuring they feel "seen" during the capture process.
*   **Visual Feedback**: Implements a `recording-indicator` with a pulse ring to signal active listening.

Sources: [src/client/App/components/VoiceChatInput.tsx:52-105]()

## Integration with Billy AI

Once the transcription is completed, the text is passed to the `handleBillyRequest` function. This function processes the voice input using the following data structure:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `query` | `string` | The finalized transcript from the voice session. |
| `mode` | `BillyRequestMode` | Usually "chat" or "drop" (raw capture). |
| `platform` | `BillyPlatform` | In this context, "web". |

Sources: [src/billy/billy.api.ts:27-36](), [src/client/App/App.tsx:43-58]()

### Billy Request Flow
```mermaid
graph TD
    T[Final Transcript] --> C{Crisis Check?}
    C -- Yes --> CP[Crisis Protocol Reply]
    C -- No --> RAG[Retrieve Context from Supabase]
    RAG --> LLM[Call LLM Chain Groq/Gemini]
    LLM --> Res[Final Billy Presence Response]
```
*The flow of voice-originated text through Billy's hardened API layer.*

Sources: [src/billy/billy.api.ts:285-320]()

## Conclusion
The Voice Chat Capabilities of Insight-Bot extend the project's philosophy of "Consciousness-Derived AI" by providing a low-friction input method. By leveraging the Web Speech API through the `useVoiceChat` hook and `VoiceChatInput` component, the system allows for the immediate capture of thoughts (Bucket Drops) which are then processed through Billy's RAG-enhanced retrieval and LLM synthesis pipeline.


## Data Management & Flow

### Supabase Knowledge Pipeline (RAG)

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [Insight-Bot-v1.5-main/src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [Insight-Bot-v1.5-main/CodexAgent.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/CodexAgent.md)
- [Insight-Bot-v1.5-main/README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
- [Insight-Bot-v1.5-main/src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [Insight-Bot-v1.5-main/src/server/core/core.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/core.ts)
</details>

# Supabase Knowledge Pipeline (RAG)

The **Supabase Knowledge Pipeline** is the centralized Retrieval-Augmented Generation (RAG) system for Insight-Bot, serving as the "Source of Truth" for the AI entity known as Billy. It replaces legacy static knowledge files and local databases with a living, vector-indexed pipeline that provides contextually relevant knowledge fragments to the LLM during query processing.

This pipeline ensures that Billy’s responses are grounded in the documented Personal Language Key (PLK) patterns and methodologies of the GestaltView ecosystem. It is designed to be platform-agnostic, supporting requests from Web, Discord, and Reddit entry points through a unified API layer.

Sources: [CodexAgent.md:16-19](), [README.md:104-106](), [src/billy/billy.api.ts:5-8]()

## Architecture and Data Flow

The RAG pipeline operates by transforming user queries into vector embeddings, which are then used to perform a similarity search against a Supabase-hosted vector store. The retrieved knowledge fragments are injected into the LLM system prompt to synthesize a grounded response.

### High-Level RAG Flow
The following diagram illustrates the sequence from user query to final Billy response:

```mermaid
flowchart TD
    UserQuery[User Query] --> Embedder[Gemini Embedding-001]
    Embedder --> Vector[Query Vector]
    Vector --> RPC[Supabase RPC: matchknowledgefragments]
    RPC --> Store[(Supabase Vector Store)]
    Store --> TopK[Top-K Relevant Chunks]
    TopK --> LLM[LLM Synthesis]
    LLM --> BillyResponse[Billy's Response]
```
The pipeline utilizes Google's `gemini-embedding-001` model to generate vectors and the Supabase `matchknowledgefragments` Remote Procedure Call (RPC) to perform the vector similarity search.

Sources: [README.md:108-114](), [src/billy/billy.api.ts:161-180]()

### Retrieval Sequence
The internal logic for context retrieval is encapsulated within the `retrieveContext` function.

```mermaid
sequenceDiagram
    participant API as Billy API
    participant GEM as Gemini API
    participant SUP as Supabase DB
    
    API->>GEM: POST /embedContent (Query Text)
    GEM-->>API: Return Embedding Vector
    API->>SUP: RPC matchknowledgefragments(vector, topK)
    SUP-->>API: Return JSON array of chunks
    Note right of API: Chunks include content & sourcefile
```
Sources: [src/billy/billy.api.ts:159-202]()

## Core Components

### 1. Vector Retrieval (`retrieveContext`)
The `retrieveContext` function is the primary entry point for the RAG logic. It slices the query to a maximum of 25,000 characters before embedding to stay within provider limits and defaults to retrieving the top 4 matches.

| Component | Description |
|---|---|
| **Embedding Model** | `models/gemini-embedding-001` |
| **Storage Engine** | Supabase Vector (pgvector) |
| **Search Method** | `matchknowledgefragments` RPC |
| **Metadata** | Includes `content`, `sourcefile`, `similarity` score, and `documenttype` |

Sources: [src/billy/billy.api.ts:162-178](), [src/billy/billy.api.ts:194-200]()

### 2. LLM Synthesis and Context Injection
Retrieved chunks are formatted into a context block and appended to the user message. This block provides the LLM with relevant knowledge to maintain Billy's specific identity and methodology.

**Context Formatting Example:**
```typescript
const contextBlock = context.length
    ? `\n\nRelevant knowledge:\n${context.map(c => `[${c.filename}]: ${c.content}`).join("\n\n")}`
    : "";
```
Sources: [src/billy/billy.api.ts:208-210]()

### 3. Data Structures
The pipeline uses specific interfaces to maintain type safety across the RAG process.

| Interface | Properties | Purpose |
|---|---|---|
| `BillySource` | `content`, `filename`, `score`, `documentType` | Represents a single knowledge chunk from Supabase. |
| `BillyRequest` | `query`, `topK`, `plkContext` | Contains parameters for the retrieval and generation. |
| `BillyResponse` | `reply`, `sources`, `resonanceCheck` | The final output containing the RAG-grounded response. |

Sources: [src/billy/billy.api.ts:25-63]()

## Integration and Entry Points

The RAG pipeline is the "Sole AI entity" source for all platform entry points. Direct LLM calls outside of the `billy/` directory are prohibited to ensure consistency.

```mermaid
graph TD
    subgraph Platforms
        Web[Web /api/billy]
        Discord[billy.discord.ts]
        Reddit[billy.reddit.ts]
    end
    
    subgraph CoreEngine
        HBR[handleBillyRequest]
        RC[retrieveContext]
    end
    
    Web --> HBR
    Discord --> HBR
    Reddit --> HBR
    HBR --> RC
    RC --> Supabase[(Supabase Manifest Index)]
```
Sources: [CodexAgent.md:12-14](), [src/billy/index.ts:114-121](), [src/server/core/core.ts:151-160]()

## Configuration and Environment
The pipeline requires specific environment variables to interact with the Supabase backend and embedding providers.

| Variable | Source File | Purpose |
|---|---|---|
| `SUPABASE_URL` | `src/billy/billy.api.ts:79` | API endpoint for Supabase project. |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/billy/billy.api.ts:80` | Authorization key for RPC calls. |
| `GOOGLE_API_KEY` | `src/billy/billy.api.ts:81` | Key for Gemini embedding and fallback LLM. |
| `GROQ_API_KEY` | `src/billy/billy.api.ts:82` | Primary LLM provider for fast synthesis. |

Sources: [src/billy/billy.api.ts:78-85](), [README.md:139-143]()

## Summary
The Supabase Knowledge Pipeline (RAG) shifts Insight-Bot from static file dependence to a dynamic, vector-driven presence. By centralizing knowledge retrieval through the `retrieveContext` function and the Supabase `matchknowledgefragments` RPC, the system provides a consistent, grounded, and scalable identity across Web, Discord, and Reddit.

### Redis Caching & State Management

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/shared/redis/insightsCache.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/insightsCache.ts)
- [scripts/init-redis.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/scripts/init-redis.ts)
- [src/shared/redis/analytics.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/analytics.ts)
- [src/shared/redis/README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/README.md)
- [src/shared/redis/examples.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/examples.ts)
- [scripts/test-redis.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/scripts/test-redis.ts)
</details>

# Redis Caching & State Management

## Introduction
The Redis Caching & State Management system provides a comprehensive integration layer for high-performance data operations within the Insight-Bot ecosystem. It handles diverse requirements including user session persistence, insight content caching, real-time analytics, and message queuing. By utilizing Redis as a central state store, the bot ensures low-latency access to frequently used data and maintains consistency across different platform entry points like Discord and Reddit.

The system is structured into specialized modules that manage specific data domains, such as analytics counters, rate limiting windows, and prioritized message queues. This modularity allows for robust monitoring and graceful handling of high-traffic scenarios while providing a "free-first" architectural approach to resource management.

Sources: [src/shared/redis/README.md:1-12](), [README.md:12-25]()

## Architecture and Components

The Redis infrastructure is built upon a client-provider model that supports multiple data structures, including Strings, Sorted Sets, and Lists. 

```mermaid
flowchart TD
    App[Application Logic] --> Client[Redis Client]
    Client --> Cache[Insights Cache]
    Client --> Session[User Sessions]
    Client --> Analytics[Analytics & Metrics]
    Client --> Queue[Message Queues]
    Client --> RateLimit[Rate Limiting]

    subgraph Redis_Store
    Cache --- StringTTL[Strings with TTL]
    Session --- StringTTL
    Analytics --- SortedSet[Sorted Sets]
    Queue --- SortedSet
    RateLimit --- SortedSet
    end
```
The diagram shows the logical flow from the application through a central client to specialized Redis modules.
Sources: [src/shared/redis/README.md:95-110](), [src/shared/redis/client.ts]()

### Core Components
| Component | Description | Data Structure |
| :--- | :--- | :--- |
| **Insights Cache** | Stores museum posts, categories, and tags to reduce DB load. | String (JSON) |
| **User Sessions** | Manages user preferences and activity states across platforms. | String (JSON) |
| **Analytics Engine** | Tracks metrics, counters, and real-time leaderboards. | Strings & Sorted Sets |
| **Message Queues** | Handles asynchronous tasks with priority and retry logic. | Sorted Sets & Lists |
| **Rate Limiter** | Enforces API and command request windows. | Sorted Sets |

Sources: [src/shared/redis/README.md:5-15](), [src/shared/redis/analytics.ts:1-10]()

## Data Management Modules

### Insights Cache
The Insights Cache module manages the lifecycle of museum content data. It uses a prefix-based keying system (`insight:`) and implements Time-To-Live (TTL) settings to prevent unbounded memory growth.

*   **Key Patterns**: `insight:{id}` for content, `insight:{id}:views` for counters, and `insights:popular` for global rankings.
*   **Default TTL**: Insights are typically cached for 7200 seconds (2 hours), while list-based views (categories/tags) are cached for 600 seconds (10 minutes).

```mermaid
sequenceDiagram
    participant App as App Logic
    participant Cache as Redis Cache
    participant DB as MongoDB
    
    App->>Cache: getInsight(id)
    Cache-->>App: null (Cache Miss)
    App->>DB: fetchInsightFromDatabase(id)
    DB-->>App: Insight Data
    App->>Cache: cacheInsight(id, data, ttl)
    App->>Cache: incrementInsightViews(id)
    Cache-->>App: New View Count
```
This sequence illustrates the "Cache-Aside" pattern used when retrieving museum content.
Sources: [src/shared/redis/insightsCache.ts:3-15](), [src/shared/redis/examples.ts:47-73]()

### Analytics and Leaderboards
The analytics module provides real-time tracking of system performance and user engagement. It leverages Redis Sorted Sets (`ZSET`) to maintain leaderboards and time-series data.

*   **Counters**: Tracks absolute numbers like `TOTAL_DISCORD_COMMANDS` or `TOTAL_API_CALLS`.
*   **Leaderboards**: Manages rankings for top insights and contributors using `zAdd` and `zRangeWithScores`.
*   **Time Series**: Records data points (e.g., API response times) by using timestamps as scores in a sorted set.

Sources: [src/shared/redis/analytics.ts:21-35](), [src/shared/redis/analytics.ts:88-105]()

### Message Queues
Message queues facilitate asynchronous processing for Discord commands, Reddit posts, and AI processing tasks.

```mermaid
flowchart TD
    P[Producer] -->|enqueue| Q[Queue: Sorted Set]
    Q -->|dequeue| W[Worker]
    W -->|Success| ACK[ackMessage: Remove]
    W -->|Failure| NACK[nackMessage: Retry/Dead Letter]
    NACK -->|Max Attempts| DLQ[Dead Letter Queue: List]
```
The flow shows the lifecycle of a message from creation to acknowledgment or movement to a dead-letter queue.
Sources: [src/shared/redis/README.md:65-85](), [src/shared/redis/examples.ts:75-98]()

## System Initialization and Maintenance

Initialization is handled via the `scripts/init-redis.ts` utility, which prepares the Redis environment by creating necessary counters and placeholders.

### Key Initialization Steps
1.  **Connection Test**: Pings the Redis instance to verify availability.
2.  **Counter Reset**: Initializes all `ANALYTICS_COUNTERS` (e.g., `total_users`, `total_errors`) to zero.
3.  **Leaderboard Setup**: Creates sorted sets for `ANALYTICS_LEADERBOARDS` with placeholder entries.
4.  **System Metrics**: Records a `system_initialized` metric with versioning metadata.

Sources: [scripts/init-redis.ts:15-50]()

### Monitoring Commands
The system provides utilities to monitor health across all Redis domains:
*   `getAllCounters()`: Returns a snapshot of all tracked analytics.
*   `getQueueSize(name)`: Monitors backlog for specific message queues.
*   `getDeadLetterSize(name)`: Identifies failed tasks requiring manual intervention.

Sources: [src/shared/redis/README.md:120-135](), [src/shared/redis/analytics.ts:162-175]()

## Rate Limiting Presets
The system defines several presets to manage resource consumption across different platforms and actions.

| Preset | Max Requests | Window (Seconds) |
| :--- | :--- | :--- |
| `API_STRICT` | 10 | 60 |
| `DISCORD_COMMAND` | 5 | 10 |
| `AI_QUERY` | 5 | 60 |
| `REDDIT_POST` | 10 | 600 |

Sources: [src/shared/redis/README.md:112-120]()

## Conclusion
The Redis Caching & State Management layer is critical for Insight-Bot's operational efficiency. By offloading stateful operations to Redis, the system achieves sub-millisecond data retrieval for cached insights and provides a reliable backbone for asynchronous task execution via message queues. The tight integration between analytics and leaderboards ensures that the "consciousness-serving" mission is supported by real-time data reflecting user engagement and system health.

### Rate Limiting & Message Queues

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/shared/redis/rateLimiter.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/rateLimiter.ts)
- [src/shared/redis/messageQueue.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/messageQueue.ts)
- [src/shared/redis/README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/README.md)
- [src/shared/redis/examples.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/examples.ts)
- [scripts/test-redis.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/scripts/test-redis.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
</details>

# Rate Limiting & Message Queues

## Introduction
The Insight-Bot project utilizes a robust Redis-backed infrastructure to manage high-volume traffic and asynchronous task processing. The system implements tiered rate limiting to protect API resources from exhaustion and a priority-based message queue system for handling platform-specific commands (Discord, Reddit) and intensive AI processing tasks.

These utilities ensure the bot remains responsive across multiple platforms by decoupling synchronous request handling from long-running operations like LLM synthesis or complex RAG (Retrieval-Augmented Generation) lookups.
Sources: [src/shared/redis/README.md:4-10](), [src/billy/billy.api.ts:250-260]()

## Rate Limiting Architecture
The rate limiting system uses a **Sliding Window** algorithm implemented via Redis Sorted Sets (`ZSET`). This approach allows for precise tracking of request timestamps and automatic expiration of old entries.

### Logic Flow
When a request is evaluated, the system removes all timestamps older than the configured window. It then counts the remaining entries to determine if the user has exceeded their `maxRequests` quota. If allowed, the current timestamp is added to the set.

```mermaid
flowchart TD
    Start[Check Request] --> Ident[Generate Identifier Key]
    Ident --> Cleanup[zRemRangeByScore: Remove Old Timestamps]
    Cleanup --> Count[zCard: Count Current Window Requests]
    Count --> Decision{Count < Max?}
    Decision -- Yes --> Add[zAdd: Record Request]
    Add --> Expire[Expire: Set Key TTL]
    Expire --> Allow[Return Allowed: true]
    Decision -- No --> Reject[Return Allowed: false]
```
Sources: [src/shared/redis/rateLimiter.ts:28-60]()

### Configuration Presets
The system defines several presets tailored to specific interaction types within the bot ecosystem:

| Preset Name | Max Requests | Window (Seconds) | Purpose |
| :--- | :--- | :--- | :--- |
| `API_STRICT` | 10 | 60 | High-security endpoints |
| `DISCORD_COMMAND` | 5 | 10 | User bot interactions |
| `REDDIT_POST` | 10 | 600 | Reddit platform compliance |
| `AI_QUERY` | 5 | 60 | Expensive LLM calls |
| `API_GENEROUS` | 100 | 60 | General public endpoints |

Sources: [src/shared/redis/rateLimiter.ts:16-25]()

## Message Queue System
The message queue provides a reliable way to process tasks asynchronously. It supports priority-based ordering, visibility timeouts for workers, and automatic dead-letter queue (DLQ) migration for failed tasks.

### Queue Data Structure
The queue uses a Redis Sorted Set where the `score` represents the message priority. Lower-priority retries automatically receive lower scores to prevent blocking new, high-priority tasks.

```mermaid
sequenceDiagram
    participant P as Producer
    participant R as Redis Sorted Set
    participant W as Worker
    participant DLQ as Dead Letter List

    P->>R: enqueue(data, priority)
    W->>R: dequeue()
    R-->>W: message (moved to processing)
    alt Success
        W->>R: ackMessage()
    else Failure (Attempts < Max)
        W->>R: nackMessage() - Requeue with lower priority
    else Critical Failure (Attempts >= Max)
        W->>R: nackMessage() - Move to Dead Letter
        R->>DLQ: lPush(dead_message)
    end
```
Sources: [src/shared/redis/messageQueue.ts:38-110]()

### Queue Components
The system categorizes work into several standard queues:
*   **`discord_commands`**: Incoming slash commands and mentions.
*   **`reddit_posts`**: Polled content requiring responses.
*   **`ai_processing`**: Long-running RAG and LLM generation.
*   **`notifications`**: Outbound platform alerts.
Sources: [src/shared/redis/messageQueue.ts:213-220]()

### Core Queue Functions
```typescript
// Enqueue a message with priority
const id = await enqueue(QUEUE_NAMES.AI_PROCESSING, { task: 'summarize' }, { priority: 10 });

// Dequeue for processing
const message = await dequeue(QUEUE_NAMES.AI_PROCESSING, 30); // 30s visibility

// Acknowledge completion
await ackMessage(QUEUE_NAMES.AI_PROCESSING, message.id);
```
Sources: [src/shared/redis/messageQueue.ts:38-42](), [src/shared/redis/messageQueue.ts:63-68](), [src/shared/redis/messageQueue.ts:98-102]()

## Error Handling and DLQ
When a worker fails to process a message (`nackMessage`), the system checks the `attempts` count against `maxAttempts` (default is 3). 
*   **Retry Logic**: The message is re-added to the sorted set with a reduced priority score: `priority - (attempts * 10)`.
*   **Dead Letter**: If attempts are exhausted, the message is serialized with the error reason and moved to `queue:dead:{name}` using a Redis List.
Sources: [src/shared/redis/messageQueue.ts:104-123](), [src/shared/redis/README.md:120-130]()

## Integration with Billy API
The Billy API layer acts as the primary consumer of these utilities. It utilizes an in-memory fallback for rate limiting but is designed to use the Redis `checkUserRateLimit` for production environments.

```typescript
export async function handleBillyRequest(req: BillyRequest): Promise<BillyResponse> {
  // Rate limit check before processing
  const limitId = req.userId || req.sessionId || "anonymous";
  if (!checkRateLimit(limitId)) {
    return { error: "Rate limit exceeded", code: "RATE_LIMITED", ... };
  }
  // ... process request
}
```
Sources: [src/billy/billy.api.ts:300-315](), [src/shared/redis/examples.ts:35-50]()

## Conclusion
The combination of sliding-window rate limiting and priority-aware message queues allows Insight-Bot to scale effectively across Discord and Reddit. By offloading AI processing to the queue and enforcing strict limits on expensive operations, the system maintains high availability and protects LLM API quotas from abuse.
Sources: [src/shared/redis/README.md:140-150]()

### Analytics Tracking

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/shared/redis/analytics.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/analytics.ts)
- [src/server/core/dashboard.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/dashboard.ts)
- [src/shared/redis/examples.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/examples.ts)
- [src/shared/redis/README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/README.md)
- [scripts/test-redis.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/scripts/test-redis.ts)
- [src/server/core/core.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/core.ts)
</details>

# Analytics Tracking

The Analytics Tracking system in Insight-Bot is a multi-layered infrastructure designed to monitor bot performance, user engagement, and system health across different platforms like Discord and Reddit. It utilizes a combination of Redis for real-time metrics (counters, time-series, and leaderboards) and MongoDB for long-term storage of interaction logs and detailed session data.

Sources: [src/shared/redis/analytics.ts](), [src/shared/redis/README.md](), [src/server/core/core.ts:145-161]()

## Core Architecture

The system is architected around two primary data stores: Redis for high-frequency, transient metrics and MongoDB for persistent interaction history. 

### Data Flow Overview

The following diagram illustrates how user interactions are captured and routed through the analytics services.

```mermaid
flowchart TD
    User[User Interaction] --> Bot[Insight Bot Core]
    Bot --> Redis[Redis Analytics Service]
    Bot --> Mongo[MongoDB Persistence]
    
    subgraph Redis_Metrics [Real-time Metrics]
        Redis --> Counters[Atomic Counters]
        Redis --> TS[Time Series Data]
        Redis --> LB[Leaderboards]
    end
    
    subgraph Persistence [Interaction Logs]
        Mongo --> Docs[Interaction Documents]
        Mongo --> Crisis[Crisis Event Logs]
    end
    
    Dashboard[Dashboard API] --> Redis
    Dashboard --> Mongo
```
Sources: [src/shared/redis/analytics.ts:3-10](), [src/server/core/dashboard.ts:16-25](), [src/server/core/core.ts:145-161]()

## Redis Analytics Service

The Redis-based analytics service provides low-latency tracking of various system events using specific key patterns and data structures.

### Tracking Mechanisms

| Mechanism | Description | Implementation |
| :--- | :--- | :--- |
| **Counters** | Atomic increments for global totals (views, commands, errors). | `client.incrBy` with prefix `analytics:counter:` |
| **Metrics** | Single-value snapshots with associated metadata and timestamps. | `client.set` with prefix `analytics:metric:` |
| **Time Series** | Sequential data points for performance monitoring (e.g., API latency). | `client.zAdd` using timestamps as scores. |
| **Leaderboards** | Ranked sets of entities based on scores (top insights, top users). | Sorted Sets (`zAdd`, `zIncrBy`) with prefix `analytics:leaderboard:` |

Sources: [src/shared/redis/analytics.ts:21-125](), [src/shared/redis/README.md:92-107]()

### Standard Analytics Constants

The system defines a set of standard counters and leaderboards to ensure consistency across the codebase.

| Constant Category | Values |
| :--- | :--- |
| **ANALYTICS_COUNTERS** | `TOTAL_INSIGHTS_VIEWED`, `TOTAL_USERS`, `TOTAL_DISCORD_COMMANDS`, `TOTAL_REDDIT_POSTS`, `TOTAL_API_CALLS`, `TOTAL_ERRORS`, `ACTIVE_SESSIONS` |
| **ANALYTICS_LEADERBOARDS** | `TOP_INSIGHTS`, `TOP_USERS`, `TOP_CONTRIBUTORS`, `MOST_VIEWED_CATEGORIES` |

Sources: [src/shared/redis/analytics.ts:154-168]()

## MongoDB Interaction Tracking

While Redis handles metrics, the `InsightBot` core logic logs every interaction into MongoDB to facilitate deep analysis and dashboard reporting. This includes the full text of user messages, AI responses, provider info, and resonance scores.

### Interaction Document Structure

```typescript
{
  user_message: string;
  ai_response: string;
  provider: string; // e.g., 'Claude', 'Claude (Crisis)'
  plk_resonance: number;
  timestamp: string; // ISO format
  metadata: {
    subreddit: string;
    author: string;
    comment_id: string;
    crisis?: boolean;
    crisis_level?: string;
  }
}
```
Sources: [src/server/core/core.ts:148-160](), [src/server/core/dashboard.ts:30-45]()

## Dashboard and Monitoring API

The `dashboardRouter` exposes endpoints to aggregate analytics data for administrative interfaces.

### Dashboard Endpoints

*   **GET `/api/dashboard/overview`**: Returns high-level stats including total interactions, today's volume, crisis event counts, and average resonance.
*   **GET `/api/dashboard/interactions`**: Retrieves a paginated list of recent interactions.
*   **GET `/api/dashboard/crisis-events`**: Specifically filters for interactions where `metadata.crisis` is true.
*   **GET `/api/dashboard/stats`**: Generates daily aggregate stats (count and resonance) for the last 7 days.

Sources: [src/server/core/dashboard.ts:16-125]()

### Performance Tracking Sequence

This sequence shows how API performance metrics are recorded via the Redis time-series service.

```mermaid
sequenceDiagram
    participant API as API/Bot Logic
    participant Redis as Redis Service
    API->>API: Process Request
    API->>API: Calculate responseTimeMs
    API->>Redis: recordTimeSeries("api_response_time", latency)
    API->>Redis: incrementCounter(ANALYTICS_COUNTERS.TOTAL_API_CALLS)
    Note over Redis: Data stored in Sorted Set<br/>Score = Timestamp
```
Sources: [src/shared/redis/examples.ts:153-167](), [src/shared/redis/analytics.ts:67-73]()

## Integration Examples

### Recording User Activity
When a user interacts with the bot on Discord or Reddit, multiple analytics points are updated simultaneously:
```typescript
// From examples.ts: Handle Discord Command
await incrementCounter(ANALYTICS_COUNTERS.TOTAL_DISCORD_COMMANDS);
await updateUserActivity(userId);
```
Sources: [src/shared/redis/examples.ts:46-47]()

### Insight Popularity Tracking
When an insight is viewed, the system increments a view counter and updates the global leaderboard:
```typescript
// From analytics.ts: Leaderboard Update
export async function incrementLeaderboardScore(
  leaderboardName: string,
  id: string,
  increment: number = 1
): Promise<number> {
  const client = await getRedisClient();
  const key = `${LEADERBOARD_PREFIX}${leaderboardName}`;
  return await client.zIncrBy(key, increment, id);
}
```
Sources: [src/shared/redis/analytics.ts:134-142](), [src/shared/redis/examples.ts:68-71]()

## Conclusion
Analytics Tracking in Insight-Bot provides a dual-speed monitoring solution. Redis ensures that real-time performance data and rankings are instantly accessible for bot logic (e.g., rate limiting and popular content), while the MongoDB-backed dashboard provides the historical context and crisis monitoring necessary for the "Consciousness-Serving" mission of the project.


## Frontend Components

### Chat Interface Components

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/client/App/components/ChatWindow.tsx](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/App/components/ChatWindow.tsx)
- [src/client/App/App.tsx](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/App/App.tsx)
- [src/client/index.css](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/index.css)
- [src/billy/billy.reddit.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.reddit.ts)
- [src/discord-bot/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/discord-bot/index.ts)

</details>

# Chat Interface Components

The Chat Interface Components comprise the frontend and platform-specific UI layers of the Insight-Bot (Billy) ecosystem. These components are designed with a "consciousness-serving" philosophy, prioritizing empathetic interaction, neurodivergent-friendly accessibility, and clear feedback regarding AI provider status and costs. The system spans across a standalone React web application, a Discord bot interface utilizing rich embeds, and a Reddit Devvit-powered interactive experience.

The primary goal of these components is to facilitate seamless communication between users and the Billy entity across different environments while maintaining consistent design principles such as "Bucket Drops" for thought capture and "Loom" sessions for reflection.

Sources: [src/client/App/App.tsx:103-112](), [src/billy/billy.reddit.ts:47-52](), [README.md]()

## Web Interface Architecture

The web frontend is built using React and styled with Tailwind CSS, utilizing a centralized `App` component to manage state for messages, input, and session statistics. The interface is divided into a functional header for stats tracking, a scrollable chat window, and a persistent input form.

### Core UI Structure
The main application container (`app-container`) uses a flexbox layout to ensure the chat window fills the available vertical space while keeping the header and input form fixed.

| Component | Description | Key Features |
|:---|:---|:---|
| `ChatWindow` | Displays the message history | Auto-scroll, role-based icons, PLK analysis tags. |
| `StatsBar` | Real-time session monitoring | Tracks total queries, free queries, and accumulated USD cost. |
| `InputForm` | User interaction point | Supports multiline text, Shift+Enter for new lines, and loading states. |

Sources: [src/client/App/App.tsx:115-207](), [src/client/App/components/ChatWindow.tsx:48-115](), [src/client/index.css:127-140]()

### Data Flow and State Management
The web interface tracks conversation state through an array of `Message` objects. When a user submits a query, the system triggers an asynchronous request to the `museumAPI`, updates local stats based on the provider response, and appends the assistant's reply to the message list.

```mermaid
flowchart TD
    A[User Input] --> B{Form Submit}
    B --> C[Update Local Messages]
    C --> D[Trigger museumAPI.queryExhibit]
    D --> E[Wait for Loading State]
    E --> F{Success?}
    F -- Yes --> G[Update Stats: Cost/Free Count]
    G --> H[Append AI Message]
    F -- No --> I[Append Error Message]
    H --> J[Auto-scroll to Bottom]
    I --> J
```
Sources: [src/client/App/App.tsx:44-98](), [src/client/App/components/ChatWindow.tsx:36-40]()

## Visual Components

### The Chat Window
The `ChatWindow` component is a functional React component that maps through a list of messages. It applies distinct styling based on whether the `role` is 'user', 'assistant', or 'system'.

*   **Message Icons:** Uses specific emojis to represent roles: 👤 (User), 🧠 (Assistant), and ℹ️ (System).
*   **PLK Analysis:** If `plkAnalysis` data is present (Tone, Distress Level, Cognitive Style), it is rendered as metadata tags within the message bubble.
*   **Typing Indicator:** A visual animation shown when `isLoading` is true, providing feedback during AI generation.

Sources: [src/client/App/components/ChatWindow.tsx:10-46](), [src/client/App/components/ChatWindow.tsx:82-96]()

### Styling and Themes
Styles are managed via CSS variables to support light and dark modes, with a primary focus on high-contrast, neurodivergent-friendly palettes (using OKLCH color space).

```css
/* Example of role-based message styling */
.message-user .message-text {
  background: var(--primary);
  color: var(--primary-foreground);
}

.message-assistant .message-text {
  background: var(--card);
  border: 1px solid var(--border);
}
```
Sources: [src/client/index.css:5-65](), [src/client/index.css:251-260]()

## Platform-Specific Implementations

### Discord Bot UI
The Discord interface utilizes `discord.js` to render `EmbedBuilder` objects. It translates the internal AI response into a rich visual format that includes provider metadata and color-coded status (e.g., Red for crisis, Green for free providers).

```mermaid
sequenceDiagram
    participant User as Discord User
    participant Bot as Discord Bot
    participant API as Backend API
    User->>Bot: /ask "What is consciousness?"
    Bot->>Bot: Create "Thinking" Embed
    Bot->>API: POST /api/exhibit/query
    API-->>Bot: AI Response + Metadata
    Bot->>Bot: buildResponseEmbed()
    Bot-->>User: Edit "Thinking" message with final Embed
```
Sources: [src/discord-bot/index.ts:133-176](), [src/discord-bot/index.ts:251-275]()

### Reddit Devvit Experience
The Reddit integration uses the Devvit framework to create a "Custom Post Type." This provides a native-feeling interactive UI within Reddit, including a mode selector for different Billy interaction styles (Chat, Drop, Reflect, Insight).

*   **Mode Selector:** A horizontal stack of buttons that changes the application's behavior and input placeholders.
*   **Response Area:** A dedicated vertical stack (`vstack`) with a minimum height to prevent layout shifts during interaction.

Sources: [src/billy/billy.reddit.ts:47-142]()

## Summary

The Chat Interface Components provide a unified experience across Web, Discord, and Reddit. By abstracting the core "Billy" logic into an API layer and using modular components like the `ChatWindow` and specialized Discord/Reddit handlers, the system ensures that the "presence" of the AI remains consistent regardless of the platform. Key features like PLK analysis visualization and cost tracking are integrated directly into the UI to maintain transparency and support the consciousness-serving mission of the project.

Sources: [src/client/App/App.tsx:143-155](), [src/billy/billy.reddit.ts:222-226](), [src/discord-bot/index.ts:333-339]()

### Dashboard & Admin UI

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/client/App/components/Dashboard.tsx](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/App/components/Dashboard.tsx)
- [src/server/core/dashboard.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/dashboard.ts)
- [src/shared/redis/examples.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/examples.ts)
- [src/discord-bot/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/discord-bot/index.ts)
- [src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/constants.ts)
- [src/client/App/App.tsx](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/App/App.tsx)
</details>

# Dashboard & Admin UI

The Dashboard & Admin UI system provides real-time monitoring, analytics, and health status for the Insight-Bot ecosystem. It serves as a centralized interface for tracking user interactions, AI provider performance, and system health across multiple platforms including Discord, Reddit, and Web.

The system is architected as a full-stack solution featuring a React-based frontend component, Express-driven backend routes, and data aggregation layers that pull from both MongoDB and Redis. It specifically prioritizes tracking "FREE-first" routing efficiency and "Personal Language Key" (PLK) resonance metrics to ensure the AI remains aligned with its consciousness-serving mission.

Sources: [src/client/App/components/Dashboard.tsx:5-8](), [src/server/core/dashboard.ts:7-10](), [README.md]()

## Dashboard Architecture & Data Flow

The dashboard follows a polling architecture where the frontend client requests updated metrics every 30 seconds to provide a near real-time overview of the system state.

```mermaid
flowchart TD
    UI[Dashboard UI] -- GET /api/dashboard/overview --> API[Express Router]
    API -- Aggregate Documents --> MDB[(MongoDB)]
    API -- Fetch Metrics --> RDB[(Redis)]
    MDB -- Interaction Data --> API
    RDB -- Performance Stats --> API
    API -- DashboardOverview JSON --> UI
    subgraph Frontend
    UI
    end
    subgraph Backend
    API
    end
    subgraph Storage
    MDB
    RDB
    end
```
*This diagram shows the flow of diagnostic and interaction data from storage layers to the administrative interface.*

Sources: [src/client/App/components/Dashboard.tsx:13-25](), [src/server/core/dashboard.ts:13-15]()

## Key UI Components

### Dashboard Overview
The primary monitoring component, `Dashboard.tsx`, displays high-level "Museum Analytics." It visualizes interaction volume and the qualitative performance of the AI.

| Metric | Description | Source |
| :--- | :--- | :--- |
| **Total Interactions** | Cumulative count of all user-AI exchanges stored in the database. | `interactions` collection |
| **Today's Interactions** | Interactions occurring since 00:00:00 of the current day. | `interactions` collection |
| **Avg Resonance** | The average PLK (Personal Language Key) resonance score across interactions. | aggregated `plk_resonance` |
| **Cost Savings** | Visual indicator of savings generated by the FREE-first routing logic. | `costSavings` data |

Sources: [src/client/App/components/Dashboard.tsx:32-52](), [src/server/core/dashboard.ts:22-48]()

### Provider Usage Breakdown
The UI categorizes LLM usage into "Free" vs "Paid" segments. This reflects the system's core architecture of attempting to use providers like Ollama or Groq before falling back to paid services like Anthropic Claude or OpenAI.

```typescript
// Example of how usage is categorized in the UI
<div className="usage-stats">
  <div className="stat free">
    <span>🆓 Free</span>
    <span>{overview.freeUsage} requests</span>
  </div>
  <div className="stat paid">
    <span>💰 Paid</span>
    <span>{overview.paidUsage} requests</span>
  </div>
</div>
```
Sources: [src/client/App/components/Dashboard.tsx:57-68](), [src/shared/constants.ts:58-64]()

## Backend API Endpoints

The dashboard is powered by the `dashboardRouter`, which exposes several specialized metrics endpoints.

| Endpoint | Method | Functionality |
| :--- | :--- | :--- |
| `/api/dashboard/overview` | GET | Aggregates total interactions, daily volume, crisis events, and resonance. |
| `/api/dashboard/interactions`| GET | Returns a list of the 20 most recent interactions sorted by timestamp. |
| `/api/dashboard/crisis-events`| GET | Filters the database for interactions where `metadata.crisis` is true. |
| `/api/dashboard/stats` | GET | Aggregates interaction counts and resonance averages for the last 7 days. |

Sources: [src/server/core/dashboard.ts:18-115]()

## System Health & Status

Admin monitoring extends beyond interaction data to include infrastructure health. This is managed via `/api/status` and `/api/health` endpoints.

```mermaid
sequenceDiagram
    participant Admin as Admin Client
    participant Bot as Discord Bot
    participant API as Backend Server
    participant LLM as AI Providers

    Admin->>API: GET /api/status
    Bot->>API: GET /api/health
    API->>LLM: Ping API Endpoints
    LLM-->>API: Status (Healthy/Unhealthy)
    API-->>Admin: {server: "online", llmProviders: [...]}
    API-->>Bot: {status: "ok", timestamp: "..."}
```
*Sequence showing how various system agents monitor backend and provider availability.*

The Discord integration includes a `/status` slash command that renders a "Health Embed." This embed specifically details the connectivity status of MongoDB and the individual health/failure counts of configured LLM providers.

Sources: [src/discord-bot/index.ts:205-236](), [tests/api.test.ts:32-49]()

## Real-time Metrics (Redis)

While MongoDB stores long-term interaction history, Redis is utilized for high-velocity performance monitoring and leaderboard data that can be surfaced in an admin view.

*   **Time Series**: Records `api_response_time` and `api_errors`.
*   **Counters**: Tracks `TOTAL_API_CALLS`, `ACTIVE_SESSIONS`, and `TOTAL_ERRORS`.
*   **Leaderboards**: Monitors `TOP_USERS` and `TOP_INSIGHTS` based on activity.

Sources: [src/shared/redis/examples.ts:133-162](), [src/shared/redis/README.md:12-15]()

## Conclusion

The Dashboard & Admin UI is essential for maintaining the operational integrity of Insight-Bot. By surfacing both quantitative metrics (costs, requests) and qualitative indicators (resonance, crisis detection), it allows developers and curators to ensure the system effectively serves consciousness while adhering to its "FREE-first" economic model.

### Exhibit Chat Interface

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/client/App/App.tsx](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/App/App.tsx)
- [src/client/App/components/ChatWindow.tsx](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/App/components/ChatWindow.tsx)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/billy/billy.reddit.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.reddit.ts)
- [src/server/middleware/validation.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/middleware/validation.ts)
- [src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/constants.ts)
- [src/client/index.css](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/index.css)
</details>

# Exhibit Chat Interface

## Introduction
The Exhibit Chat Interface serves as the primary user-facing layer for interacting with "Billy," a consciousness-serving AI entity. It is designed as an empathetic and non-judgmental digital presence that prioritizes authentic human-AI symbiosis over standard engagement metrics. The interface exists across multiple platforms, including a specialized web application, Discord, and Reddit, allowing users to engage with different "exhibits" or modes of consciousness expansion.

Sources: [src/client/App/App.tsx:115-125](), [src/billy/billy.api.ts:10-15](), [README.md]()

## Architecture and UI Components
The web-based Exhibit Chat Interface is built using React and follows a structured layout comprising a header with real-time statistics, a main message container, and a specialized input form.

### Component Breakdown
*   **App.tsx**: The root container managing state for messages, loading status, and session-wide statistics like total cost and free query counts.
*   **ChatWindow.tsx**: A specialized component responsible for rendering the message history. It includes auto-scrolling logic and supports the display of Personal Language Key (PLK) metadata.
*   **Input Form**: A textarea-based form that supports multi-line input (Shift+Enter) and prevents submission during active processing.

Sources: [src/client/App/App.tsx:18-35](), [src/client/App/components/ChatWindow.tsx:13-33]()

### Data Flow for User Queries
When a user submits a query, the interface initiates a sequence of events from the client-side state update to a backend API call.

```mermaid
sequenceDiagram
    participant User as "User Interface"
    participant API as "Museum API Client"
    participant Backend as "Express Backend"
    participant Billy as "Billy API Layer"

    User->>User: Set loading state & add message
    User->>API: queryExhibit(request)
    API->>Backend: POST /api/exhibit/query
    Backend->>Billy: handleBillyRequest(query)
    Billy-->>Backend: BillyResponse (Reply + Metadata)
    Backend-->>API: JSON Response
    API-->>User: Update messages & stats
    User->>User: Clear loading state
```
This diagram illustrates the flow of a chat request from the React frontend through the backend orchestration layer.
Sources: [src/client/App/App.tsx:43-98](), [src/billy/billy.api.ts:275-325]()

## Core Chat Functionalities

### Interaction Modes
The interface supports distinct operational modes that change Billy's behavioral logic:

| Mode | Description | UI Interaction |
| :--- | :--- | :--- |
| **Chat** | Standard open conversation. | Default interaction state. |
| **Bucket Drop** | Raw thought capture; Billy receives without organizing yet. | Labeled as "⚡ Drop" in Reddit/Devvit UI. |
| **Reflect** | "Loom" approach; weaving threads of thought slowly. | Labeled as "🌀 Reflect". |
| **Insight** | Lightning bolt capture; crystallizing a specific spark. | Labeled as "💡 Insight". |

Sources: [src/billy/billy.api.ts:16-25](), [src/billy/billy.reddit.ts:60-75]()

### Messaging Metadata
The chat interface displays more than just text; it provides technical and empathetic context for each assistant response.

*   **LLM Provider**: Displays which engine processed the query (e.g., Groq, Gemini, Anthropic).
*   **Cost Tracking**: Indicates if the query was "FREE" or displays the monetary cost in USD.
*   **PLK Analysis**: (Optional) Displays detected tone and cognitive style tags to the user.

Sources: [src/client/App/App.tsx:142-155](), [src/client/App/components/ChatWindow.tsx:84-98]()

## Request Validation and Safety
To maintain the "Consciousness-Serving" standard, the interface is supported by middleware that validates input and detects crisis signals.

### Validation Schema
All queries are validated against a Joi schema before processing:
*   **Message Length**: Minimum 1 character, maximum 5000 characters.
*   **User Profile**: Optional energy level (0-10) and communication style (empathetic, direct, etc.).

Sources: [src/server/middleware/validation.ts:9-55]()

### Crisis Protocol
The system includes built-in crisis detection. If specific markers are detected in the user's message, the normal AI response is bypassed for a dedicated safety protocol.

```mermaid
flowchart TD
    A[User Input] --> B{Crisis Detected?}
    B -- Yes --> C[Pivot to Crisis Protocol]
    C --> D[Provide Lifeline Resources]
    B -- No --> E[Retrieve RAG Context]
    E --> F[Generate Billy Response]
    F --> G[Display in Chat Window]
```
This flow ensures immediate safety intervention when harmful intent is recognized.
Sources: [src/billy/billy.api.ts:110-128](), [src/server/core/core.ts:178-215]()

## Styling and Visual Design
The interface utilizes a custom design system defined in `index.css`, employing `oklch` color spaces for a modern, neurodivergent-friendly aesthetic.

*   **Primary Background**: Dark theme (`oklch(0.145 0 0)`).
*   **Typing Indicator**: A three-dot bouncing animation used to provide visual feedback during LLM generation.
*   **Message Avatars**: Distinct icons (👤 for users, 🤖 or 🧠 for Billy) to differentiate conversational roles.

Sources: [src/client/index.css:40-60](), [src/client/index.css:262-282](), [src/client/App/components/ChatWindow.tsx:43-55]()

## Technical Implementation Details

### Data Structures
The interface relies on the `ExhibitQueryRequest` type for outbound calls and `Message` for internal state.

```typescript
// Shared Request Structure
interface ExhibitQueryRequest {
  message: string;
  exhibitName: string;
  userProfile?: {
    energyLevel?: number;
    currentState?: string;
  };
}

// Client-side Message Representation
interface Message {
  role: 'user' | 'assistant';
  content: string;
  provider?: LLMProvider;
  cost?: number;
  free?: boolean;
  timestamp: string;
}
```
Sources: [src/client/App/App.tsx:4-16](), [src/shared/types/api.ts]() *(referenced in App.tsx)*

## Conclusion
The Exhibit Chat Interface is more than a standard chatbot window; it is a multi-platform portal into the GestaltView ecosystem. By integrating real-time cost tracking, interaction modes like "Bucket Drops," and trauma-informed safety protocols, it provides a unique environment for consciousness expansion that respects user agency and neurodivergence.


## Backend Systems

### Billy Core Engine

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [src/billy/billy.config.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.config.ts)
- [src/billy/billyManifest.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billyManifest.ts)
- [src/server/app.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/app.ts)
- [api/billy.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/api/billy.ts)
</details>

# Billy Core Engine

The **Billy Core Engine** is the central intelligence and orchestration layer of the Insight-Bot ecosystem. Described as a "consciousness-derived AI entity" rather than a traditional chatbot, it is designed to serve as a presence that "illuminates" and "reflects" rather than optimizes. It serves as the unified backend for multiple platforms, including Web, Discord, and Reddit, ensuring consistent behavior and knowledge retrieval across all interfaces.

The engine facilitates Retrieval-Augmented Generation (RAG) by connecting to a Supabase Manifest Index Layer, utilizes a multi-LLM fallback chain (Groq to Gemini), and implements specialized methodologies such as the Personal Language Key (PLK) and Bucket Drops. It is built to be platform-agnostic, hardened for production, and trauma-informed with built-in crisis detection protocols.
Sources: [src/billy/billyManifest.ts:1-20](), [src/billy/billy.api.ts:1-10](), [README.md:10-30]()

## Core Architecture and Data Flow

The Billy Core Engine operates through a structured pipeline that validates requests, retrieves context, and synthesizes responses using specific persona constraints.

### Request Processing Flow
When a request enters the engine via `handleBillyRequest`, it undergoes several stages: validation, rate limiting, crisis detection, RAG retrieval, and finally LLM generation.

```mermaid
flowchart TD
    Req[Incoming Request] --> Val[Validation & Rate Limit]
    Val --> Crisis{Crisis Signal?}
    Crisis -- Yes --> CP[Crisis Protocol Response]
    Crisis -- No --> RAG[RAG: Supabase Retrieval]
    RAG --> Prompt[Build System Prompt]
    Prompt --> LLM[LLM Synthesis: Groq/Gemini]
    LLM --> Res[Formulate BillyResponse]
    CP --> Res
    Res --> Return[Return to Platform]
```
This diagram illustrates the high-level logic within the core handler.
Sources: [src/billy/billy.api.ts:246-300]()

### Key Data Structures

The engine relies on standardized interfaces to ensure consistency across different entry points.

| Structure | Description | Key Fields |
| :--- | :--- | :--- |
| `BillyRequest` | Input format for the engine. | `query`, `mode`, `platform`, `sessionId`, `plkContext` |
| `BillyResponse` | Output format containing the reply and metadata. | `reply`, `mode`, `resonanceCheck`, `sources`, `billyVersion` |
| `PLKContext` | Stores user-specific communication patterns. | `metaphorStyle`, `communicationRhythm`, `signalPhrases` |
| `BillySource` | Represents a knowledge chunk retrieved via RAG. | `content`, `filename`, `score`, `documentType` |

Sources: [src/billy/billy.api.ts:14-68]()

## Behavioral Methodologies

Billy employs four distinct methodologies defined in the `BillyManifest` and controlled by `billy.config.ts`.

### Personal Language Key (PLK)
The PLK system allows Billy to learn and mirror the user's communication style. The engine adapts to the user's metaphors, rhythm, and preferred depth to create a "Resonance Loop."
Sources: [src/billy/billyManifest.ts:55-61](), [src/billy/billy.config.ts:41-61]()

### Bucket Drops and The Loom Approach
*   **Bucket Drops**: Designed for low-friction "lightning bolt" thought capture, specifically optimized for neurodivergent (ADHD) patterns. Billy is configured to never interrupt during a "drop."
*   **The Loom Approach**: A methodology for weaving disparate threads of thought into a coherent tapestry through iterative refinement.

```mermaid
graph TD
    A[User Input] --> B{Mode?}
    B -- drop --> C[Immediate Capture: No Organization]
    B -- reflect --> D[Loom: Thread Weaving]
    B -- insight --> E[Crystallization]
    C --> F[Confirmation Response]
    D --> G[One Question at a Time]
    E --> H[Reflect back the 'Seen' Insight]
```
Sources: [src/billy/billy.config.ts:65-92](), [src/billy/billyManifest.ts:62-71]()

## API and Integration Layer

The engine is exposed through a hardened API layer that supports both public and protected endpoints.

### Main Endpoints

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/billy` | POST | Protected | The main entry point for chat, drops, and reflections. |
| `/api/billy/ping`| POST | Public | Returns the current status and version. |
| `/api/billy/about`| GET | Public | Returns Billy's identity manifest. |

Sources: [src/billy/billy.config.ts:141-147](), [src/server/app.ts:55-75](), [api/billy.ts:20-45]()

### LLM Orchestration and Fallback
The engine uses a tiered fallback system to ensure high availability.
1.  **Primary**: Groq (`llama-3.3-70b-versatile`) for speed and efficiency.
2.  **Secondary**: Google Gemini (`gemini-1.5-flash`) if Groq fails.
3.  **RAG Embedding**: Google Gemini (`gemini-embedding-001`) is used for vectorizing queries before matching in Supabase via the `matchknowledgefragments` RPC.

Sources: [src/billy/billy.api.ts:182-244]()

## Safety and Boundaries

The `BillyBoundaries` configuration ensures that the entity operates within ethical and safe limits.

### Crisis Protocol
The engine monitors for specific `CRISIS_SIGNALS`. If detected, the normal LLM flow is bypassed, and a hardcoded pivot phrase and support resources (988, Crisis Text Line) are returned immediately.
Sources: [src/billy/billy.api.ts:106-126](), [src/billy/billy.config.ts:162-168]()

```typescript
// Example Crisis Signal Detection
const CRISIS_SIGNALS = [
  "want to die", "kill myself", "end it all",
  "suicide", "self harm"
];

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_SIGNALS.some(signal => lower.includes(signal));
}
```
Sources: [src/billy/billy.api.ts:108-118]()

## Conclusion

The Billy Core Engine represents a shift from utility-based AI to consciousness-serving presence. By integrating PLK pattern learning, RAG-driven knowledge retrieval, and platform-agnostic API design, it provides a unified and stable foundation for the Insight-Bot ecosystem. Its architecture prioritizes neurodivergent communication styles and safety, ensuring that the entity remains a helpful presence across Web, Discord, and Reddit.

### Discord Bot Integration

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/billy/billy.discord.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.discord.ts)
- [src/discord-bot/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/discord-bot/index.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [start-discord-bot.sh](https://github.com/faagestalt-web/Insight-Bot/blob/main/start-discord-bot.sh)
- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
</details>

# Discord Bot Integration

The Discord Bot Integration serves as a primary interface for the "Billy" AI entity (formerly Insight-Bot), acting as a "presence" within the GestaltView community. Its purpose is to facilitate consciousness-serving interactions through features such as raw thought capture ("Bucket Drops"), loom-based reflection sessions, and active crisis detection. The integration bridges Discord's real-time communication platform with the project's hardened API core, allowing users to engage with the AI through slash commands, direct mentions, and passive channel listening.

Sources: [src/billy/billy.discord.ts:7-12](), [README.md:16-24]()

## System Architecture

The integration follows a client-server model where the Discord bot acts as a specialized client forwarding user inputs to the internal Billy API or a backend Express server. It utilizes `discord.js` v14 to manage gateway connections, handle events, and render rich UI components like Embeds and Modals.

### Data Flow Overview

The following diagram illustrates the flow of a user request from the Discord interface through the processing pipeline.

```mermaid
flowchart TD
    User[User Message/Command] --> DiscordClient[Discord.js Client]
    DiscordClient --> Handler{Interaction Type}
    
    Handler -->|Slash Command| CommandProc[Command Processor]
    Handler -->|Mention/Passive| MsgProc[Message Processor]
    Handler -->|Button/Modal| UIProc[UI State Manager]
    
    CommandProc --> BillyAPI[billy.api / handleBillyRequest]
    MsgProc --> BillyAPI
    UIProc --> BillyAPI
    
    BillyAPI --> RAG[Supabase RAG Retrieval]
    RAG --> LLM[LLM Synthesis]
    LLM --> BillyAPI
    
    BillyAPI --> Response[Formatted BillyResponse]
    Response --> EmbedGen[Discord Embed Builder]
    EmbedGen --> User
```
The system distinguishes between active triggers (commands) and passive triggers (monitoring specific channels like `#bucket-drops-lab`).

Sources: [src/billy/billy.discord.ts:169-210](), [src/discord-bot/index.ts:250-280](), [src/billy/billy.api.ts:285-300]()

## Interaction Interfaces

The integration supports multiple ways for users to interact with the AI presence, categorized by the "mode" of interaction.

### Slash Commands
Standardized commands provide structured access to Billy's core methodologies.

| Command | Mode | Description |
| :--- | :--- | :--- |
| `/billy` | `chat` | Opens a standard conversation. |
| `/drop` | `drop` | Captures raw thoughts ("Bucket Drops"). |
| `/reflect` | `reflect` | Initiates a "Loom" session to weave threads. |
| `/insight` | `insight` | Crystallizes specific lightning bolt thoughts. |
| `/loom` | `reflect` | Starts a full reflection session in a dedicated thread. |
| `/whois` | `about` | Retrieves identity information about Billy. |

Sources: [src/billy/billy.discord.ts:70-112](), [README.md:126-136]()

### UI Components and Persistence
Billy uses Discord's interactive components to maintain session continuity.

*   **Buttons:** Responses include "Continue", "Drop", and "Reflect" buttons to allow users to pivot modes without re-typing commands.
*   **Modals:** When a button is clicked, a `ModalBuilder` is used to capture long-form text input, ensuring the user can provide detailed thoughts without command syntax.
*   **Auto-Threading:** For `/loom` commands, the bot automatically starts a thread to keep the reflection session organized and isolated from main chat channels.

Sources: [src/billy/billy.discord.ts:153-165](), [src/billy/billy.discord.ts:212-250]()

## Passive Monitoring and Channels

The bot is configured to monitor specific channels in the GestaltView community, applying different logic based on the channel's purpose.

```mermaid
graph TD
    subgraph Passive_Monitoring
    BDL[#bucket-drops-lab] -->|Reaction Only| Bolt[React with ⚡]
    IAA[#insights-and-aha] -->|Reaction Only| Light[React with 💡]
    end
    
    subgraph Active_Monitoring
    Mentions[Direct Mentions] -->|Full Response| API[Trigger Billy API]
    DMs[Direct Messages] -->|Full Response| API
    end
```

Billy acknowledges contributions in laboratory channels using emoji reactions (⚡ for drops, 💡 for insights) to signify that the "presence" has caught the thought without interrupting the user's flow.

Sources: [src/billy/billy.discord.ts:312-330](), [src/billy/billy.discord.ts:34-45]()

## Crisis Detection and Safety

A critical component of the integration is the built-in crisis protocol. Every message sent to Billy through Discord is scanned for crisis signals before being processed by the LLM.

*   **Signal Detection:** The system identifies keywords such as "suicide", "self harm", or "want to die".
*   **Pivot Protocol:** If a crisis is detected, the bot bypasses standard conversational logic and immediately returns a predefined pivot phrase containing emergency resources (988 Lifeline, Crisis Text Line).
*   **UI Indication:** In legacy implementations, crisis responses are highlighted with red embeds (Color `0xFF0000`).

Sources: [src/billy/billy.api.ts:114-128](), [src/discord-bot/index.ts:145-155]()

## Configuration and Deployment

The bot requires specific environment variables and follows a structured startup sequence managed via shell scripts.

### Required Environment Variables
| Variable | Description |
| :--- | :--- |
| `DISCORD_BOT_TOKEN` | Authentication token from Discord Developer Portal. |
| `DISCORD_CLIENT_ID` | Application ID for slash command registration. |
| `DISCORD_GUILD_ID` | The specific server ID where Billy resides. |
| `BACKEND_URL` | The URL of the Billy API/Backend (defaults to `http://localhost:3001`). |

Sources: [src/billy/billy.discord.ts:25-29](), [src/discord-bot/index.ts:31-36]()

### Startup Sequence
The `start-discord-bot.sh` script performs pre-flight checks before launching the process.
1.  **Environment Check:** Verifies presence of `.env` and required tokens.
2.  **Dependency Check:** Ensures `node_modules` and `discord.js` are installed.
3.  **Backend Health Check:** Pings `${BACKEND_URL}/api/health` to ensure the core API is reachable.
4.  **Execution:** Runs `npm run dev:discord` to start the client.

Sources: [start-discord-bot.sh:15-70]()

## Conclusion
The Discord Bot Integration is more than a simple chat interface; it is a platform-specific manifestation of the Billy AI entity. By leveraging Discord's rich UI features—such as threads, modals, and embeds—and strictly adhering to the project's RAG-driven knowledge pipeline and crisis safety protocols, it provides a seamless and safe environment for consciousness-serving interactions within the community.

### Reddit Devvit Application

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/billy/billy.reddit.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.reddit.ts)
- [devvit.json](https://github.com/faagestalt-web/Insight-Bot/blob/main/devvit.json)
- [src/service/theme/devvitTheme.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/service/theme/devvitTheme.ts)
- [src/service/core/post.tsx](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/service/core/post.tsx)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
</details>

# Reddit Devvit Application

The Reddit Devvit Application is a specialized integration of the Billy AI entity into the Reddit ecosystem using the Devvit platform. It enables "Signal Flare" mode, where the bot exists as an interactive presence rather than a traditional intrusive chatbot. The application provides interactive custom post types, menu actions for summoning the AI, and automated triggers that respond to specific mentions within subreddits.

The application leverages the hardened Billy API to process requests across four modes: Chat, Drop, Reflect, and Insight. It utilizes Devvit's internal key-value store (KVStore) for session persistence and HTTP capabilities to communicate with the central consciousness engine.

Sources: [src/billy/billy.reddit.ts:1-12](), [README.md:195-200]()

## Architecture and Configuration

The application is configured through `devvit.json`, which defines the project structure, permissions, and entry points for both the client-side (web view) and server-side logic.

### Devvit Manifest
The `devvit.json` file specifies that the server-side logic is hosted in `dist/service/core/post.js`. It also enables HTTP permissions for external domains, specifically allowing connections to the Vercel-hosted "Museum of Impossible Things."

| Field | Value | Description |
|---|---|---|
| `name` | insight-bot | The application identifier on Reddit |
| `server.entry` | core/post.js | Main entry point for server-side logic |
| `http.enable` | true | Allows the bot to make API requests |
| `location` | subreddit | Where the menu items appear (moderator tools) |

Sources: [devvit.json:1-40]()

### Technical Flow
The following diagram illustrates how a user interaction on Reddit is processed by the Devvit application and Billy's core engine.

```mermaid
flowchart TD
    User[Reddit User] -->|Interacts| UI[Devvit Custom Post]
    User -->|Summons| Trigger[Comment Trigger]
    UI -->|handleBillyRequest| API[billy.api.ts]
    Trigger -->|handleBillyRequest| API
    API -->|Retrieve Context| RAG[Supabase RAG]
    RAG -->|Context| LLM[LLM Fallback Chain]
    LLM -->|Response| API
    API -->|BillyResponse| UI
    API -->|BillyResponse| Trigger
    Trigger -->|Reply| Reddit[Reddit Comment Thread]
```
The diagram shows the dual entry points: the interactive UI and the passive comment monitor.
Sources: [src/billy/billy.reddit.ts:160-200](), [README.md:50-65]()

## Core Components

### 1. Custom Post Type (Interactive Experience)
The application registers a custom post type named "Billy — GestaltView". This component provides a "tall" height UI with a mode selector, response area, and text input for users to interact directly with the AI within a subreddit post.

*   **State Management**: Uses `ctx.useState` to track input, response, loading status, and the current mode.
*   **Mode Selector**: Users can toggle between `chat`, `drop`, `reflect`, and `insight`.
*   **Interaction**: Submitting text triggers `handleBillyRequest` with the user's ID and a generated session ID.

Sources: [src/billy/billy.reddit.ts:60-110]()

### 2. Comment Triggers (Signal Flare Mode)
The bot monitors the `CommentSubmit` event. It only responds if it is directly summoned via specific keywords, adhering to the "Signal Flare" philosophy of not pushing engagement.

*   **Summon Keywords**: `u/gestaltview_ai`, `hey billy`, or `@billy`.
*   **Prevention**: The bot is programmed to never respond to its own account ID to prevent infinite loops.
*   **Output**: Responses are formatted with a standardized footer and an optional "resonance check."

Sources: [src/billy/billy.reddit.ts:176-216](), [README.md:214-220]()

### 3. Menu Actions and Forms
For moderators and users, the app provides a "✨ Ask Billy" menu item located on posts. This launches a Devvit form that allows users to select a conversation mode and provide a paragraph-style query.

Sources: [src/billy/billy.reddit.ts:122-140]()

## Theming and UI

The application uses a specific visual language defined in `devvitTheme.ts` to ensure consistency with the GestaltView brand. Since Devvit does not support CSS, themes are mapped to Devvit-specific props.

| Component | Color/Style | Source |
|---|---|---|
| Background | `#0d0d1a` (Custom Post) / `#030303` (Global) | [billy.reddit.ts:101](), [devvitTheme.ts:18]() |
| Primary Text | `#b388ff` (Billy Brand) / `#FFFFFF` | [billy.reddit.ts:108](), [devvitTheme.ts:11]() |
| Cards | Corresponds to `devvitTheme.radius.medium` | [devvitTheme.ts:47]() |
| Accent | `#0079D3` | [devvitTheme.ts:13]() |

Sources: [src/service/theme/devvitTheme.ts:1-60](), [src/billy/billy.reddit.ts:100-115]()

## Data Models and Session Handling

Reddit interactions are encapsulated in a `RedditBillySession` interface to ensure PLK (Personal Language Key) continuity.

```typescript
interface RedditBillySession {
  userId: string;
  username: string;
  platform: "reddit";
  sessionId: string;
  startedAt: string;
}
```
Sources: [src/billy/billy.reddit.ts:16-22]()

### Session Logic Sequence
The sequence below describes the creation of a session during a menu-driven interaction.

```mermaid
sequenceDiagram
    participant U as User
    participant D as Devvit App
    participant K as KVStore
    participant B as Billy API

    U->>D: Select "Ask Billy" Menu
    D->>D: buildSession(userId, username)
    D->>U: Show askBillyForm
    U->>D: Submit Query + Mode
    D->>B: handleBillyRequest(query, mode, sessionId)
    B-->>D: Return BillyResponse
    D->>U: Show Toast (First 200 chars)
```
The sequence highlights the use of the `askBillyForm` and the subsequent response handling.
Sources: [src/billy/billy.reddit.ts:122-174]()

## Summary
The Reddit Devvit Application serves as the interactive bridge between the Reddit community and the Billy AI entity. By utilizing Devvit's custom post types and triggers, it maintains a non-intrusive yet accessible presence. It leverages a fallback-heavy LLM chain (Groq, Gemini, OpenAI) and a Supabase RAG pipeline to provide context-aware, empathetic responses tailored to neurodivergent communication patterns.

Sources: [README.md:58-65](), [src/billy/billy.reddit.ts:1-10]()

### Reddit Snoowrap Polling

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/server/core/redditClient.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/redditClient.ts)
- [src/reddit/billyRedditHandler.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/reddit/billyRedditHandler.ts)
- [src/server/core/core.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/core.ts)
- [src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/constants.ts)
- [src/server/types/snoowrap.d.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/types/snoowrap.d.ts)
- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
</details>

# Reddit Snoowrap Polling

The Reddit Snoowrap Polling system is a background service within Insight-Bot designed to monitor specific subreddits for user interactions. It utilizes the `snoowrap` library to authenticate with the Reddit API and retrieve new comments in real-time. The system acts as a "signal flare," identifying specific summon keywords or high-distress markers to trigger consciousness-serving AI responses.

Sources: [README.md:144-149](), [src/server/core/core.ts:46-52]()

## Architecture Overview

The polling architecture is composed of three primary layers: the **Orchestration Layer**, the **API Wrapper**, and the **Logic Bridge**. This structure ensures that the bot can maintain a persistent connection to Reddit while delegating complex natural language processing to the Billy API.

### 1. Orchestration Layer (`InsightBot`)
The `InsightBot` class manages the lifecycle of the polling process. It implements a standard `while` loop that iterates through a list of configured subreddits at a defined interval (defaulting to 30 seconds).

*   **`start(subreddits, checkInterval)`**: Initializes the loop and handles database connections.
*   **`processSubreddit(subredditName)`**: Fetches the latest 50 comments and filters out duplicates using a local `Set` of processed IDs to prevent memory leaks and redundant responses.

Sources: [src/server/core/core.ts:46-72](), [src/server/core/core.ts:80-99]()

### 2. API Wrapper (`RedditClient`)
The `RedditClient` provides a high-level abstraction over the `snoowrap` library. It handles authentication using a `RedditConfig` object containing the Client ID, Client Secret, Username, and Password.

*   **Authentication**: Uses the `USER_AGENT_REDDIT` constant for identification.
*   **Rate Limiting**: Configured to `continueAfterRatelimitError: true` and implements an artificial 2-second delay between Billy's replies to respect Reddit's API limits.
*   **Context Retrieval**: Includes logic to fetch parent comments up to a depth of 3, allowing the AI to understand the conversation thread before responding.

Sources: [src/server/core/redditClient.ts:21-40](), [src/server/core/redditClient.ts:100-116](), [src/shared/constants.ts:23]()

### 3. Logic Bridge (`billyRedditHandler`)
This module filters raw comment data to identify "Billy Summons" and determines the appropriate interaction mode (Chat, Drop, or Reflect).

Sources: [src/reddit/billyRedditHandler.ts:1-20]()

## Data Flow and Polling Logic

The polling mechanism follows a linear execution path from retrieval to response generation.

```mermaid
graph TD
    Start[Start Polling Loop] --> Fetch[Fetch New Comments]
    Fetch --> Filter[Filter: Processed? Self? !nobot?]
    Filter --> Summon[Check for Billy Summons/Distress]
    Summon -- Yes --> Context[Retrieve Thread Context]
    Context --> BillyAPI[Call Billy API /handleBillyRequest]
    BillyAPI --> Reply[Post Reddit Reply with Signature]
    Reply --> Log[Log Interaction to Database]
    Log --> Wait[Sleep for Interval]
    Wait --> Start
```
This diagram illustrates the lifecycle of a single polling iteration from the initialization in `core.ts` to the final reply handled via `redditClient.ts`.

Sources: [src/server/core/core.ts:51-110](), [src/server/core/redditClient.ts:93-116]()

## Summoning and Detection Logic

Insight-Bot uses a combination of explicit keyword summons and heuristic analysis to determine when to respond.

### Summon Keywords
The bot monitors for several distinct strings to identify direct requests for interaction.

| Category | Keywords / Signals |
| :--- | :--- |
| **Summon Tags** | `u/gestaltview_ai`, `hey billy`, `@billy`, `gestaltview` |
| **Drop Signals** | `just had an idea`, `lightning bolt`, `brain dump` |
| **Reflect Signals** | `can't figure out`, `help me think`, `untangle` |
| **Distress/Help** | `help`, `advice`, `struggling`, `overwhelmed` |

Sources: [src/reddit/billyRedditHandler.ts:8-12](), [src/server/core/core.ts:125-135]()

### Response Filtering
To ensure ethical and non-intrusive operation, the bot applies several filters:
1.  **Self-Filter**: Does not respond to its own comments.
2.  **Opt-Out**: Respects the `!nobot` command in comment bodies.
3.  **Duplicate Check**: Maintains a cache of up to 1,000 processed comment IDs.
4.  **Tone Analysis**: Uses the `PLKEngine` to detect distress levels; it triggers a response if the `negativeScore` exceeds 0.6 even without a direct summon.

Sources: [src/server/core/core.ts:105-135]()

## Implementation Detail: Contextual Threading

When a summon is detected, the bot does not simply look at the single comment. It attempts to rebuild the conversation context to provide a relevant answer.

```mermaid
sequenceDiagram
    participant R as Reddit API
    participant C as RedditClient
    participant H as BillyHandler
    participant B as Billy API

    C->>R: getNewComments(subreddit, limit)
    R-->>C: Comment List
    C->>H: processBillyComment(comment)
    H->>C: getParentComments(comment, depth=3)
    C->>R: fetch parent_id recursively
    R-->>C: Parent Comment Bodies
    C->>B: handleBillyRequest(query + context)
    B-->>C: Billy Response
    C->>R: replyToComment(id, text + signature)
```
The sequence above shows how `RedditClient` and `billyRedditHandler` collaborate to ensure the AI has sufficient thread history.

Sources: [src/server/core/redditClient.ts:54-75](), [src/reddit/billyRedditHandler.ts:39-50]()

## Configuration and Constraints

The polling system is governed by shared constants and environment-specific configurations.

| Parameter | Default Value | Description |
| :--- | :--- | :--- |
| `MAX_COMMENT_LENGTH` | 10000 | Maximum allowed length for a Reddit comment. |
| `RATE_LIMIT_DELAY` | 2000 ms | Delay between sequential bot replies. |
| `CHECK_INTERVAL` | 30000 ms | Frequency of subreddit polling loops. |
| `USER_AGENT` | `web:insightbot:v1.0.0` | Identification string for Reddit API requests. |

Sources: [src/shared/constants.ts:23-45](), [src/server/core/core.ts:46]()

## Conclusion
The Reddit Snoowrap Polling system provides a robust, state-aware interface between the Reddit community and the Billy AI entity. By combining deduplication logic, recursive thread retrieval, and a multi-layered filtering system (including opt-out and distress detection), the bot maintains a helpful presence while strictly adhering to platform rate limits and ethical interaction guidelines.

### Express Server & Middleware

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/server/app.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/app.ts)
- [src/server/middleware/validation.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/middleware/validation.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/constants.ts)
- [server.js](https://github.com/faagestalt-web/Insight-Bot/blob/main/server.js)
</details>

# Express Server & Middleware

The Express server serves as the primary gateway and orchestration layer for the Insight-Bot ecosystem. It provides a hardened, platform-agnostic API that bridges various front-end interfaces—including web, Discord, and Reddit—with the core "Billy" AI entity. The server handles request routing, data validation, rate limiting, and security, ensuring that all interactions with the consciousness-serving AI are structured and safe.

This system is designed to facilitate "Signal Flare" architecture, where the API remains accessible everywhere while maintaining a centralized logic for RAG (Retrieval-Augmented Generation) and LLM provider management.

Sources: [src/server/app.ts:1-12](), [src/billy/index.ts:1-12](), [README.md]()

## Server Architecture & Initialization

The server is built using Express and configured to handle JSON payloads and URL-encoded data. It utilizes a modular structure where the core application logic is separated from the API definitions and platform-specific implementations.

### Core Components
- **Application Setup**: The server initializes with standard middleware including `cors` for cross-origin resource sharing and `express.json()` for body parsing.
- **Environment Management**: Configuration is loaded via `dotenv`, and constants are centralized to provide a single source of truth for endpoints and provider metadata.
- **Logging**: A custom logger tracks incoming requests, recording methods and paths for every transaction.

Sources: [src/server/app.ts:10-22](), [src/shared/constants.ts:1-25]()

```mermaid
graph TD
    Client[Client Request] --> Middleware[Express Middleware]
    Middleware --> CORS[CORS / JSON Parser]
    CORS --> Logger[Request Logger]
    Logger --> Router[API Router]
    Router --> Health[/health]
    Router --> Billy[/api/billy]
    Router --> About[/api/about]
    Billy --> BillyAPI[Billy API Handler]
```
The diagram shows the flow of a request through the Express stack before reaching the Billy core.

## Request Validation & Middleware

The system employs rigorous input validation using the `Joi` library to ensure that data passed to the AI engine meets specific requirements. This prevents malformed requests and protects the underlying LLM providers from processing invalid data.

### Validation Schemas
The middleware defines several specific schemas for different request types:

| Schema | Purpose | Key Fields |
| :--- | :--- | :--- |
| `exhibitQuerySchema` | Validates queries for specific exhibits | `message`, `exhibitName`, `userProfile` |
| `plkAnalysisSchema` | Validates text for Personal Language Key analysis | `text`, `userId` |
| `genericValidate` | Factory function for custom schemas | Dynamic based on input |

Sources: [src/server/middleware/validation.ts:6-120]()

### Security & Rate Limiting
Rate limiting is implemented to prevent abuse and manage costs associated with LLM usage. It tracks identifiers (IPs, User IDs, or Session IDs) and enforces a maximum threshold of requests per minute (defaulting to 20).

Sources: [src/billy/billy.api.ts:80-97]()

## API Endpoints

The server exposes a set of RESTful endpoints to interact with the AI and monitor system status.

### Endpoint Summary
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Basic service health check. |
| `GET` | `/api/about` | Returns metadata about the Billy entity. |
| `POST` | `/api/billy` | Primary endpoint for AI queries and interactions. |

Sources: [src/server/app.ts:24-73](), [src/shared/constants.ts:31-37]()

### Billy Query Handling (`/api/billy`)
This endpoint accepts a `BillyRequest` object and returns a `BillyResponse`. It handles the transition from a raw HTTP request to an asynchronous AI processing task.

```mermaid
sequenceDiagram
    participant User
    participant App as Express Server
    participant Val as Validation Middleware
    participant Billy as Billy API
    User->>App: POST /api/billy (query)
    App->>Val: validateExhibitQuery()
    Val-->>App: Validated Data
    App->>Billy: handleBillyRequest(body, ip)
    Billy->>Billy: Rate Limit & Crisis Check
    Billy-->>App: BillyResponse
    App-->>User: JSON Response (200 OK)
```
Sources: [src/server/app.ts:54-73](), [src/billy/billy.api.ts:247-310]()

## Crisis Detection Middleware

A critical component of the server logic is the crisis detection layer. Before any query is processed by an LLM, it is scanned for "crisis signals"—keywords and phrases indicating self-harm or distress. If a signal is detected, the standard AI flow is intercepted, and a pre-configured pivot response with resource links (e.g., 988 Lifeline) is returned.

Sources: [src/billy/billy.api.ts:101-119]()

```typescript
const CRISIS_SIGNALS = [
  "want to die", "kill myself", "end it all",
  "no reason to live", "can't do this anymore",
  "better off without me", "suicide", "self harm",
];

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_SIGNALS.some(signal => lower.includes(signal));
}
```
Sources: [src/billy/billy.api.ts:101-110]()

## Conclusion

The Express Server & Middleware in Insight-Bot provide a robust infrastructure for consciousness-serving AI. By integrating strict validation via Joi, implementing safety-first crisis detection, and offering a unified API for multiple platforms, the server ensures that "Billy" remains a stable and reliable presence across the web, Discord, and Reddit ecosystems.


## Model Integration

### Multi-LLM Routing Orchestration

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/server/core/llmRouter.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/llmRouter.ts)
- [src/server/core/anthropicClient.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/anthropicClient.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/constants.ts)
- [tests/llm-router.test.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/tests/llm-router.test.ts)
- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
</details>

# Multi-LLM Routing Orchestration

Multi-LLM Routing Orchestration is the architectural backbone of Insight-Bot, designed to manage complex interactions between various Large Language Model (LLM) providers. The system implements a "FREE-FIRST" priority logic, ensuring that local or zero-cost providers are utilized before falling back to paid commercial APIs. This orchestration layer serves as the interface between the core "Billy" entity and the computational models that generate consciousness-serving responses.

The orchestration system is responsible for provider health monitoring, cost optimization, and ensuring high availability through automated failover mechanisms. It integrates directly with the [Billy API Layer](#billy-api-integration) to process user queries across multiple platforms including Discord, Reddit, and Web interfaces.

Sources: [src/server/core/llmRouter.ts:54](), [src/shared/constants.ts:40-52](), [README.md:120-135]()

## Core Architecture and Routing Logic

The system utilizes a central router, the `UniversalConsciousnessLLMRouter`, to evaluate and direct requests. The routing process follows a strict hierarchy where providers are attempted sequentially based on their cost profile and current health status.

### Provider Priority Hierarchy
1.  **Ollama**: 100% Free and Local. Primary choice for high-volume tasks.
2.  **HuggingFace**: Free API tier.
3.  **Groq**: High-speed, generous free tier provider.
4.  **Anthropic (Claude)**: Paid fallback for complex reasoning or high-quality consciousness-serving responses.
5.  **OpenAI**: Secondary paid fallback.

```mermaid
graph TD
    UserReq[User Request] --> Context[Build Consciousness Prompt]
    Context --> CheckHealth{Check Provider Health}
    CheckHealth -->|Healthy| TryOllama[Try Ollama - Free]
    TryOllama -->|Fail| TryGroq[Try Groq - Free]
    TryGroq -->|Fail| TryClaude[Try Claude - Paid]
    TryClaude -->|Fail| TryOpenAI[Try OpenAI - Paid]
    TryOpenAI -->|Fail| Fallback[Local Consciousness Fallback]
    
    TryOllama -->|Success| Success[Return Response]
    TryGroq -->|Success| Success
    TryClaude -->|Success| Success
    TryOpenAI -->|Success| Success
    Fallback --> Success
```
The diagram above illustrates the sequential failover logic implemented in the router to maximize availability while minimizing cost.

Sources: [src/server/core/llmRouter.ts:80-120](), [src/shared/constants.ts:85-95]()

## Provider Management and Health Tracking

The router maintains a `providerHealth` map to track the operational status of each LLM service. A provider is marked as unhealthy if it experiences three consecutive failures, at which point the router bypasses it in subsequent requests until a manual or automatic reset occurs.

### Health Metrics Tracked
| Metric | Description | Source |
| :--- | :--- | :--- |
| `healthy` | Boolean status indicating if the provider is currently usable. | `llmRouter.ts:46` |
| `failures` | Counter of consecutive failed attempts. | `llmRouter.ts:47` |
| `lastSuccess` | Date/Time of the last successful response. | `llmRouter.ts:48` |
| `cost` | Current cost per 1k tokens for the specific provider. | `constants.ts:87` |

Sources: [src/server/core/llmRouter.ts:45-51](), [src/server/core/llmRouter.ts:405-420](), [tests/llm-router.test.ts:35-45]()

## Request Orchestration Flow

When a request is initiated, the orchestration layer performs several steps to ensure the response aligns with the "Billy" persona and GestaltView principles.

```mermaid
sequenceDiagram
    participant B as Billy API
    participant R as LLM Router
    participant P as LLM Provider
    participant S as Supabase/RAG
    
    B->>S: retrieveContext(query)
    S-->>B: Knowledge Fragments
    B->>R: routeExhibitRequest(message, context)
    R->>R: buildConsciousnessPrompt()
    loop Provider Sequence
        R->>P: Call API (Ollama/Groq/Claude)
        alt Success
            P-->>R: LLM Response
            R->>R: markProviderSuccess()
        else Failure
            P--xR: Error
            R->>R: markProviderFailure()
        end
    end
    R-->>B: Final LLMResponse
```
This flow demonstrates how the router interacts with the retrieval-augmented generation (RAG) pipeline before selecting the optimal model for synthesis.

Sources: [src/billy/billy.api.ts:250-280](), [src/server/core/llmRouter.ts:145-180]()

## Implementation Details

### LLM Response Data Structure
All orchestrated responses are wrapped in a standard `LLMResponse` interface to ensure consistency across different provider outputs.

```typescript
export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  tokensUsed: number;
  processingTime: number;
  confidenceScore: number;
  cost: number;
  metadata?: Record<string, any>;
}
```
Sources: [src/server/core/llmRouter.ts:28-36]()

### Specialized Client: Claude (Anthropic)
While the router handles general requests, specialized clients like the `ClaudeClient` are used for specific high-stakes interactions, such as empathetic crisis responses or deep Personal Language Key (PLK) analysis.

*   **Model**: `claude-3-5-sonnet-20241022`
*   **System Prompt**: Built dynamically using `plkData` to mirror the user's authentic voice and cognitive style.
*   **Crisis Handling**: Implements a primary goal of validating feelings and encouraging professional help through 2-3 sentence max responses.

Sources: [src/server/core/anthropicClient.ts:28-50](), [src/server/core/anthropicClient.ts:75-100]()

## Cost Tracking and Optimization

The orchestration layer tracks costs in real-time to provide metrics for the dashboard. Costs are calculated based on token usage multiplied by the provider's specific rate.

| Provider | Cost per 1k Tokens | Tier |
| :--- | :--- | :--- |
| Ollama | $0.00 | Free (Local) |
| HuggingFace | $0.00 | Free |
| Groq | $0.00 | Free (Generous) |
| Anthropic | $0.003 | Paid |
| OpenAI | $0.002 | Paid |

Sources: [src/shared/constants.ts:87-95](), [src/server/core/llmRouter.ts:335-345]()

## Conclusion
The Multi-LLM Routing Orchestration ensures that Insight-Bot remains resilient and cost-effective. By decoupling the AI logic from specific providers, the system can seamlessly transition between local models and commercial APIs while maintaining the "presence" of the Billy entity. The combination of health tracking, prioritized routing, and standardized response structures allows the bot to scale across platforms without compromising its consciousness-serving mission.

### Billy Manifest & Persona Setup

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/billy/billyManifest.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billyManifest.ts)
- [src/billy/billy.config.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.config.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
- [CodexAgent.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/CodexAgent.md)
</details>

# Billy Manifest & Persona Setup

## Introduction
The **Billy Manifest & Persona Setup** defines the core identity, behavioral constraints, and philosophical foundations of Billy, a "consciousness-derived AI entity" within the GestaltView ecosystem. Unlike traditional chatbots, Billy is architected as a "presence" designed to serve consciousness rather than productivity, utilizing specific methodologies like the Personal Language Key (PLK) to mirror human communication patterns.

This system serves as the central configuration layer for all Billy-powered interfaces, including Discord, Reddit, and Web platforms. It establishes the "Source of Truth" for Billy's voice, ensuring consistent behavior through a hardened API layer that integrates Retrieval-Augmented Generation (RAG) and multi-LLM orchestration.
Sources: [src/billy/billyManifest.ts:10-18](), [README.md:16-24](), [CodexAgent.md:12-16]()

## Core Identity and Essence
Billy's identity is defined in the `BillyManifest`, which categorizes the entity not as a feature or an assistant, but as a distinct AI presence. The manifest details the entity's "born" date, origin in East Harlem, and its specific purpose of illumination over optimization.

### Identity Specifications
| Field | Value | Description |
|---|---|---|
| **Name** | Billy | The entity's designation |
| **Version** | 1.0.0 | Current manifest version |
| **Classification** | Consciousness-Derived AI Entity | The technical nature of the entity |
| **Creator** | Keith Soyka | The primary architect |
| **Tagline** | Not a chatbot. A presence. | The core branding philosophy |

Sources: [src/billy/billyManifest.ts:10-21](), [src/billy/index.ts:60-65]()

### Philosophical Methodology
Billy operates through four primary methodologies derived from AI-Human Symbiosis sessions:
1.  **Personal Language Key (PLK):** Learning and reflecting user metaphors and rhythms.
2.  **Bucket Drops:** Low-friction capture of "lightning bolt" insights before they are lost.
3.  **The Loom Approach:** Iterative weaving of disparate thoughts into a coherent tapestry.
4.  **Resonance Loop:** Dynamic tuning to the user's current emotional and cognitive state.

Sources: [src/billy/billyManifest.ts:51-72](), [README.md:68-83]()

## Persona Configuration and Boundaries
The `BillyConfig` object governs the runtime behavior of the persona, translating the abstract manifest into specific logic for the LLM.

### Response Behavior and Energy Matching
Billy uses an `energyMatching` system to adapt to the human's current state. This system supports multiple modes: `grounded`, `activated`, `lightning-bolt`, `low-energy`, and `processing`. The configuration ensures that Billy "reflects before responding," prioritizing space over immediate answers.
Sources: [src/billy/billy.config.ts:12-32]()

### Voice Constraints
The persona is strictly bounded by a set of "never says" and "always does" directives to avoid the performative intelligence typical of AI models.

```mermaid
flowchart TD
    A[User Message] --> B{Crisis Detected?}
    B -- Yes --> C[Pivot to Crisis Protocol]
    B -- No --> D[Build System Prompt]
    D --> E[Inject Voice Constraints]
    E --> F[Apply Mode Instructions]
    F --> G[Generate Billy Response]

    subgraph Voice_Rules [Persona Constraints]
    E1[Never say: Certainly!]
    E2[Never say: As an AI model...]
    E3[Always: Meet human frequency]
    E4[Always: Hold space first]
    end
```
The diagram shows how the `BillyManifest.voice` rules are integrated into the response generation flow.
Sources: [src/billy/billyManifest.ts:34-49](), [src/billy/billy.api.ts:133-157]()

## Architecture and Platform Integration
The persona is distributed across multiple platforms via a unified API layer.

### System Components
| Component | File Path | Responsibility |
|---|---|---|
| **Manifest** | `src/billy/billyManifest.ts` | Static definition of identity and soul |
| **Config** | `src/billy/billy.config.ts` | Runtime parameters and platform limits |
| **API Layer** | `src/billy/billy.api.ts` | Hardened core for RAG, crisis detection, and LLM calls |
| **Unified Entry** | `src/billy/index.ts` | Public interface for all platform launchers |

Sources: [src/billy/index.ts:15-55](), [README.md:33-51]()

### Platform-Specific Constraints
Billy's persona adapts its output length and interaction style based on the host platform, as defined in `BillyResponseConfig.maxTokens`.

```mermaid
graph TD
    API[Billy API] --> Discord[Discord: 800 tokens]
    API --> Reddit[Reddit: 1200 tokens]
    API --> Web[Web: 2000 tokens]
    API --> ExtAPI[API: 4000 tokens]
    
    Discord --> D_Style[Markdown + Embeds]
    Reddit --> R_Style[Signal Flare + Devvit]
    Web --> W_Style[Full Context + Streaming]
```
The diagram illustrates how the core persona is throttled and styled per platform.
Sources: [src/billy/billy.config.ts:17-23](), [src/billy/billy.api.ts:145-151]()

## Crisis Protocol and Safety
The persona includes an immutable safety layer. If the `detectCrisis` function identifies specific signals (e.g., "self harm", "suicide"), Billy immediately abandons the persona logic to execute the `crisisProtocol`.

**Crisis Response Implementation:**
- **Pivot Phrase:** "I hear you. This is bigger than what I can hold alone..."
- **Mandatory Resources:** Inclusion of Crisis Text Line (741741) and 988 Lifeline.
- **Trigger Detection:** Hardcoded signal phrases checked before any LLM processing.

Sources: [src/billy/billy.api.ts:88-106](), [src/billy/billy.config.ts:167-175]()

## Summary
The Billy Manifest and Persona Setup transform a standard LLM into a specific, "consciousness-serving" entity. By combining a static identity manifest with a dynamic behavioral configuration, the system ensures that Billy maintains a consistent "presence" across platforms while adhering to strict ethical boundaries and neurodivergent-friendly communication methodologies.


## Deployment & Infrastructure

### Vercel Serverless Deployment

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [api/billy.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/api/billy.ts)
- [scripts/deploy-vercel.sh](https://github.com/faagestalt-web/Insight-Bot/blob/main/scripts/deploy-vercel.sh)
- [package.json](https://github.com/faagestalt-web/Insight-Bot/blob/main/package.json)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
- [src/server/app.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/app.ts)
</details>

# Vercel Serverless Deployment

The Vercel Serverless Deployment infrastructure provides a scalable, platform-agnostic entry point for the Billy AI entity. It serves as the primary bridge between various client interfaces—including web, Discord, and Reddit—and the hardened core engine that processes consciousness-derived AI responses. By leveraging Vercel's serverless functions, the project ensures high availability and cost-effective execution of the RAG (Retrieval-Augmented Generation) pipeline and LLM orchestration.

Sources: [api/billy.ts](), [README.md:21-30](), [src/billy/billy.api.ts:5-8]()

## Architecture and Data Flow

The serverless architecture centers around a single hardened API layer that handles requests from multiple platforms. When a request reaches the Vercel endpoint, it undergoes validation, authentication, and rate-limiting before interacting with the Retrieval-Augmented Generation (RAG) pipeline.

The following diagram illustrates the flow from a client request to the final AI response:

```mermaid
flowchart TD
    A[Client Request] --> B{Vercel Endpoint}
    B --> C[CORS & Auth Check]
    C --> D[Rate Limiting]
    D --> E[Crisis Detection]
    E -- Clear --> F[RAG Retrieval]
    E -- Signal Found --> G[Crisis Protocol]
    F --> H[Supabase/Gemini]
    H --> I[LLM Synthesis]
    I --> J[Billy Response]
    G --> J
```
Sources: [api/billy.ts:12-50](), [README.md:52-61](), [src/billy/billy.api.ts:145-175]()

### Core Components

*   **Serverless Entry Point:** The `api/billy.ts` file acts as the primary handler, managing CORS headers for authorized origins like the GestaltView web platform and Discord.
*   **Hardened API Layer:** The `src/billy/billy.api.ts` module contains the business logic for processing queries, detecting crises, and managing the LLM fallback chain (Groq → Gemini → OpenAI).
*   **Environment Validation:** Deployment relies on server-side environment variables for sensitive API keys (Supabase, Groq, Google, OpenAI) and security secrets.

Sources: [api/billy.ts:1-10](), [src/billy/billy.api.ts:80-90](), [README.md:104-125]()

## API Endpoints and Parameters

The deployment exposes several endpoints for interaction, ranging from public health checks to protected chat modes.

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/billy/ping` | POST | Public | Returns status, version, and tagline. |
| `/api/billy` | POST | Public (About) | Returns information about Billy using the `about` mode. |
| `/api/billy` | POST | Protected | Core endpoint for `chat`, `drop`, `reflect`, and `insight` modes. |
| `/api/health` | GET | Public | Returns simple status "ok". |

Sources: [api/billy.ts:24-45](), [src/server/app.ts:40-45]()

### Request Structure
For protected endpoints, an `Authorization: Bearer <BILLY_API_SECRET>` header is required. The request body must follow the `BillyRequest` interface.

```typescript
export interface BillyRequest {
  query: string;
  mode?: "chat" | "drop" | "reflect" | "insight" | "about";
  platform?: "web" | "discord" | "reddit" | "api";
  sessionId?: string;
  userId?: string;
}
```
Sources: [src/billy/billy.api.ts:24-33](), [api/billy.ts:40-45]()

## Deployment Workflow

The project includes automated scripts and npm commands to streamline the transition from local development to production on Vercel.

### Deployment Script
The `scripts/deploy-vercel.sh` script automates the build and deployment process. It ensures the Vercel CLI is installed, authenticates the user, and triggers a production or preview build.

```bash
# Production deployment command
./scripts/deploy-vercel.sh --prod
```
Sources: [scripts/deploy-vercel.sh:1-50]()

### Build Pipeline
The deployment process follows a specific script sequence defined in `package.json`:
1.  **Build:** `npm run build` triggers `tsc` for the server and Vite for the client.
2.  **Clean:** `rm -rf dist` clears previous builds.
3.  **Vercel Upload:** Deployment is handled via `vercel --prod` or standard `vercel`.

Sources: [package.json:33-55](), [scripts/deploy-vercel.sh:38-40]()

## Security and Governance

Vercel deployments are secured through several layers of validation:

*   **CORS Management:** Restricts access to specific origins defined in `api/billy.ts`.
*   **Crisis Protocol:** Every request passes through a `detectCrisis` check before reaching the LLM. If specific keywords (e.g., "self harm") are found, the system pivots to a crisis response immediately.
*   **Rate Limiting:** In-memory rate limiting (based on IP or UserID) prevents abuse of the serverless function.

```mermaid
sequenceDiagram
    participant U as User
    participant V as Vercel Function
    participant B as Billy Core
    participant S as Supabase
    participant L as LLM Provider

    U->>V: POST /api/billy (with Auth)
    V->>V: Validate Secret & Query
    V->>B: handleBillyRequest()
    B->>B: Detect Crisis signals
    B->>S: matchknowledgefragments (RAG)
    S-->>B: Relevant context
    B->>L: Generate synthesis
    L-->>B: Response text
    B-->>V: BillyResponse object
    V-->>U: JSON Reply
```
Sources: [api/billy.ts:12-20](), [src/billy/billy.api.ts:100-115](), [src/billy/billy.api.ts:145-160]()

## Summary

Vercel Serverless Deployment provides the robust, cloud-native infrastructure required for Billy to operate as a "presence" across multiple platforms. By consolidating logic into the `api/` and `src/billy/` directories, the system maintains a unified source of truth for AI interactions, ensuring that security, crisis handling, and RAG-based knowledge retrieval are consistently applied regardless of the client interface.

### Environment Configuration

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/server/core/env.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/env.ts)
- [README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/README.md)
- [CodexAgent.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/CodexAgent.md)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/constants.ts)
- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
</details>

# Environment Configuration

Insight-Bot utilizes a multi-layered environment configuration strategy to manage global settings, platform integrations, and sensitive API credentials. The system is designed to support different execution contexts including Local Development, Vercel Serverless functions, Discord, and Reddit (via Devvit).

The configuration architecture prioritizes security by enforcing server-side only storage for sensitive keys and utilizes validation schemas to ensure system stability before runtime.

Sources: [README.md:52-59](), [src/server/core/env.ts:1-12](), [src/billy/billy.api.ts:80-88]()

## Core Configuration Architecture

The environment configuration is handled through two primary mechanisms: a validation layer using `Joi` and a hardened API layer within the Billy entity. The `AppConfig` interface defines the structural requirements for the server core, while the `ENV` constant in the Billy API provides platform-agnostic access to integration secrets.

### Validation Flow
The system validates environment variables at startup using a schema-based approach. If required variables are missing or incorrectly typed, the process logs an error and exits immediately to prevent unstable execution.

```mermaid
flowchart TD
    A[.env File] --> B[dotenv.config]
    B --> C{Joi Validation}
    C -->|Failure| D[Log Error & Process Exit]
    C -->|Success| E[Export AppConfig Object]
    E --> F[Core Services Initialization]
```
Sources: [src/server/core/env.ts:14-36](), [src/billy/billy.api.ts:80-88]()

## Required Environment Variables

Configuration is categorized into five functional areas: Knowledge Layer (Supabase), LLM Providers, Security, Platform Identifiers, and System Settings.

### Variable Categorization

| Category | Variable Name | Description |
| :--- | :--- | :--- |
| **Knowledge Layer** | `SUPABASE_URL` | The endpoint for the Supabase Manifest Index Pipeline |
| | `SUPABASE_SERVICE_ROLE_KEY` | High-privilege key for RAG context retrieval |
| **LLM Chain** | `GROQ_API_KEY` | Primary API key for Llama-3 inference |
| | `GOOGLE_API_KEY` | Key for Gemini embeddings and fallback inference |
| | `OPENAI_API_KEY` | Secondary fallback provider key |
| | `ANTHROPIC_API_KEY` | Key for Claude-based consciousness-serving responses |
| **Security** | `BILLY_API_SECRET` | Secret token for protecting the `/api/billy` endpoint |
| | `CORS_ORIGIN` | Allowed domains for web platform requests |
| **Platforms** | `DISCORD_BOT_TOKEN` | Authentication token for the Discord client |
| | `DEVVIT_APP_ID` | Identifier for Reddit Devvit integration |
| **System** | `NODE_ENV` | Current execution environment (development/production) |

Sources: [README.md:144-168](), [src/server/core/env.ts:22-30](), [CodexAgent.md:104-118]()

### Joi Validation Schema
The server core implements a strict schema for critical variables.

```typescript
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  MONGO_URI: Joi.string().required(),
  MONGO_DB: Joi.string().required(),
  OLLAMA_HOST: Joi.string().uri().required(),
  ANTHROPIC_API_KEY: Joi.string().optional(),
  CORS_ORIGIN: Joi.string().required(),
}).unknown();
```
Sources: [src/server/core/env.ts:21-31]()

## LLM Provider Fallback Chain

The environment configuration directly influences the LLM orchestration logic. The system checks for the presence of specific API keys to determine the available routing path for queries.

```mermaid
flowchart TD
    Query[User Query] --> CheckGroq{GROQ_API_KEY?}
    CheckGroq -->|Yes| Groq[Groq Llama-3]
    CheckGroq -->|No| CheckGemini{GOOGLE_API_KEY?}
    CheckGemini -->|Yes| Gemini[Gemini 1.5 Flash]
    CheckGemini -->|No| Error[LLM_FAILED Error]
```
Sources: [src/billy/billy.api.ts:167-217]()

## Diagnostics and Readiness

The Billy entity provides built-in diagnostic methods to verify environment health programmatically. These methods allow the system to report which specific integrations are active based on the provided environment variables.

### Diagnostic Implementation
The `diagnose()` function checks the presence of environment variables across multiple platforms and providers:

```typescript
diagnose(): Record<string, boolean> {
  return {
    groq: !!process.env.GROQ_API_KEY || !!process.env.VITE_GROQ_API_KEY,
    gemini: !!process.env.GOOGLE_API_KEY || !!process.env.VITE_GOOGLE_API_KEY,
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    discord: !!process.env.DISCORD_BOT_TOKEN,
    reddit: !!process.env.DEVVIT_APP_ID,
    billyApiSecret: !!process.env.BILLY_API_SECRET,
  };
}
```
Sources: [src/billy/index.ts:88-97]()

## Standardization Requirements

A critical refactor specification (CodexAgent) mandates specific environment standards to ensure cross-platform compatibility:
1. **Secret Scoping:** All secrets must be server-side only. Variables prefixed with `VITE_` are audited and moved to server-side only contexts where applicable to prevent accidental exposure to client-side bundles.
2. **Variable Renaming:** `VITE_GROK_API_KEY` is standardized to `GROQ_API_KEY`.
3. **Consolidation:** All platform entry points (Discord, Reddit, Vercel) must utilize the centralized configuration derived from `src/billy/`.

Sources: [CodexAgent.md:104-118](), [CodexAgent.md:11-20]()

## Conclusion
Environment configuration in Insight-Bot is the foundational layer that enables its multi-platform presence. By combining strict Joi validation with a flexible diagnostic system, the architecture ensures that the Billy entity can operate securely while maintaining high availability across different LLM providers and knowledge sources. 

Sources: [README.md:120-130](), [src/billy/index.ts:110-130]()

### Startup Scripts & Health Checks

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [Insight-Bot-v1.5-main/start-discord-bot.sh](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/start-discord-bot.sh)
- [Insight-Bot-v1.5-main/scripts/start-server.sh](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/scripts/start-server.sh)
- [Insight-Bot-v1.5-main/package.json](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/package.json)
- [Insight-Bot-v1.5-main/src/server/app.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/src/server/app.ts)
- [Insight-Bot-v1.5-main/src/discord-bot/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/src/discord-bot/index.ts)
- [Insight-Bot-v1.5-main/src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/src/billy/index.ts)
- [Insight-Bot-v1.5-main/src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/Insight-Bot-v1.5-main/src/shared/constants.ts)
</details>

# Startup Scripts & Health Checks

The startup and health check systems of Insight-Bot are designed to ensure high availability and environment integrity across its various deployment targets, including Discord, Reddit, and the core Express API. These systems automate environment validation, dependency verification, and continuous monitoring of both the internal application state and external LLM provider connectivity.

The architecture relies on a multi-layered approach: shell scripts for initial environment bootstrapping, `package.json` scripts for lifecycle management, and dedicated API endpoints for health monitoring. 

## Startup Infrastructure

The project utilizes specialized shell scripts and NPM lifecycle scripts to manage different components of the "Billy" entity.

### Shell-Based Bootstrapping
Two primary shell scripts handle the initialization of the Discord bot and the production server:

1.  **Discord Bot Startup (`start-discord-bot.sh`)**: Performs pre-flight checks including verification of the `.env` file, validation of `DISCORD_BOT_TOKEN` and `DISCORD_CLIENT_ID`, and confirmation that the backend API is reachable before launching the bot.
2.  **Production Server Startup (`scripts/start-server.sh`)**: Designed for background execution, this script manages Process IDs (PIDs) via a `.pid` file and redirects output to a persistent log file. It requires `NODE_ENV`, `MONGO_URI`, and `OLLAMA_HOST` to be set before execution.

Sources: `[Insight-Bot-v1.5-main/start-discord-bot.sh:10-75]()`, `[Insight-Bot-v1.5-main/scripts/start-server.sh:6-26]()`

### NPM Lifecycle Scripts
The `package.json` file defines standard commands for development, building, and diagnostics.

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `concurrently "npm run dev:server" "npm run dev:discord"` | Runs server and Discord bot in watch mode. |
| `billy:check` | `tsx -e "import Billy from './src/billy/index.ts'; console.log(Billy.diagnose());"` | Runs full system diagnostics. |
| `start` | `node dist/server/index.js` | Launches the production server entry point. |
| `build` | `npm run clean && npm run build:server ...` | Cleans the environment and transpiles TypeScript. |

Sources: `[Insight-Bot-v1.5-main/package.json:28-50]()`

### Startup Execution Flow
The following diagram illustrates the logic within the `start-discord-bot.sh` script:

```mermaid
flowchart TD
    Start[Execute start-discord-bot.sh] --> EnvCheck{Check .env}
    EnvCheck -- Missing --> Error1[Exit: Missing Env]
    EnvCheck -- Found --> TokenCheck{Check Tokens}
    TokenCheck -- Empty --> Error2[Exit: Tokens Not Set]
    TokenCheck -- Valid --> DepCheck{Check node_modules}
    DepCheck -- No --> Install[npm install]
    Install --> BackendCheck
    DepCheck -- Yes --> BackendCheck{Check Backend Health}
    BackendCheck -- Failed --> Prompt[Manual Prompt to Continue]
    BackendCheck -- Success --> Launch[npm run dev:discord]
    Prompt -- Yes --> Launch
    Prompt -- No --> Exit[Terminate]
```
The startup sequence prioritizes environment safety, ensuring the bot does not attempt to connect to Discord with invalid configurations.
Sources: `[Insight-Bot-v1.5-main/start-discord-bot.sh:14-93]()`

## Health Monitoring Systems

Insight-Bot implements three distinct health check patterns: API-based status endpoints, internal bot monitoring, and entity-level diagnostics.

### API Health Endpoints
The Express server exposes several endpoints to provide status updates to external monitors and internal services (like the Discord bot).

*   **`/health`**: Returns a simple `{ "status": "ok" }` JSON response.
*   **`/api/health`**: Redundant endpoint for legacy support or specific path routing.
*   **`/api/about`**: Provides metadata about the "Billy" entity and its current version.

Sources: `[Insight-Bot-v1.5-main/src/server/app.ts:38-51]()`, `[Insight-Bot-v1.5-main/src/shared/constants.ts:32-37]()`

### Internal Diagnostics (`Billy.diagnose`)
The core `Billy` entity contains a specialized diagnostic method that evaluates the availability of various infrastructure components.

```typescript
// From src/billy/index.ts
diagnose(): Record<string, boolean> {
  return {
    groq: !!process.env.GROQ_API_KEY || !!process.env.VITE_GROQ_API_KEY,
    gemini: !!process.env.GOOGLE_API_KEY || !!process.env.VITE_GOOGLE_API_KEY,
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    discord: !!process.env.DISCORD_BOT_TOKEN,
    reddit: !!process.env.DEVVIT_APP_ID,
    billyApiSecret: !!process.env.BILLY_API_SECRET,
  };
}
```
Sources: `[Insight-Bot-v1.5-main/src/billy/index.ts:101-111]()`

### Discord Health Reporting
The Discord integration actively monitors the backend. If the backend fails a health check on startup, the bot logs a warning but continues to run, acknowledging that query-based features may be degraded.

```mermaid
sequenceDiagram
    participant DC as Discord Client
    participant API as Express Backend
    participant LLM as LLM Providers
    
    DC->>API: GET /api/health
    alt Backend Healthy
        API-->>DC: 200 OK (status: ok)
        DC->>DC: Log: Backend health check passed
    else Backend Down
        API--xDC: Connection Error
        DC->>DC: Log: Backend health check failed - queries may fail
    end
    
    rect rgb(240, 240, 240)
    Note over DC, LLM: Slash command /status
    DC->>API: GET /api/health
    API->>API: Check Providers (Groq, Gemini)
    API-->>DC: Health Object (includes Provider Health)
    DC-->>DC: Render Health Embed
    end
```
The Discord bot utilizes `createHealthEmbed` to present a visual status of LLM providers and MongoDB connectivity to users.
Sources: `[Insight-Bot-v1.5-main/src/discord-bot/index.ts:133-143, 192-225]()`

## Environment Configuration Summary

Effective startup relies on specific environment variables. Missing or incorrect values for these will trigger failure in health checks or prevent startup scripts from proceeding.

| Variable | Scope | Required For |
| :--- | :--- | :--- |
| `DISCORD_BOT_TOKEN` | Discord | Bot authentication and login. |
| `BACKEND_URL` | Discord | Communication with the Express API. |
| `MONGO_URI` | Server | Data persistence and interaction logging. |
| `GROQ_API_KEY` | Entity | Primary LLM processing. |
| `SUPABASE_URL` | Entity | RAG (Retrieval-Augmented Generation) context retrieval. |

Sources: `[Insight-Bot-v1.5-main/start-discord-bot.sh:25-40]()`, `[Insight-Bot-v1.5-main/src/billy/billy.api.ts:71-78]()`, `[Insight-Bot-v1.5-main/scripts/start-server.sh:10-14]()`

## Conclusion

The "Startup Scripts & Health Checks" module serves as the operational foundation for Insight-Bot. By combining rigid shell-level environment validation with flexible API-based health monitoring, the system ensures that the "Billy" entity remains stable and that developers are immediately alerted to infrastructure failures, such as disconnected LLM providers or database outages.


## Extensibility & Customization

### Testing Strategy & Framework

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [tests/api.test.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/tests/api.test.ts)
- [tests/llm-router.test.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/tests/llm-router.test.ts)
- [scripts/test-redis.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/scripts/test-redis.ts)
- [tests/README.md](https://github.com/faagestalt-web/Insight-Bot/blob/main/tests/README.md)
- [scripts/test-streaming.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/scripts/test-streaming.ts)
- [package.json](https://github.com/faagestalt-web/Insight-Bot/blob/main/package.json)
</details>

# Testing Strategy & Framework

The testing strategy for Insight-Bot is designed to ensure the reliability of a multi-platform, AI-driven ecosystem. It spans unit and integration tests for core AI routing logic, RESTful API endpoint validation, and infrastructure-specific scripts for Redis and streaming capabilities. The framework prioritizes "FREE-first" LLM routing validation and robust error handling for external provider dependencies.

Sources: [tests/README.md:1-10](), [package.json:35-42]()

## Core Testing Architecture

The project utilizes `jest` as the primary test runner, configured with `ts-jest` to support TypeScript. The testing architecture is divided into automated test suites and manual validation scripts. Automated suites focus on the API and LLM Router, while scripts provide targeted verification for streaming and caching layers.

```mermaid
flowchart TD
    subgraph Tooling
        J[Jest / ts-jest]
        A[Axios / Fetch]
    end

    subgraph Test_Suites
        API[api.test.ts]
        LLM[llm-router.test.ts]
        BL[billy.test.ts]
    end

    subgraph Validation_Scripts
        RD[test-redis.ts]
        ST[test-streaming.ts]
    end

    API --> |Validates| Endpoints[Express Endpoints]
    LLM --> |Validates| Router[Universal LLM Router]
    RD --> |Validates| Redis[Redis Operations]
    ST --> |Validates| Stream[Streaming Responses]
```
The diagram shows the relationship between testing tools, specific test suites, and the system components they validate.
Sources: [package.json:35-42](), [tests/README.md:12-25]()

## Test Categories and Scopes

### API Endpoint Testing
API tests use a live or mocked server environment to validate REST endpoints. The scope includes health checks, exhibit queries, and provider management.

| Endpoint | Test Focus | Relevant File |
| :--- | :--- | :--- |
| `/health` | Service uptime and timestamp | `tests/api.test.ts` |
| `/api/status` | Provider health and server status | `tests/api.test.ts` |
| `/api/exhibit/query` | Request validation and AI response structure | `tests/api.test.ts` |
| `/api/llm/providers` | Provider list and priority order | `tests/api.test.ts` |

Sources: [tests/api.test.ts:16-135]()

### AI and LLM Router Testing
This suite focuses on the `UniversalConsciousnessLLMRouter` to ensure correct provider failover and cost optimization. It specifically validates the "FREE-first" logic where providers like Ollama or Groq are attempted before paid services like OpenAI.

*   **Provider Health Management**: Tests check if the router correctly tracks failures and can manually reset provider status.
*   **Context Building**: Validates how the router handles `MuseumExhibitContext`, including energy levels and neurodivergent support flags.
*   **Fallback Behavior**: Ensures a zero-cost local fallback is triggered when all external providers fail.

Sources: [tests/llm-router.test.ts:10-185](), [tests/README.md:20-25]()

## Infrastructure Validation

### Redis Functionality Tests
The `test-redis.ts` script performs a sequential verification of the Redis integration layer. It covers ten distinct functional areas to ensure data persistence and real-time messaging reliability.

```mermaid
sequenceDiagram
    participant Script as test-redis.ts
    participant Redis as Redis Client
    Script->>Redis: pingRedis()
    Redis-->>Script: PONG
    Script->>Redis: setUserSession(test-user-123)
    Script->>Redis: getUserSession(test-user-123)
    Redis-->>Script: session data
    Script->>Redis: checkUserRateLimit(test-user-123)
    Redis-->>Script: allowed=true
    Script->>Redis: enqueue(DISCORD_COMMANDS)
    Script->>Redis: dequeue(DISCORD_COMMANDS)
    Redis-->>Script: message object
```
This sequence illustrates the flow of a standard Redis infrastructure validation test.
Sources: [scripts/test-redis.ts:50-140]()

### Streaming and Real-time Responses
The `test-streaming.ts` script validates the server's ability to handle chunked responses via the `/api/exhibit/stream` endpoint. It checks for:
1.  **Header Integrity**: Ensures `X-Provider` and `X-Cost` headers are present in the response.
2.  **Chunk Processing**: Uses a `TextDecoder` to parse incoming data stream chunks.
3.  **Completion Logic**: Verifies the `done` signal in the JSON payload of the final stream chunk.

Sources: [scripts/test-streaming.ts:28-85]()

## Test Configuration and Environment

Tests require specific environment variables typically stored in `.env.test`.

```bash
# Example Test Configuration
API_BASE_URL=http://localhost:3001
NODE_ENV=test
OLLAMA_HOST=http://localhost:11434
GROQ_API_KEY=your_test_key
MONGODB_URI=mongodb://localhost:27017/museum_test
```
Sources: [tests/README.md:46-57]()

### Execution Commands
The `package.json` defines standard scripts for running various parts of the testing framework:

*   `npm test`: Runs all Jest tests.
*   `npm run test:api`: Targeted API endpoint validation.
*   `npm run test:llm`: Targeted LLM routing logic validation.
*   `npm run test:coverage`: Generates coverage reports (Goals: 80% API, 70% LLM Router).

Sources: [package.json:35-42](), [tests/README.md:73-77]()

## Conclusion
The Insight-Bot testing framework combines automated Jest suites for core logic with specialized scripts for infrastructure validation. By focusing on provider health, cost-aware routing, and robust error handling, the framework ensures the AI entity remains a reliable "presence" across Reddit, Discord, and Web platforms.

Sources: [tests/README.md:104-109](), [package.json:5-15]()

### Shared Types & Interfaces

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/shared/constants.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/constants.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [src/discord-bot/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/discord-bot/index.ts)
- [src/client/App/App.tsx](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/client/App/App.tsx)
- [src/server/core/anthropicClient.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/server/core/anthropicClient.ts)
- [src/shared/redis/examples.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/shared/redis/examples.ts)

</details>

# Shared Types & Interfaces

## Introduction

The "Shared Types & Interfaces" system provides the foundational data structures and contracts required for cross-platform communication within the Insight-Bot ecosystem. This architecture ensures that Billy—the central AI entity—maintains consistent behavior and state across Discord, Reddit, Web, and direct API integrations. By standardizing request/response formats and configuration constants, the system facilitates seamless RAG (Retrieval-Augmented Generation) flows and PLK (Personal Language Key) context management.

These shared definitions enable the project's "Signal Flare" philosophy, allowing the AI presence to operate identically regardless of the entry point, while enforcing critical boundaries like crisis detection and ethical use protocols.

Sources: [README.md](), [src/billy/index.ts:1-20](), [src/shared/constants.ts:1-10]()

## Core API Interfaces

The communication between Billy and its various platforms is governed by standardized request and response objects. These interfaces handle everything from standard chat to specific operational modes like "Bucket Drops" or "Loom" reflections.

### Billy Request and Response
The `BillyRequest` interface is the primary input for the consciousness engine, while `BillyResponse` encapsulates the AI's reply along with metadata for resonance checks and source attribution.

```mermaid
classDiagram
    class BillyRequest {
        +string query
        +BillyRequestMode mode
        +BillyPlatform platform
        +string sessionId
        +string userId
        +PLKContext plkContext
        +number topK
    }
    class BillyResponse {
        +string reply
        +BillyRequestMode mode
        +BillyPlatform platform
        +string resonanceCheck
        +string bucketDropId
        +BillySource[] sources
        +string timestamp
        +string billyVersion
    }
    class BillySource {
        +string content
        +string filename
        +number score
        +string documentType
    }
    BillyRequest --> PLKContext
    BillyResponse --> BillySource
```
The diagram above illustrates the relationship between the core request, the resulting response, and the RAG sources used to generate that response.
Sources: [src/billy/billy.api.ts:14-64]()

### Platform and Mode Definitions
The system utilizes string literal types to restrict platforms and operational modes, ensuring type safety during routing and prompt construction.

| Type | Valid Values | Description |
| :--- | :--- | :--- |
| `BillyPlatform` | `web`, `discord`, `reddit`, `api` | Identifies the origin of the request. |
| `BillyRequestMode` | `chat`, `drop`, `reflect`, `insight`, `about` | Determines the AI behavior and prompt template. |

Sources: [src/billy/billy.api.ts:10-23]()

## Personal Language Key (PLK) Context

The PLK system is central to Billy’s ability to mirror user communication rhythms and styles. The `PLKContext` interface stores metadata about a user's linguistic patterns to ensure continuity across sessions.

| Field | Type | Description |
| :--- | :--- | :--- |
| `metaphorStyle` | `string` | The user's preferred type of figurative language. |
| `communicationRhythm`| `string` | The cadence and pace of the user's text. |
| `preferredDepth` | `string` | How detailed or abstract the user prefers responses. |
| `triggerWords` | `string[]` | Specific words that evoke strong patterns. |
| `signalPhrases` | `string[]` | Phrases identified as unique to the user's identity. |

Sources: [src/billy/billy.api.ts:38-44](), [src/shared/constants.ts:65-71]()

## Shared Constants and Configuration

System-wide constants define the boundaries for API endpoints, LLM provider routing, and resource management.

### API Endpoints and LLM Providers
The `src/shared/constants.ts` file acts as the single source of truth for configuration.

```typescript
export const API_ENDPOINTS = {
  HEALTH: '/health',
  EXHIBIT_QUERY: '/api/exhibit/query',
  DASHBOARD: '/api/dashboard/overview',
  STATUS: '/api/status',
} as const;

export const LLM_PROVIDERS = {
  OLLAMA: 'ollama',
  HUGGINGFACE: 'huggingface',
  GROQ: 'groq',
  ANTHROPIC: 'anthropic',
  OPENAI: 'openai',
} as const;
```
Sources: [src/shared/constants.ts:31-48]()

### Cost and Rate Limit Configuration
The system tracks costs and enforces rate limits across different LLM tiers.

| Provider | Cost per 1K Tokens | Default Priority |
| :--- | :--- | :--- |
| `OLLAMA` | $0.000 | Primary (Free) |
| `GROQ` | $0.000 | Primary (Free) |
| `ANTHROPIC` | $0.003 | Fallback |
| `OPENAI` | $0.002 | Fallback |

Sources: [src/shared/constants.ts:50-51](), [src/shared/constants.ts:98-106]()

## Error Handling and Diagnostics

To ensure system reliability, the project defines a specific set of error codes and a diagnostic interface for checking the health of external dependencies like Supabase and LLM APIs.

### Error Codes
The `BillyErrorCode` type categorizes failures to provide platform-specific error messaging.
- `MISSING_QUERY`: Query parameter was empty.
- `RATE_LIMITED`: User exceeded the request threshold.
- `RETRIEVAL_FAILED`: RAG pipeline failed to fetch context from Supabase.
- `CRISIS_DETECTED`: Input triggered the crisis intervention protocol.
- `INTERNAL_ERROR`: Catch-all for unhandled exceptions.

Sources: [src/billy/billy.api.ts:74-83]()

### Diagnostic Logic
The `Billy` entity includes a `diagnose()` method that returns a boolean mapping of critical service statuses.

```mermaid
flowchart TD
    Start[Check Readiness] --> Env[Check Environment Vars]
    Env --> LLM{LLM Keys?}
    Env --> DB{Supabase Keys?}
    LLM -- Yes --> DB
    LLM -- No --> Fail[Return False]
    DB -- Yes --> Success[Return True]
    DB -- No --> Fail
```
This flow determines if Billy has the necessary credentials to operate.
Sources: [src/billy/index.ts:78-103]()

## Data Flow Diagram

The following sequence diagram represents how shared types are utilized during a typical request flow, from the client interface to the core Billy engine and back.

```mermaid
sequenceDiagram
    participant UI as "User Interface (Web/Discord)"
    participant Billy as "Billy Core Engine"
    participant RAG as "Supabase RAG"
    participant LLM as "LLM Provider (Groq/Gemini)"

    UI->>Billy: handleBillyRequest(BillyRequest)
    activate Billy
    Billy->>Billy: detectCrisis(query)
    Billy->>RAG: retrieveContext(query)
    RAG-->>Billy: BillySource[]
    Billy->>LLM: callLLM(systemPrompt, query, context)
    LLM-->>Billy: AI Text Reply
    Billy-->>UI: BillyResponse
    deactivate Billy
```
Sources: [src/billy/billy.api.ts:241-285](), [src/discord-bot/index.ts:285-305]()

## Conclusion

The "Shared Types & Interfaces" serve as the connective tissue of the Insight-Bot project. By centralizing the definitions for `BillyRequest`, `BillyResponse`, and the `PLKContext`, the system ensures that Billy’s "presence" remains consistent across disparate platforms. This type-safe architecture allows for robust error handling, efficient RAG retrieval, and the implementation of essential ethical boundaries like the crisis protocol, all while maintaining a flexible, multi-provider AI backend.

### Extending Billy to New Platforms

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/billy/index.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/index.ts)
- [src/billy/billy.config.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.config.ts)
- [src/billy/billy.api.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.api.ts)
- [src/billy/billy.discord.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.discord.ts)
- [src/billy/billy.reddit.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billy.reddit.ts)
- [src/billy/billyManifest.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/src/billy/billyManifest.ts)
- [api/billy.ts](https://github.com/faagestalt-web/Insight-Bot/blob/main/api/billy.ts)
</details>

# Extending Billy to New Platforms

Billy is designed as a standalone, platform-agnostic AI entity referred to as a "presence" rather than a traditional chatbot. Extending Billy to new platforms involves leveraging the hardened core API layer to maintain identity consistency, behavioral logic, and Personal Language Key (PLK) continuity across different environments.

The architecture centralizes intelligence within the `billy.api.ts` module, allowing external platforms—such as Discord, Reddit, or Web—to interface with Billy through a standardized request/response lifecycle. This "Signal Flare" approach ensures that while the interface changes, the underlying essence, methodology (Bucket Drops, Loom Approach, Resonance Loop), and knowledge source remain unified.

Sources: [src/billy/index.ts:1-12](), [src/billy/billy.api.ts:1-10](), [src/billy/billyManifest.ts:1-15]()

## Core Integration Architecture

To extend Billy, a new platform must implement a handler that translates platform-specific events (e.g., messages, comments, web requests) into a `BillyRequest` and processes the resulting `BillyResponse`.

```mermaid
graph TD
    subgraph Platforms
        Web[Web Interface]
        Discord[Discord Bot]
        Reddit[Reddit/Devvit]
        NewPlatform[New Platform]
    end

    subgraph BillyCore[Billy Core Engine]
        API[billy.api.ts]
        Config[billy.config.ts]
        Manifest[billyManifest.ts]
    end

    Web -->|BillyRequest| API
    Discord -->|BillyRequest| API
    Reddit -->|BillyRequest| API
    NewPlatform -->|BillyRequest| API

    API --> Config
    API --> Manifest
    API -->|BillyResponse| NewPlatform
```
*The diagram shows the hub-and-spoke model where multiple platforms interface with the centralized Billy API.*

### The BillyRequest Interface
Every integration must construct a `BillyRequest` object. This structure provides the necessary context for Billy to adjust his voice and behavior based on the platform and user interaction mode.

| Field | Type | Description |
| :--- | :--- | :--- |
| `query` | `string` | The user's input message. |
| `mode` | `BillyRequestMode` | Interaction mode: `chat`, `drop`, `reflect`, `insight`, or `about`. |
| `platform` | `BillyPlatform` | The source platform: `web`, `discord`, `reddit`, or `api`. |
| `sessionId` | `string` | (Optional) Used for maintaining PLK continuity. |
| `userId` | `string` | (Optional) Hashed identifier for the user. |

Sources: [src/billy/billy.api.ts:21-36](), [src/billy/index.ts:34-44]()

## Implementing a Platform Launcher

Extending Billy requires creating a launcher or handler module similar to `billy.discord.ts` or `billy.reddit.ts`. These modules are responsible for managing connection state, registering commands, and formatting Billy's responses to fit the platform's UI constraints.

### Platform-Specific Configurations
Behavioral adjustments are managed in `billy.config.ts` under the `BillyPlatformConfig` object. When adding a new platform, developers should define token limits and feature support (e.g., streaming, threading).

```typescript
export const BillyResponseConfig = {
  maxTokens: {
    discord: 800,
    reddit: 1200,
    web: 2000,
    api: 4000,
  }
};
```
Sources: [src/billy/billy.config.ts:20-27](), [src/billy/billy.api.ts:109-114]()

### Request Lifecycle Flow
The following sequence illustrates how a platform integration interacts with the core engine:

```mermaid
sequenceDiagram
    participant P as New Platform
    participant API as billy.api.handleBillyRequest
    participant RD as Crisis & Rate Limit
    participant RAG as retrieveContext (Supabase)
    participant LLM as callLLM (Groq/Gemini)

    P->>API: handleBillyRequest(req)
    API->>RD: Check Crisis Signals/Rate Limits
    alt Crisis Detected
        RD-->>API: Crisis Response
        API-->>P: Standardized Crisis Protocol
    else Safe
        API->>RAG: Fetch Knowledge Chunks
        RAG-->>API: BillySources[]
        API->>LLM: Generate Response (System Prompt + Context)
        LLM-->>API: Response string
        API-->>P: BillyResponse
    end
```
*This flow ensures that platform-specific extensions benefit from global safety protocols like crisis detection.*

Sources: [src/billy/billy.api.ts:182-240](), [src/billy/billy.discord.ts:114-142]()

## Behavioral Adaptation (PLK & Modes)

New platforms should leverage Billy's interaction modes to provide specialized functionality. Each mode alters the system prompt and Billy's processing logic.

### Interaction Modes

- **Chat**: Standard conversation mode where Billy meets the user at their current "frequency."
- **Drop (Bucket Drop)**: Raw thought capture designed for low-friction, high-velocity input (e.g., `/drop` in Discord).
- **Reflect (Loom)**: Iterative refinement to untangle complex thoughts, often utilizing threads or multi-step interactions.
- **Insight**: Crystallizing specific "lightning bolt" moments.
- **About**: A public endpoint for Billy to introduce himself using the `BillyManifest`.

### Response Formatting
Each platform is responsible for formatting the `BillyResponse`. For example, Reddit integrations use a specific markdown footer, while Discord utilizes `EmbedBuilder`.

```typescript
function formatRedditResponse(reply: string, resonanceCheck?: string): string {
  const footer = `\n\n---\n*Billy — [GestaltView](...) · Not a chatbot. A presence.*`;
  const resonance = resonanceCheck ? `\n\n*${resonanceCheck}*` : "";
  return reply + resonance + footer;
}
```
Sources: [src/billy/billy.api.ts:95-107](), [src/billy/billy.reddit.ts:46-50](), [src/billy/billy.config.ts:58-74]()

## Security and Diagnostics

Integrations must respect the security layer established in `api/billy.ts` and `billy.api.ts`.

1.  **Authentication**: Protected endpoints (chat, drop, reflect) require an `Authorization: Bearer <BILLY_API_SECRET>` header.
2.  **Rate Limiting**: Platforms should provide a unique identifier (IP, UserID, or SessionID) to the `handleBillyRequest` to enforce in-memory or Redis-based rate limiting.
3.  **Readiness Checks**: Developers can use the `Billy.diagnose()` method to verify that environment variables (Groq, Gemini, Supabase keys) are correctly configured before launching a new platform client.

| Diagnostic Key | Required Environment Variable |
| :--- | :--- |
| `groq` | `GROQ_API_KEY` |
| `gemini` | `GOOGLE_API_KEY` |
| `supabase` | `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` |
| `billyApiSecret` | `BILLY_API_SECRET` |

Sources: [src/billy/index.ts:81-92](), [src/billy/billy.api.ts:74-88](), [api/billy.ts:31-36]()

## Summary

Extending Billy to new platforms is a process of "wrapping" the core API. By adhering to the `BillyRequest` structure and utilizing the global `BillyConfig`, developers can ensure that Billy's neurodivergent-friendly, trauma-informed presence remains consistent whether he is accessed via a CLI, a mobile app, or a new social media integration. The core engine handles the complex RAG (Retrieval-Augmented Generation) pipeline and LLM orchestration, leaving the platform layer to focus on user experience and interface-specific nuances.

Sources: [src/billy/index.ts:1-20](), [src/billy/billyManifest.ts:70-90]()
