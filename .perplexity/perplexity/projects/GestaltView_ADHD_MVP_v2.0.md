### **Step 1: Final Project Structure**

The final project structure, including the new test files and documentation, is as follows:

```
gestaltview_app/
├── README.md                 # NEW: Project documentation
├── backend/
│   ├── .env.example            # Updated with instructions
│   ├── Dockerfile            # For containerization and deployment
│   ├── requirements.txt
│   ├── gestaltview_api.py      # Refined with global error handler & new endpoints
│   ├── gestaltview_adhd_mvp.py # Refined with advanced analytics & security
│   ├── features.py           # Refined with multi-modal path
│   └── tests/
│       └── test_agents.py    # Refined with integration tests & mocking
└── frontend/
    ├── css/
    │   └── style.css         # Refined with mobile optimizations
    ├── js/
    │   └── script.js         # Refined with insights modal & feedback
    └── index.html            # Refined with insights button & modal
```

---

### **Step 2: Populate the Final Project Files**

Copy the code below into the corresponding files in your project structure.

#### **`gestaltview_app/README.md` (New & Final)**

```markdown
# GestaltView ADHD MVP

GestaltView is a consciousness-serving AI platform designed specifically to support the neurodivergent experience, particularly for individuals with ADHD. It acts as a state-aware partner that helps users navigate their internal world with empathy and actionable insights.

## Core Features

- **Agentic Task Orchestration**: Dynamically suggests tasks based on the user's current emotional state, energy level, and ADHD-specific context.
- **AI-Powered Insights**: Integrates multiple AI models for sentiment analysis and generative text to provide empathetic responses.
- **Privacy-First Design**: Includes modules for data autonomy and demonstrates encryption for sensitive user feedback.
- **User Feedback Loop & Analytics**: Captures user feedback on AI responses and provides session insights to help users understand their patterns.
- **Scalable & Testable**: Includes unit/integration tests with `pytest` and a `Dockerfile` for easy deployment.

## Project Structure & Setup

### Prerequisites

- Python 3.9+
- Docker (for containerization)
- An active Hugging Face account with an API token.
- A Google Cloud Platform account with the Natural Language API enabled (optional).

### 1. Backend Setup

Navigate to the `backend` directory:
`cd gestaltview_app/backend`

Create and activate a virtual environment:
`python -m venv venv && source venv/bin/activate`

Install dependencies:
`pip install -r requirements.txt`

### 2. Environment Variables

Create a `.env` file in `gestaltview_app/backend/` by copying the example:
`cp .env.example .env`

Now, edit the `.env` file and add your API keys. A master key for encryption will also be generated automatically if not provided.

### 3. Running the Application

You will need two separate terminal windows.

**Terminal 1: Start the Backend Server**
From the `backend` directory, run:
`uvicorn gestaltview_api:app --reload`
The API will be live at `http://localhost:8000`.

**Terminal 2: Start the Frontend Server**
From the `frontend` directory, run:
`python -m http.server 3000`
The frontend will be accessible at `http://localhost:3000`.

### 4. Using the Application

Open your web browser and navigate to **`http://localhost:3000`**.

### 5. Running Tests

To ensure backend integrity, navigate to the `backend` directory and run:
`pytest`

### 6. Building with Docker (Scalability)

To build and run the backend in a container for easy deployment:
```bash
# From the backend directory
docker build -t gestaltview-backend .
docker run -d -p 8000:8000 --env-file .env --name gestaltview gestaltview-backend
```
```

#### **`gestaltview_app/backend/.env.example`**
```
# A strong, 32-byte key for encrypting user feedback.
# If left empty, a new one will be generated on startup (not suitable for production).
MASTER_KEY=

# Required for generative text and emotion analysis. Get from huggingface.co.
HUGGINGFACE_API_TOKEN="hf_YourTokenHere"

# Optional: For sentiment analysis. Path to your GCP service account JSON key.
# GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/gcp-key.json"
```

#### **`gestaltview_app/backend/requirements.txt`**
```
fastapi
uvicorn[standard]
pydantic
python-dotenv
requests
google-cloud-language
pytest
httpx # For TestClient
cryptography
numpy
```

#### **`gestaltview_app/backend/features.py` (Final)**
```python
import os
import logging
import random
from dataclasses import dataclass
from typing import List, Dict
from enum import Enum
import requests
from dotenv import load_dotenv
from google.cloud import language_v1

