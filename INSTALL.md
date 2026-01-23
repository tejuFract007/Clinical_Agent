# AI Clinical Agent - Installation & Setup Guide

This project consists of a Python-based AI backend and a React (Vite) frontend. Follow the instructions below to set up the development environment.

## Prerequisites

- **Node.js**: v18 or later (for the frontend)
- **Python**: v3.10 or later (for the backend)
- **OpenAI API Key**: Required for the AI agent to function.

## 1. Environment Configuration

Before running the application, ensure you have a `.env` file in the root directory (`Ai-agent/`) with your API keys.

**Example `.env` file:**
```ini
OPENAI_API_KEY=sk-...
```

## 2. Backend Setup (Python)

The backend runs on FastAPI and handles the AI logic.

1.  **Navigate to the root directory**:
    The generic root folder containing `server.py`.

2.  **Create a Virtual Environment** (Recommended):
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # Mac/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Start the Server**:
    ```bash
    python server.py
    ```
    - The backend will start on: `http://localhost:8000`
    - API Documentation: `http://localhost:8000/docs`

## 3. Frontend Setup (React/Vite)

The frontend provides the user interface for the Consultant Dashboard and Agent Chat.

1.  **Open a new terminal** and navigate to the `client` folder:
    ```bash
    cd client
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    - The frontend will typically start on: `http://localhost:5173` (or the port shown in the terminal).

## 4. Usage

1.  Open the frontend URL in your browser.
2.  Ensure the backend server is running in the background.
3.  The frontend will connect to the backend API at `http://localhost:8000`.

## Troubleshooting

-   **Backend Fails to Start**: Ensure you have activated the virtual environment and installed all requirements.
-   **Frontend Connection Error**: Check if the backend is running on port 8000. If the backend port differs, update the generic fetch calls or environment variables in the frontend.
