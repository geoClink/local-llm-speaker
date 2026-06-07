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
const logger = require('./logger.js')

const history = []

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.static('public'))
app.use(express.json())

app.get('/api/weather', async (req, res) => {
    const result = await getWeather(req.query.city || 'detroit')
    logger.info('Tool called', { tool: 'weather', input: req.query.city, result })
    res.json({ result })
})

app.get('/api/sports', async (req, res) => {
    const result = await getScore(req.query.team)
    logger.info('Tool called', { tool: 'sports', input: req.query.team })
    res.json({ result })
})

app.get('/api/joke', async (req, res) => {
    const result = await getJoke()
    logger.info('Tool called', { tool: 'jokes', input: req.query.joke })
    res.json({ result })
})

app.get('/api/news', async (req, res) => {
    const result = await getNews()
    logger.info('Tool called', { tool: 'news', input: req.query.news })
    res.json({ result })
})

app.get('/api/meater', async (req, res) => {
    const result = await getMeaterStatus()
    logger.info('Tool called', { tool: 'meater', input: req.query.meaterStatus })
    res.json({ result })
})

app.get('/api/music', async (req, res) => {
    const result = await playMusic(req.query.query)
    logger.info('Tool called', { tool: 'music', input: req.query.music })
    res.json({ result })
})

app.get('/api/timer', async (req, res) => {
    const result = await setTimer(req.query.minutes)
    logger.info('Tool called', { tool: 'timer', input: req.query.minutes })
    res.json({ result })
})

app.get('/api/shopping', async (req, res) => {
    const result = getList()
    logger.info('Tool called', { tool: 'shopping', input: req.query.shopping })
    res.json({ result })
})

app.post('/api/shopping', (req, res) => {
    const result = addItem(req.body.item)
    logger.info('Tool called', { tool: 'shopping', input: req.query.shopping })
    res.json({ result })
})

app.delete('/api/shopping', (req, res) => {
    const result = clearList()
    logger.info('Tool called', { tool: 'shopping', input: req.query.shopping })
    res.json({ result })

})

app.post('/api/history', (req, res) => {
    history.push(req.body)
    res.json({ ok: true })
})

app.get('/api/history', (req, res) => {
    res.json(history)
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