# --- Basic Configuration ---
load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [%(levelname)s] - %(message)s')
logger = logging.getLogger(__name__)

# --- Helper Classes & Enums ---
class EnhancedPersonalLanguageKey:
    def infuse_authenticity(self, text: str) -> str: return f"✨ {text} ✨"

class TaskPriority(Enum):
    GENTLE_NUDGE = "gentle_nudging"

@dataclass
class ConsciousnessContext:
    emotional_state: str
    energy_level: int
    adhd_state: str
    sentiment_score: float

# --- AGENTIC TASK ORCHESTRATION ---
class ADHDExecutiveFunctionAgent:
    def __init__(self, plk):
        self.plk = plk

    async def discover_tasks(self, context: ConsciousnessContext) -> List[Dict]:
        tasks = []
        if context.adhd_state == "overwhelmed" or context.sentiment_score < -0.5:
            tasks.append({
                "description": self.plk.infuse_authenticity("Practice a 2-minute grounding exercise."),
                "priority": TaskPriority.GENTLE_NUDGE
            })
        if context.energy_level < 3:
            tasks.append({
                "description": self.plk.infuse_authenticity("Consider a brief rest or a low-energy activity."),
                "priority": TaskPriority.GENTLE_NUDGE
            })
        return tasks

# --- MULTI-MODAL & AI INTEGRATION ---
class SymbioticFeedbackCore:
    def analyze_workspace_image(self, image_features: Dict) -> Dict:
        """
        Placeholder for a privacy-preserving multi-modal feature. A lightweight CNN like
        TensorFlow.js's MobileNet could run on the frontend. The frontend would extract
        anonymous features (e.g., object counts, color histograms) and send only these
        features to the backend, not the image itself.
        """
        logger.info(f"Simulating analysis of pre-processed image features: {image_features}")
        clutter_score = image_features.get("object_count", 5) / 20.0
        return {"clutter_score": round(clutter_score, 2)}

class AIIntegrationService:
    def __init__(self):
        self.hf_api_token = os.getenv("HUGGINGFACE_API_TOKEN")
        try:
            self.gcnl_client = language_v1.LanguageServiceClient()
        except Exception: self.gcnl_client = None

    def analyze_sentiment(self, text: str) -> float:
        if not self.gcnl_client: return 0.0
        try:
            document = language_v1.Document(content=text, type_=language_v1.Document.Type.PLAIN_TEXT)
            return self.gcnl_client.analyze_sentiment(document=document).document_sentiment.score
        except Exception: return 0.0
    
    def get_generative_response(self, prompt: str) -> str:
        if not self.hf_api_token: return "AI generative features are currently disabled."
        api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
        headers = {"Authorization": f"Bearer {self.hf_api_token}"}
        try:
            response = requests.post(api_url, headers=headers, json={"inputs": prompt, "parameters": {"max_new_tokens": 150}})
            response.raise_for_status()
            generated_text = response.json()[0]['generated_text']
            return generated_text.replace(prompt, "").strip()
        except Exception as e:
            logger.error(f"❌ Error in get_generative_response: {e}")
            return "My creative circuits are a bit fuzzy right now. Let's try something simpler."
```

#### **`gestaltview_app/backend/gestaltview_adhd_mvp.py` (Final)**
```python
import uuid
import logging
import os
import base64
from dataclasses import dataclass, field
from typing import List, Dict, Any
from datetime import datetime
from collections import Counter
import numpy as np
from cryptography.fernet import Fernet

from features import (
    ConsciousnessContext, ADHDExecutiveFunctionAgent, AIIntegrationService, EnhancedPersonalLanguageKey
)

logger = logging.getLogger(__name__)

