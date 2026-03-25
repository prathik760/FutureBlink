# MERN AI Flow App

## Project Overview

This project is a simple MERN (MongoDB, Express, React, Node.js) application that demonstrates how to connect a frontend flow-based UI with a backend AI service and database.

Users can:

* Enter a prompt in a text input node
* Run the flow to generate an AI response
* View the response in a connected node
* Save the prompt and response to MongoDB

---

## Tech Stack

* **Frontend:** React (Vite) + React Flow
* **Backend:** Node.js + Express
* **Database:** MongoDB Atlas
* **AI Integration:** Google Gemini API

---

## Features

* Interactive flow UI using React Flow
* Backend API integration (secure AI calls)
* AI-generated responses using Gemini
* Save prompt & response to MongoDB
* Clean separation of frontend and backend

---

## Project Structure

```
mern-ai-flow/
├── client/   # React frontend
└── server/   # Express backend
```

---

##  Setup Instructions

### 1. Clone the Repository

```
git clone <your-repo-link>
cd mern-ai-flow
```

---

### 2. Backend Setup

```
cd server
npm install
```

#### Create `.env` file inside `server/`

```
PORT=5001
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

#### Run backend server

```
node index.js
```

Expected output:

```
Server running on port 5001
MongoDB Connected Successfully
```

---

### 3. Frontend Setup

```
cd client
npm install
npm run dev
```

App will run at:

```
http://localhost:5173
```

---

##  How to Use

1. Enter a prompt in the input node (e.g., "What is the capital of France?")
2. Click **Run Flow**
3. View AI response in the result node
4. Click **Save** to store data in MongoDB

---

## Database

* MongoDB Atlas is used for storing data
* Collection automatically created on first save
* Each record contains:

  * prompt
  * response
  * createdAt

---

## Environment Variables

| Variable       | Description               |
| -------------- | ------------------------- |
| MONGO_URI      | MongoDB connection string |
| GEMINI_API_KEY | Google Gemini API key     |
| PORT           | Backend server port       |

---

## Notes

* AI API is called from backend only (secure)
* Do not expose API keys in frontend
* MongoDB IP access must allow your IP or `0.0.0.0/0`

---

## Deployment

* **Frontend:** Vercel
* **Backend:** Render

Update API URLs in frontend after deployment.

---

## Demo

Include a short demo video showing:

* Running the flow
* Saving data
* MongoDB entry

---

## Author

Prathik Thelkar

---

## 📌 Summary

This project demonstrates:

This project demonstrates:

* Full MERN stack integration
* Third-party API usage
* Secure backend architecture
* Real-time UI updates with React Flow

---
