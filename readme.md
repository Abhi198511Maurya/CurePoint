# CurePoint

CurePoint is a **Doctor Appointment Booking Web App** with secure online payments via **Razorpay**.
It provides a seamless experience for patients, doctors, and admins to manage appointments, payments, and profiles — built with the **MERN stack** and styled with **Tailwind CSS**.

---

## ✨ Features

- 🔐 **Authentication with Email Verification** – Secure signup/login with email confirmation.
- 📅 **Book & Cancel Appointments** – Users can schedule or cancel appointments in real time.
- 💳 **Online Payment** – Integrated **Razorpay** for appointment fee payments.
- 🧑‍🤝‍🧑 **Multi-Role Access**  
  - **User:** Manage profile, book/cancel appointments, make payment history.
  - **Doctor:** Dashboard to manage profile and appointments.
  - **Admin:** Dashboard to add/manage doctors and oversee all appointments.
- 📊 **Doctor & Admin Dashboards** – Manage appointments, doctors, and user activity.
- 📱 **Responsive UI** – Works smoothly across devices.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Payments:** Razorpay API
- **Tooling:** ESLint, Prettier, Husky (pre-commit hooks)

---

## 📂 Project Structure
CurePoint/\
├── backend/ **Express server, API routes, models, controllers**\
├── frontend/ **React application**\
├── .eslintrc.* **ESLint configuration**\
├── .prettierrc **Prettier configuration**\
├── package.json\
└── README.md

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v22+ recommended)
- **npm**
- A running **MongoDB** instance (local or Atlas)
- Razorpay API keys

### 1️⃣ Clone the Repo
    ```bash
    git clone https://github.com/Abhi198511Maurya/CurePoint.git
    cd CurePoint

### 2️⃣ Install Dependencies
   Backend:

    ```bash
    cd backend
    npm install
   Frontend:

    ```bash
    cd ../frontend
    npm install

### 3️⃣ Environment Variables

Create a `.env` file inside the `backend/` folder:

    ```bash
    PORT=4000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    RAZORPAY_KEY_ID=your_key_id
    RAZORPAY_KEY_SECRET=your_key_secret

### 4️⃣ Run the App

In three separate terminals:\
   Backend:

    ```bash
    cd backend
    npm run server

   Frontend:

    ```bash
    cd frontend
    npm run dev

   Admin:

    ```bash
    cd frontend
    npm run dev

Visit `http://localhost:5173` in your browser.