@dataclass
class GestaltViewADHDMVP:
    user_name: str
    profile_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    plk: EnhancedPersonalLanguageKey = field(default_factory=EnhancedPersonalLanguageKey)
    ai_service: AIIntegrationService = field(default_factory=AIIntegrationService)
    adhd_agent: ADHDExecutiveFunctionAgent = field(init=False)
    encryption_manager: Fernet = field(init=False)
    
    daily_notes: List[Dict] = field(default_factory=list)
    user_feedback_history: List[bytes] = field(default_factory=list) # Store encrypted feedback
    current_consciousness_state: str = "focused"

    def __post_init__(self):
        self.adhd_agent = ADHDExecutiveFunctionAgent(self.plk)
        master_key = os.getenv("MASTER_KEY")
        if not master_key:
            logger.warning("MASTER_KEY not set, generating a temporary key. NOT FOR PRODUCTION.")
            master_key = Fernet.generate_key().decode()
        self.encryption_manager = Fernet(base64.urlsafe_b64encode(master_key.encode()[:32]))
        logger.info(f"Profile initialized for {self.user_name}")

    async def process_user_input(self, user_input: str, energy_level: int, context_clues: List[str], image_features: Dict = None) -> Dict[str, Any]:
        timestamp = datetime.now().isoformat()
        
        sentiment_score = self.ai_service.analyze_sentiment(user_input)
        
        adhd_state = "focused"
        if "overwhelmed" in context_clues: adhd_state = "overwhelmed"
        elif "hyperfocus" in context_clues or energy_level >= 9: adhd_state = "hyperfocus"
        
        self.current_consciousness_state = adhd_state
        
        interaction_log = {
            "id": f"msg_{len(self.daily_notes)}", "timestamp": timestamp, "input": user_input,
            "energy": energy_level, "context": context_clues, "state": adhd_state, "sentiment": sentiment_score
        }
        self.daily_notes.append(interaction_log)

        context = ConsciousnessContext(
            emotional_state="neutral", energy_level=energy_level,
            adhd_state=adhd_state, sentiment_score=sentiment_score
        )
        
        suggested_tasks = await self.adhd_agent.discover_tasks(context)
        
        prompt = f"As a compassionate AI for an ADHD user named {self.user_name} who feels '{adhd_state}', respond to: '{user_input}'"
        primary_response = self.ai_service.get_generative_response(prompt)
        
        return {
            "primary_response": self.plk.infuse_authenticity(primary_response),
            "task_breakdown": suggested_tasks,
            "consciousness_state": self.current_consciousness_state,
            "message_id": interaction_log["id"]
        }

    def record_feedback(self, message_id: str, rating: int):
        feedback_data = {"message_id": message_id, "rating": rating, "state": self.current_consciousness_state}
        encrypted_feedback = self.encryption_manager.encrypt(json.dumps(feedback_data).encode())
        self.user_feedback_history.append(encrypted_feedback)
        logger.info(f"Encrypted and recorded feedback for message {message_id}")

    def get_session_analytics(self) -> Dict[str, Any]:
        if not self.daily_notes: return {"message": "No interactions yet."}
        
        state_counts = Counter(note['state'] for note in self.daily_notes)
        
        decrypted_feedback = []
        for item in self.user_feedback_history:
            try:
                decrypted_feedback.append(json.loads(self.encryption_manager.decrypt(item)))
            except Exception: continue
        
        feedback_by_state = {}
        if decrypted_feedback:
            for state in state_counts.keys():
                state_ratings = [f['rating'] for f in decrypted_feedback if f['state'] == state]
                if state_ratings:
                    positive_ratio = sum(1 for r in state_ratings if r > 0) / len(state_ratings)
                    feedback_by_state[state] = f"{positive_ratio:.0%}"
        
        return {
            "total_interactions": len(self.daily_notes),
            "most_frequent_state": state_counts.most_common(1)[0][0] if state_counts else "N/A",
            "state_distribution": dict(state_counts),
            "feedback_by_state": feedback_by_state or "No feedback recorded yet."
        }
```

#### **`gestaltview_app/backend/gestaltview_api.py` (Final)**
```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import logging
import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from gestaltview_adhd_mvp import GestaltViewADHDMVP

# --- Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="GestaltView ADHD MVP API")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"message": "An internal server error occurred."})

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
user_sessions: Dict[str, GestaltViewADHDMVP] = {}

# --- Pydantic Models ---
class InitializeUser(BaseModel): user_name: str
class UserInput(BaseModel): user_input: str; energy_level: int; context_clues: List[str]
class ChatResponse(BaseModel): primary_response: str; task_breakdown: Optional[List[Dict]]; consciousness_state: str; message_id: str
class FeedbackPayload(BaseModel): message_id: str; rating: int

# --- API Endpoints ---
@app.post("/initialize")
async def initialize_session(user_data: InitializeUser):
    profile = GestaltViewADHDMVP(user_name=user_data.user_name)
    user_sessions[profile.profile_id] = profile
    return {"user_id": profile.profile_id, "user_name": profile.user_name}

