const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt');
const saltRound = 10
const { Users, validation } = require("../Models/Users")
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const Tokens = require("../Models/Tokens")
const nodemailer = require("nodemailer")






const verify = asyncHandler(async (req, res, next, type) => {
    const verifyType = req.originalUrl.split("/")[2]

    let token = ""
    let decoded;
    if (verifyType != "reset_password") {
        token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        decoded = jwt.verify(token, process.env.SECRET)

    } else {

        token = req.params.token;
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        decoded = jwt.verify(token, process.env.TOKEN_SECRET)

    }
    const user = await Users.findById(decoded.id)
    if (!user) { return res.json({ message: "User not found" }) }
    req.userData = user
    req.token = token

    next()
})

router.post("/register", asyncHandler(async (req, res) => {
    const { error } = validation(req.body, 'signup')
    if (error) { return res.json({ message: error.details[0].message }) }
    const { name, username, email } = req.body
    let password = req.body.password
    password = await bcrypt.hash(password, saltRound)

    const createUser = new Users({
        name, username, email, password
    })

    try {
        await createUser.save()
        const user = await Users.findById(createUser._id)
        const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, process.env.SECRET)
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 31536000000
        })
        return res.status(200).json({ user })
    } catch (err) {
        if (err.errors) {
            let error = err.errors
            let firstError = error && Object.keys(error)[0]
            let e = firstError && error[firstError].message
            if (e) {
                return res.json({ message: e })

            }
        }
        return res.json({ message: "There's wrong." })
    }
}))


router.post("/login", asyncHandler(async (req, res) => {
    const { error } = validation(req.body, 'login');
    if (error) { return res.json({ message: error.details[0].message }) };

    const { email } = req.body;

    const user = await Users.findOne({ email }).select("+password")
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });

    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {

        return res.status(401).json({ message: "Invalid email or password" });

    }

    const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, process.env.SECRET)


    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 31536000000
    })

    res.json({ email: user.email, username: user.username, name: user.name })
}))



router.post("/logout", verify, asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    })
    res.json({ message: "Logout success" }).status(200)
}))


router.delete("/delete_account", verify, asyncHandler(async (req, res) => {
    const { _id } = req.userData;
    const deletedUser = await Users.deleteOne({ _id })
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    })

    res.json({
        message: "deleted account",
        username: req.userData.username

    })
}))


router.put("/forgot_password", asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }


    const user = await Users.findOne({ email });

    if (!user) {
        return res.status(200).json({
            message: "If the email exists, a reset link will be sent"
        });
    }

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: "5m" })

    const tokenState = new Tokens({ token })
    await tokenState.save()


    const link = `${process.env.URL_YOUR_WEBSITE}/reset_password/${token}`
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // MUST be the provider's host
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    })
    let mailOptions = {
        to: email,
        subject: 'Reset Password', // Subject line
        text: 'Link to reset password', // plain text body
        html: `<div>
            <h1>Link:</h1>
            <a href=${link}>${link}</a>
        </div>`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.json({ message: "there was wrong" });
        }
        return res.json({ message: "If the email exists, a reset link will be sent" })


    });

}))


router.put("/reset_password/:token", verify, asyncHandler(async (req, res) => {

    const { _id } = req.userData;

    const { error } = validation(req.body, 'update')
    if (error) { return res.json({ message: error.details[0].message }) }
    const { password } = req.body;
    if (!password) { return res.status(400).json({ message: "password is required" }) }

    const token = req.token
    const tokenState = await Tokens.findOneAndDelete({ token })
    if (!tokenState) { return res.status(400).json({ message: "invalid token." }) }

    const hashedPassword = await bcrypt.hash(password, saltRound);

    const user = await Users.findByIdAndUpdate(
        _id,
        { password: hashedPassword },
        { new: true }
    );

    res.json({ message: "password is chanched." })
}))

router.get("/state", verify, asyncHandler(async (req, res) => {
    res.json({ logined: true, user: req.userData })
}))
module.exports = router