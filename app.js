const express = require("express")
const app = express()
const login = require("./routers/auth")
const cookieParser = require("cookie-parser");
const Connect = require("./mongoDBConnect/MongoDB");
const cors = require("cors")
const dotenv = require("dotenv");
dotenv.config();
Connect(app)

// Routers
app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: process.env.URL_YOUR_WEBSITE,
    credentials: true
}))
app.use("/api", login)


