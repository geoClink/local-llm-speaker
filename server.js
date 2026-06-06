const express = require('express')
const http = require('http')
const WebSocket = require('ws')
require('dotenv').config()

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.static('public'))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        ws.send(data)
    })
})

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})