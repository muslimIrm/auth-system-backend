# User Authentication & Management System (Backend)

A robust and secure backend authentication system built with **Node.js**, **Express**, and **MongoDB**. This project provides a complete flow for user registration, secure login with JWT, and session management using HTTP-only cookies.

## 🚀 Key Features

* **Secure Authentication:** Implementation of JWT (JSON Web Tokens) for stateless authentication.
* **Password Hashing:** Uses `bcrypt` to securely hash passwords before storing them in the database.
* **Database Integration:** Seamless connection to MongoDB using Mongoose with a pre-connection check before the server starts.
* **Validation:** Strict data validation for user inputs (email, username, password) using the `Joi` library.
* **Session Management:** Dedicated `Token` model to manage active sessions and provide automatic data expiration (TTL).
* **CORS & Security:** Configured to allow secure cross-origin requests from specific frontend URLs with credential support.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js (v5.2.1)
* **Database:** MongoDB via Mongoose (v9.1.2)
* **Security:** `bcrypt`, `jsonwebtoken`, `mongoose-unique-validator`
* **Utilities:** `cookie-parser`, `dotenv`, `cors`, `nodemailer`

## 📂 Project Structure

* `app.js`: The main entry point of the application where middleware and routes are initialized.
* `/routers`: Contains API route definitions (e.g., `auth.js`).
* `/models`: Defines the data structure for `Users` and `Tokens`.
* `/mongoDBConnect`: Contains the logic for connecting to the MongoDB database.

## ⚙️ Setup & Installation

### 1. Prerequisites

* Node.js installed on your machine.
* A MongoDB database (local or Atlas).

### 2. Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=5000
URL_MONGODB=your_mongodb_connection_string
URL_YOUR_WEBSITE=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
```

### 4. Running the Application

To start the server in development mode using `nodemon`:

```bash
npm run dev
```

## 🚦 API Endpoints

The API is accessible under the `/api` prefix.

| Method | Endpoint        | Description                                          |
| ------ | --------------- | ---------------------------------------------------- |
| POST   | `/api/register` | Register a new user with validation and hashing.     |
| POST   | `/api/login`    | Authenticate user and issue a JWT cookie.            |
| POST   | `/api/logout`   | Clear the authentication cookie and end the session. |

## 🛡️ Data Models

### User Model (`Users.js`)

* **Username:** Unique and required.
* **Email:** Unique, required, and validated.
* **isVerified:** Boolean flag for account activation status.

### Token Model (`Tokens.js`)

* Used to store tokens associated with a specific user.
* Includes a `createdAt` timestamp with an expiry index to automatically clean up old tokens.
