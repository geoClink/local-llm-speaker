const express = require('express')
const http = require('http')
const WebSocket = require('ws')
require('dotenv').config()
const { setAlarm } = require('./tools/alarm.js')
const { getWeather } = require('./tools/weather.js')
const { getScore } = require('./tools/sports.js')
const { getMeaterStatus } = require('./tools/meater.js')
const { playMusic } = require('./tools/music.js')
const { getJoke } = require('./tools/jokes.js')
const { setTimer } = require('./tools/timer.js')
const { getNews } = require('./tools/news.js')
const { addItem, getList, clearList } = require('./tools/shopping.js')
const logger = require('./logger.js')

const app = express()

const PORT = process.env.PORT || 3000

const os = require('os')
const osUtils = require('os-utils')

const auth = require('./middleware/auth.js')

const Database = require('better-sqlite3')
const db = new Database('history.db')

const history = []
let alarmTimeout = null

db.exec(`CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    you TEXT,
    speaker TEXT,
    timestamp TEXT
)`)

app.use(express.static('public'))
app.use(express.json())
app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.headers.upgrade === 'websocket') {
        next()
    } else {
        auth(req, res, next)
    }
})

app.get('/api/status', (req, res) => {
    osUtils.cpuUsage((cpu) => {
        const uptime = Math.floor(os.uptime() / 60)
        const totalMem = os.totalmem()
        const freeMem = os.freemem()
        const usedMem = Math.round((totalMem - freeMem) / totalMem * 100)
        res.json({
            cpu: `${Math.round(cpu * 100)}%`,
            uptime: `${uptime} min`,
            ram: `${usedMem}%`,
            model: 'Qwen3 4B'
        })
    })
})

app.get('/api/alarm', async (req,res) => {
    const alarm = setAlarm(req.query.hour, req.query.minute, () => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "alarm", hour: req.query.hour, minute: req.query.minute }))
            }
        })
    })
    alarmTimeout = alarm.timeOutId
    logger.info('Tool called', { tool: 'alarm',
        input: req.query.hour })
        res.json({ result: alarm.message })
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "alarm-set", hour: req.query.hour, minute: req.query.minute }))
            }
        })
        logger.info('Tool called', { tool: 'alarm', input: req.query.hour })
})

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

app.post('/api/music/stop', (req, res) => {
    require('child_process').exec('pkill -f ffplay')
    res.json({ ok: true })
})

app.post('/api/music/skip', (req, res) => {
    require('child_process').exec('pkill -f ffplay')
    res.json({ ok: true })
})

app.get('/api/timer', async (req, res) => {
    const result = await setTimer(req.query.minutes)
    logger.info('Tool called', { tool: 'timer', input: req.query.minutes })
    res.json({ result })
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "timer", minutes: req.query.minutes }))
        }
    })
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
    clearList()
    res.json({ ok: true })

})

app.post('/api/history', (req, res) => {
    history.push(req.body)
    const { you, speaker, timestamp } = req.body
    db.prepare('INSERT INTO history (you, speaker, timestamp) VALUES (?, ?, ?)').run(you, speaker, timestamp)
    res.json({ ok: true })
})

app.get('/api/history', (req, res) => {
    const rows = db.prepare('SELECT * FROM history ORDER BY id DESC LIMIT 50').all()
    res.json(rows)
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