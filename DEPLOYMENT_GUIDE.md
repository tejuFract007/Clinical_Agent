# Deployment Guide: Clinical AI Agent

## Only Read This If You Are Deploying to the Internet (Render, Vercel, etc.)

The reason your app stopped working when you turned off your laptop is because the **Frontend (UI)** was trying to talk to the **Backend (Brain)** on your laptop (`localhost`).

To fix this, we need to put the **Backend** on the internet too.

### Step 1: Deploy the Backend (Python Server)

1.  Push your code to GitHub.
2.  Go to **Render.com** -> **New** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Root Directory**: `Ai-agent` (or leave empty if it's the root of the repo)
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `python server.py`
5.  Click **Deploy**.
6.  Once finished, Render will give you a URL like: `https://my-clinical-agent.onrender.com`. **Copy this URL.**

### Step 2: Update the Frontend (React UI)

Now we need to tell the Frontend to talk to the *new* backend URL, not `localhost`.

1.  Go to your **Frontend Project** in Render (Static Site).
2.  Go to **Environment** (or Environment Variables).
3.  Add a new variable:
    *   **Key**: `VITE_API_URL`
    *   **Value**: `https://my-clinical-agent.onrender.com` (The URL you copied in Step 1).
    *   *Note: Do not add a trailing slash `/` at the end.*
4.  **Save** and **Trigger a Manual Deploy** (Clear cache and deploy).

### How it works now

*   **Local Development**: When you run `npm run dev` on your laptop, it uses the `.env` file which says `http://localhost:8000`. matches your local server.
*   **Production**: When Render builds your site, it sees the `VITE_API_URL` variable and "bakes" it into the code. Your live site will now talk to your live backend.

### Troubleshooting

*   **CORS Error**: If you see "CORS" errors in the browser console, checking `server.py` lines 21-28. We currently allow all origins (`*`) so this should work fine.
*   **Connection Refused**: This means the Backend is sleeping or crashed. Check the Backend logs in Render.