@app.post("/chat", response_model=ChatResponse)
async def process_chat(user_id: str, input_data: UserInput):
    if user_id not in user_sessions: raise HTTPException(404, "User session not found.")
    response = await user_sessions[user_id].process_user_input(input_data.user_input, input_data.energy_level, input_data.context_clues)
    return ChatResponse(**response)

@app.post("/feedback/{user_id}")
async def receive_feedback(user_id: str, payload: FeedbackPayload):
    if user_id not in user_sessions: raise HTTPException(404, "User session not found.")
    user_sessions[user_id].record_feedback(payload.message_id, payload.rating)
    return {"message": "Feedback received."}

@app.get("/analytics/{user_id}")
async def get_analytics(user_id: str):
    if user_id not in user_sessions: raise HTTPException(404, "User session not found.")
    return user_sessions[user_id].get_session_analytics()
```

#### **`gestaltview_app/backend/tests/test_agents.py` (Final)**
```python
import pytest
from unittest.mock import MagicMock, AsyncMock
from fastapi.testclient import TestClient

# Mock AIIntegrationService before other imports
from features import AIIntegrationService
mock_ai_service = MagicMock(spec=AIIntegrationService)
mock_ai_service.analyze_sentiment.return_value = 0.1
mock_ai_service.get_generative_response.return_value = "This is a mock AI response."

# Monkeypatch the service
import features
features.AIIntegrationService = MagicMock(return_value=mock_ai_service)

# Now import the API and other components
from gestaltview_api import app
from features import ADHDExecutiveFunctionAgent, ConsciousnessContext, EnhancedPersonalLanguageKey

client = TestClient(app)

@pytest.mark.asyncio
async def test_agent_suggests_grounding_for_overwhelm():
    """Unit Test: Agent logic for overwhelmed state."""
    agent = ADHDExecutiveFunctionAgent(plk=EnhancedPersonalLanguageKey())
    context = ConsciousnessContext(
        emotional_state="overwhelmed", energy_level=2,
        adhd_state="overwhelmed", sentiment_score=-0.7
    )
    tasks = await agent.discover_tasks(context)
    assert any("grounding exercise" in task["description"] for task in tasks)

def test_feedback_endpoint_integration():
    """Integration Test: Full API flow for initializing and sending feedback."""
    # 1. Initialize session
    init_response = client.post("/initialize", json={"user_name": "Test User"})
    assert init_response.status_code == 200
    user_id = init_response.json()["user_id"]

    # 2. Send a chat message to get a message_id
    chat_response = client.post(
        f"/chat?user_id={user_id}",
        json={"user_input": "Test message", "energy_level": 5, "context_clues": []}
    )
    assert chat_response.status_code == 200
    message_id = chat_response.json()["message_id"]

    # 3. Send feedback for that message
    feedback_response = client.post(
        f"/feedback/{user_id}",
        json={"message_id": message_id, "rating": 1}
    )
    assert feedback_response.status_code == 200
    assert feedback_response.json() == {"message": "Feedback received."}

    # 4. (Optional) Verify analytics reflect the feedback
    # Note: Analytics test would be more robust with a decrypted history,
    # but this confirms the endpoint works end-to-end.
