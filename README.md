# Weather Intelligence App - Deployment Guide
This repository contains the Weather Intelligence App generated using Google AI Studio App Build and deployed seamlessly onto Cloudflare Pages.

---

## 🚀 Deployment Workflow

### Phase 1: AI Studio to GitHub Integration
1. **App Generation:** The core application logic, frontend dashboard components, and client-side integration with the keyless public Open-Meteo APIs were generated using **Google AI Studio App Build**.
2. **Repository Sync:** Using the direct **Connect to GitHub** option inside Google AI Studio, the generated source files were securely pushed directly into this approved version-controlled repository.
3. **Artifact Verification:** The repository successfully synchronizes and holds the structural application elements including `package.json`, configuration files, and the React source assets under `/src`.

### Phase 2: Cloudflare Pages Continuous Deployment
1. **Git Connection:** Inside the Cloudflare Dashboard under **Workers & Pages**, a new Pages project was provisioned by linking this exact GitHub repository.
2. **Build Configurations:** The deployment engine compiles the production-ready assets utilizing the following environmental framework presets:
   - **Framework Preset:** Vite (or custom React)
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
3. **Production Release:** Cloudflare automatically executes the build script upon repository tracking and initializes a live, publicly accessible `*.pages.dev` URL endpoint.

---

## 🔒 Responsible AI & Security Compliance
**Keyless Architecture:** This application interfaces exclusively with the public Open-Meteo Geocoding and Forecast API endpoints. It requires no client data, employee data, customer personal information, or private API/Gemini keys.
**Compliance Boundary:** In strict adherence to organizational InfoSec guidelines, Cloudflare platform access is provisioned and utilized solely for this specific project deployment lifecycle.


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/07e36c1c-aa04-40b5-8311-75bd5809f285

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
