import express from 'express'
// const express = require('express')
import authRoutes from "./routes/authRoutes.js"
import "dotenv/config"


const app = express()
const PORT = process.env.PORT || 5003


app.use(express.json())


app.use('/auth', authRoutes)















app.listen(PORT, () => {
    console.log(`server is running on: ${PORT}`)

})