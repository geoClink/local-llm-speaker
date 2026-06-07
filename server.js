const express = require('express')
const http = require('http')
const WebSocket = require('ws')
require('dotenv').config()
const { getWeather } = require('./tools/weather.js')
const { getScore } = require('./tools/sports.js')
const { getMeaterStatus } = require('./tools/meater.js')
const { playMusic } = require('./tools/music.js')
const { getJoke } = require('./tools/jokes.js')
const { setTimer } = require('./tools/timer.js')
const { getNews } = require('./tools/news.js')
const { addItem, getList, clearList } = require('./tools/shopping.js')

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.static('public'))
app.use(express.json())

app.get('/api/weather', async (req, res) => {
    const result = await getWeather(req.query.city || 'detroit')
    res.json({ result })
})

app.get('/api/sports', async (req, res) => {
    const result = await getScore(req.query.team)
    res.json({ result })sports
})

app.get('/api/joke', async (req, res) => {
    const result = await getJoke()
    res.json({ result })
})

app.get('/api/news', async (req, res) => {
    const result = await getNews()
    res.json({ result })
})

app.get('/api/meater', async (req, res) => {
    const result = await getMeaterStatus()
    res.json({ result })
})

app.get('/api/music', async (req, res) => {
    const result = await playMusic(req.query.query)
    res.json({ result })
})

app.get('/api/timer', async (req, res) => {
    const result = await setTimer(req.query.minutes)
    res.json({ result })
})

app.get('/api/shopping', async (req, res) => {
    const result = getList()
    res.json({ result })
})

app.post('/api/shopping', (req, res) => {
    const result = addItem(req.body.item)
    res.json({ result })
})

app.delete('/api/shopping', (req, res) => {
    const result = clearList()
    res.json({ result })

})
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