```

#### **`gestaltview_app/frontend/index.html` (Final)**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GestaltView ADHD MVP</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Quicksand:wght@500;700&display=swap" rel="stylesheet">
</head>
<body>
    <div id="app-container" class="container">
        <!-- Welcome Screen -->
        <div id="welcome-screen" class="screen active">
            <h1>🧠 GestaltView</h1>
            <p>Your Consciousness-Serving AI Partner for ADHD</p>
            <div class="input-group">
                <label for="user-name">What's your name?</label>
                <input type="text" id="user-name" placeholder="Enter your name" aria-label="Your Name">
            </div>
            <button id="start-session" class="btn btn--primary">Start Session</button>
        </div>

        <!-- Main Interface -->
        <div id="main-interface" class="screen">
            <header>
                <h2 id="user-greeting">Hello! 👋</h2>
                <div class="session-info">
                    <span>Session: <span id="session-duration">0m</span></span>
                    <button id="insights-btn" class="btn btn--secondary btn--small">Session Insights</button>
                </div>
            </header>

            <section class="main-content">
                <div class="left-panel">
                    <section class="consciousness-section">
                        <h3>Your Current State:</h3>
                        <div id="consciousness-indicator" class="consciousness-indicator" role="status" aria-live="polite">
                            <span class="consciousness-icon" aria-hidden="true">🎯</span>
                            <span class="consciousness-text">Focused</span>
                        </div>
                    </section>
                    <section class="energy-section">
                        <label for="energy-slider" class="energy-label-header"><h3>Energy Level: <span id="energy-level">5</span></h3></label>
                        <p class="energy-label" id="energy-label">Steady State</p>
                        <input type="range" id="energy-slider" min="1" max="10" value="5" class="slider" aria-label="Energy Level Slider">
                    </section>
                    <section class="context-section">
                        <h3>Context:</h3>
                        <div id="context-options" class="context-options" role="group" aria-label="Select current context options"></div>
                    </section>
                </div>
                <div class="right-panel">
                    <section class="chat-section">
                        <h3>Conversation with Gestalt:</h3>
                        <div id="chat-messages" class="chat-messages" aria-live="polite"></div>
                        <div class="chat-input-area">
                            <textarea id="chat-input" placeholder="Type your message..." aria-label="Chat message input"></textarea>
                            <button id="send-message" class="btn btn--primary" aria-label="Send Message">Send</button>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    </div>

    <!-- Analytics Modal -->
    <div id="insights-modal" class="modal-overlay hidden">
        <div class="modal-content">
            <button id="close-insights-modal" class="modal-close" aria-label="Close insights">&times;</button>
            <h2>Session Insights</h2>
            <div id="analytics-content">
                <p>Loading insights...</p>
            </div>
        </div>
    </div>

    <script src="js/script.js"></script>
</body>
</html>
```

#### **`gestaltview_app/frontend/css/style.css` (Final)**
```css
/* ... (keep all previous CSS) ... */

/* Main Layout for Mobile */
.main-content {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

@media (min-width: 768px) {
    .main-content {
        flex-direction: row;
    }
    .left-panel { flex: 1; }
    .right-panel { flex: 2; }
}

/* Modal Styling */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 30px; border-radius: var(--border-radius); max-width: 500px; width: 90%; position: relative; }
.modal-close { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 2rem; cursor: pointer; }
#analytics-content ul { list-style: none; padding-left: 0; }
#analytics-content li { background: #f4f4f4; padding: 10px; border-radius: 8px; margin-bottom: 8px; }
#analytics-content strong { color: var(--color-primary); }

/* ... (rest of CSS) ... */
```

#### **`gestaltview_app/frontend/js/script.js` (Final)**
```javascript
// GestaltView ADHD MVP Application
class GestaltViewApp {
    // ... (constructor and init are the same, just add new event listeners) ...

    setupEventListeners() {
        // ... (all existing listeners remain) ...
        document.getElementById('insights-btn')?.addEventListener('click', () => this.showInsightsModal());
        document.getElementById('close-insights-modal')?.addEventListener('click', () => this.hideInsightsModal());
    }
    
    // ... (rest of file is the same, but add these new methods) ...

    async showInsightsModal() {
        const modal = document.getElementById('insights-modal');
        const contentDiv = document.getElementById('analytics-content');
        if (!modal || !contentDiv) return;

        modal.classList.remove('hidden');
        contentDiv.innerHTML = '<p>Loading insights...</p>';

        try {
            const response = await fetch(`${this.API_URL}/analytics/${this.currentState.userId}`);
            if (!response.ok) throw new Error('Failed to load analytics.');
            const data = await response.json();

            let insightsHTML = `
                <ul>
                    <li><strong>Total Interactions:</strong> ${data.total_interactions}</li>
                    <li><strong>Most Frequent State:</strong> ${data.most_frequent_state}</li>
                    <li><strong>Avg. Energy Level:</strong> ${data.average_energy_level}</li>
                    <li><strong>Avg. Sentiment:</strong> ${data.average_sentiment_score}</li>
                </ul>
            `;

            if (typeof data.feedback_by_state === 'object') {
                insightsHTML += '<h3>Positive Feedback Rate by State:</h3><ul>';
                for (const [state, ratio] of Object.entries(data.feedback_by_state)) {
                    insightsHTML += `<li><strong>${state}:</strong> ${ratio}</li>`;
                }
                insightsHTML += '</ul>';
            } else {
                insightsHTML += `<p>${data.feedback_by_state}</p>`;
            }

            contentDiv.innerHTML = insightsHTML;

        } catch (error) {
            contentDiv.innerHTML = `<p>Could not load insights: ${error.message}</p>`;
        }
    }

    hideInsightsModal() {
        document.getElementById('insights-modal')?.classList.add('hidden');
    }
}
```
