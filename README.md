# 🛡️ FakeShield — Fake Image Detection System

A full-stack AI-powered web application that detects whether an uploaded image is **REAL** or **FAKE (deepfake / manipulated)** using a trained CNN model.

Built as a college final-year / capstone project using the **MERN stack + Python Flask + TensorFlow**.

---

## 📸 Screenshots

The app features:
- Dark, glassmorphism UI with animated scan effects
- Drag & drop image upload with live preview
- Real-time confidence score and prediction result
- Full history dashboard with filtering and pagination
- Admin panel with system-wide statistics

---

## 🧠 Tech Stack

| Layer        | Technology                                      |
|-------------|--------------------------------------------------|
| Frontend    | React 18, Vite, TailwindCSS, React Router, Axios |
| Backend     | Node.js, Express.js, MongoDB, Mongoose, Multer   |
| Auth        | JWT (JSON Web Tokens), bcryptjs                  |
| ML Model    | Python, TensorFlow/Keras, CNN                    |
| ML API      | Flask, OpenCV, Flask-CORS                        |
| Database    | MongoDB (local or Atlas)                         |

---

## 📁 Project Structure

```
fake-image-detection/
│
├── ml_model/                  # CNN Model training
│   ├── train_model.py         # Full training pipeline
│   ├── predict.py             # CLI prediction utility
│   ├── requirements.txt
│   └── model/                 # Saved model output
│       ├── fake_image_model.h5
│       └── training_history.json
│
├── flask_api/                 # ML inference API
│   ├── app.py                 # Flask server
│   └── requirements.txt
│
├── server/                    # Node.js/Express backend
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── detectionController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Detection.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── detectionRoutes.js
│   ├── uploads/               # Stored images
│   ├── server.js
│   └── package.json
│
└── client/                    # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── UploadBox.jsx
    │   │   └── ResultCard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Detect.jsx
    │   │   ├── History.jsx
    │   │   └── AdminPanel.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js >= 18
- Python >= 3.9
- MongoDB (local) or MongoDB Atlas URI
- pip / virtualenv

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fake-image-detection.git
cd fake-image-detection
```

---

### 2. Set Up the ML Model

```bash
cd ml_model
pip install -r requirements.txt
```

**Prepare dataset** (see Dataset Sources below):
```
ml_model/
└── dataset/
    ├── train/
    │   ├── real/   ← put real images here
    │   └── fake/   ← put fake/deepfake images here
    └── validation/
        ├── real/
        └── fake/
```

**Train the model:**
```bash
python train_model.py
```
This saves `model/fake_image_model.h5`.

> 💡 **Skip training for now?**  
> The Flask API returns demo predictions if the model file is missing — you can still run the full app.

---

### 3. Set Up the Flask ML API

```bash
cd flask_api
pip install -r requirements.txt
python app.py
```

Flask API will run on **http://localhost:5001**

Test it:
```bash
curl -X GET http://localhost:5001/health
```

---

### 4. Set Up the Node.js Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fake_image_detection
JWT_SECRET=your_super_secret_key_at_least_32_chars
JWT_EXPIRES_IN=7d
FLASK_API_URL=http://localhost:5001
MAX_FILE_SIZE_MB=10
```

Start the backend:
```bash
npm run dev
```

Backend runs on **http://localhost:5000**

---

### 5. Set Up the React Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

### 6. Create an Admin Account

Register normally, then promote to admin via MongoDB shell or Compass:

```javascript
// In MongoDB shell
use fake_image_detection
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## 🌐 API Reference

### Auth Routes

| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| POST   | /api/auth/register    | Register new user    | No   |
| POST   | /api/auth/login       | Login user           | No   |
| GET    | /api/auth/me          | Get current user     | Yes  |

### Detection Routes

| Method | Endpoint                  | Description              | Auth  |
|--------|---------------------------|--------------------------|-------|
| POST   | /api/detect               | Upload & analyze image   | Yes   |
| GET    | /api/detect/history       | Get user's history       | Yes   |
| GET    | /api/detect/:id           | Get single detection     | Yes   |
| DELETE | /api/detect/:id           | Delete detection         | Yes   |
| GET    | /api/detect/admin/stats   | System stats             | Admin |

### Flask ML API

| Method | Endpoint      | Description              |
|--------|---------------|--------------------------|
| POST   | /predict      | Predict real/fake        |
| GET    | /health       | Health check             |

**POST /predict — Example:**
```bash
curl -X POST http://localhost:5001/predict \
  -F "image=@/path/to/image.jpg"
```
Response:
```json
{
  "prediction": "FAKE",
  "confidence": 0.92,
  "raw_score": 0.08
}
```

---

## 🔄 Application Workflow

```
User Uploads Image
       ↓
React Frontend (Axios POST /api/detect)
       ↓
Node.js Backend (Multer saves image)
       ↓
Backend → Flask API POST /predict (FormData)
       ↓
Flask → TensorFlow CNN Model
       ↓
Prediction { "FAKE" | "REAL", confidence }
       ↓
Backend saves Detection to MongoDB
       ↓
Response → Frontend displays result
```

---

## 🧪 CNN Model Architecture

```
Input: 128×128×3 RGB Image
  ↓
Conv2D(32) → BN → Conv2D(32) → BN → MaxPool → Dropout(0.25)
  ↓
Conv2D(64) → BN → Conv2D(64) → BN → MaxPool → Dropout(0.25)
  ↓
Conv2D(128) → BN → Conv2D(128) → BN → MaxPool → Dropout(0.4)
  ↓
Conv2D(256) → BN → MaxPool → Dropout(0.4)
  ↓
GlobalAveragePooling2D
  ↓
Dense(512) → BN → Dropout(0.5)
  ↓
Dense(256) → Dropout(0.3)
  ↓
Dense(1, sigmoid)  →  Output: [0,1]
                       0 = FAKE, 1 = REAL
```

---

## 📦 Dataset Sources

| Dataset | Description | Link |
|---------|-------------|-------|
| FaceForensics++ | DeepFake video frames | https://github.com/ondyari/FaceForensics |
| DFDC (Kaggle) | DeepFake Detection Challenge | https://www.kaggle.com/c/deepfake-detection-challenge |
| 140k Real & Fake Faces | Pre-labeled dataset | https://www.kaggle.com/datasets/xhlulu/140k-real-and-fake-faces |
| CASIA Image Tampering | Manipulated images | https://www.kaggle.com/datasets/sophatvathana/casia-dataset |
| Real vs AI Generated | Binary classification | https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images |

**Recommended for quick start:** `140k Real & Fake Faces` on Kaggle — already split into real/fake.

---

## 🔒 Security Features

- Passwords hashed with bcryptjs (12 salt rounds)
- JWT authentication with expiry
- Multer file validation (type + size limits)
- Protected API routes via middleware
- CORS restricted to frontend origin
- Input validation on all routes

---

## 🚀 Production Deployment

**Backend:** Deploy to Railway, Render, or any Node.js host
**Frontend:** Build with `npm run build`, deploy to Vercel/Netlify
**Flask API:** Deploy to Render or a Python-capable cloud VM
**MongoDB:** Use MongoDB Atlas for production

```bash
# Build frontend
cd client && npm run build

# Start backend in production
cd server && NODE_ENV=production node server.js

# Start Flask with gunicorn
cd flask_api && gunicorn -w 2 -b 0.0.0.0:5001 app:app
```

---

## 👥 Team / Credits

Built as a Final Year Capstone Project — MERN Stack + AI/ML.

---

## 📄 License

MIT License — free for educational use.
