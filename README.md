# WareFlow WMS — Ready-to-deploy demo

This project contains a simple yet production-structured WMS demo:
- Express backend (server.js)
- Single-page React + JS dashboard (public/index.html)
- Dockerfile + render.yaml for Render auto-deploy
- Sample data in data.json (includes low-stock examples)

## Goal
You asked for a web-based WMS with the dashboard in your screenshot. This package provides that UI and API. I cannot directly deploy to a public URL from here, but you can get a live URL with **two clicks** by connecting this repo to Render or by using Docker+your server provider.

### Option A — Deploy on Render (recommended, easiest)
1. Create a GitHub repository and push this project there (or upload ZIP contents directly on GitHub web UI).
2. Sign up / sign in to https://render.com and go to **Dashboard → New → Web Service**.
3. Choose **Connect a repository** and select the GitHub repo you pushed.
4. Render will detect the `render.yaml` and Dockerfile and use them. Click **Create Web Service**.
5. Render will build and provide a public URL (e.g. `https://wareflow-wms.onrender.com`).

### Option B — Docker on any server
1. Build and run:
   ```bash
   docker build -t wareflow-wms:latest .
   docker run -p 3000:3000 wareflow-wms:latest
   ```
2. Visit `http://<server-ip>:3000`

### Option C — Local (Node.js)
```bash
npm install
npm start
# open http://localhost:3000
```

## After deploy
- Open the web UI. Add / receive products using the "Create / Receive" panel.
- The dashboard shows low-stock alerts automatically (items where `minQty > qty`).

## If you want, I can:
- Prepare the GitHub repo and push it for you (you must provide a GitHub token or grant access), or
- Prepare a Render one-click deploy if you give me permission to create the repo (I cannot operate your Render/GitHub accounts from here).