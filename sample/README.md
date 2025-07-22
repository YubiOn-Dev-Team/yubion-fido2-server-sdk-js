# YubiOn FIDO2 Server Service SDK Demo

This is a sample application demonstrating how to use the YubiOn FIDO2 Server Service SDK for both server-side (Node.js/Express) and client-side (Vue.js) development.

This application provides basic user registration and login functionality using FIDO2 passkeys.

## Prerequisites

Before running the sample, you need to configure RP settings in the FSS management web console.

1.  **Register Your RP (Relying Party)**
    *   In the FSS management web, register your application as a new RP.
    *   For development, you can use any domain name ending in `.localhost` as the RP ID (e.g., `your-app.localhost`).

2.  **Create an API Key**
    *   For the registered RP, create a new API key.
    *   Set the **API auth type** to **"Nonce sign auth"**.

3.  **Set Up Environment Variables**
    *   Create a `.env` file in the `sample/server` directory by copying the `.env.sample` file.
    *   Fill in the values for `FSS_RP_ID`, `FSS_API_KEY_ID`, and `FSS_API_SECRET` with the information from the FSS management web.
    *   Set `SESSION_SECRET` to a long, random string to secure user sessions.
    *   Set `CLIENT_ORIGIN_URL` to the URL of the client application (e.g., `http://your-app.localhost:5173`). This is required for CORS.

## Running the Application

### 1. Start the Backend Server

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm ci

# Start the development server
npm run dev
```
The server will be running on `http://localhost:3000`.

### 2. Start the Frontend Client

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm ci

# Start the development server
npm run dev
```
The client development server will be running on a port like `http://localhost:5173`.

### 3. Access the Application

To ensure passkey registration and authentication work correctly, you must access the application using the **RP ID** you configured, not `localhost`.

1.  Open your browser and navigate to:
    `http://<your-RP-ID>:<client-port>`

    For example, if your RP ID is `your-app.localhost` and the client is on port `5173`, you would go to `http://your-app.localhost:5173`.

    *Note 1: You may need to edit your local `hosts` file to point your RP ID to `127.0.0.1` if it's not a `.localhost` domain.*  
    *Note 2: Passkey authentication via unencrypted HTTP communication is not permitted when accessing domains other than local domains. HTTPS communication is required when using this for official services.*  

### 4. Check API Logs

You can monitor the API calls made from this sample application to the FSS in the FSS management web console.

*   Navigate to **RP Detail** -> **API Log** for your registered RP.
