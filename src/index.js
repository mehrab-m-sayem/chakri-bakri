import express from 'express'
// const express = require('express')
import authRoutes from "./routes/authRoutes.js"
import jobRoutes from "./routes/jobRoutes.js"
import authMiddleware from "./middleware/authMiddleware.js"
import "dotenv/config"


const app = express()
const PORT = process.env.PORT || 5003


app.use(express.json())

app.get('/', async (req, res) => {
    res.sendStatus(200)
})

app.use('/auth', authRoutes)
app.use('/jobs', authMiddleware, jobRoutes)


app.listen(PORT, () => {
    console.log(`server is running on: ${PORT}`)

})