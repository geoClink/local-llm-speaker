let timerInterval = null

function connectWS() {
    const ws = new WebSocket(`ws://${location.host}`)

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'timer') {
            let secondsLeft = data.minutes * 60

            timerInterval = setInterval(() => {
                secondsLeft--
                document.getElementById('timer-display').textContent = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`

                if (secondsLeft === 0) {
                    clearInterval(timerInterval)
                    alert('Timer done!')
                }
            }, 1000)
        } else if (data.type === 'alarm') {
            alert('Alarm!')
            document.getElementById('alarm-display').textContent = `--:--`
        } else if (data.type === 'alarm-cancel') {
            document.getElementById('alarm-display').textContent = '--:--'
        } else if (data.type === 'alarm-set') {
            document.getElementById('alarm-display').textContent = `Alarm set for ${data.hour}:${String(data.minute).padStart(2, '0')}`
        } else if (data.type === 'shopping') {
            loadShoppingItems()
        } else if (data.type === 'now-playing') {
            document.getElementById('now-playing').textContent = `${data.song}`
        }
    }

    ws.onclose = () => setTimeout(connectWS, 3000)
}

connectWS()

document.addEventListener('DOMContentLoaded', () => {
    async function checkStatus() {
        try {
            await fetch('/api/status')
            document.getElementById('status-dot').className = 'dot online'
            document.getElementById('status-text').textContent = 'Online'
        } catch {
            document.getElementById('status-dot').className = 'dot offline'
            document.getElementById('status-text').textContent = 'Offline'
        }
    }

    async function loadHistory() {
        const res = await fetch('/api/history')
        const entries = await res.json()
        const div = document.getElementById('history')
        div.innerHTML = entries.reverse().map(e => `
            <div class="entry">
                <p class="you">You: ${e.you}</p>
                <p class="speaker">Speaker: ${e.speaker}</p>
            </div>
        `).join('')
    }

    checkStatus()
    setInterval(checkStatus, 30000)
    loadHistory()
    setInterval(loadHistory, 3000)

    document.getElementById('btn-pause').addEventListener('click', () => {
        fetch('/api/music/stop', { method: 'POST' })
    })

    document.getElementById('btn-skip').addEventListener('click', () => {
        const query = prompt('Skip to what song?')
        if (query) fetch(`/api/music/skip?query=${encodeURIComponent(query)}`, { method: 'POST' })
    })
    document.getElementById('btn-cancel-timer').addEventListener('click', () => {
        clearInterval(timerInterval)
        document.getElementById('timer-display').textContent = '--:--'
    })
    document.getElementById('btn-cancel-alarm').addEventListener('click', () => {
        fetch('/api/alarm/cancel', { method: 'POST' })
    })

    async function loadStatus() {
        const res = await fetch('/api/status')
        const data = await res.json()
        document.getElementById('ram').textContent = `RAM: ${data.ram}`
        document.getElementById('uptime-detail').textContent = `Uptime: ${data.uptime}`
        document.getElementById('cpu').textContent = `CPU: ${data.cpu}`
        document.getElementById('uptime').textContent = `Uptime: ${data.uptime}`
    }

    loadStatus()
    setInterval(loadStatus, 10000)

    async function loadShoppingItems() {
        const res = await fetch('/api/shopping')
        const data = await res.json()
        document.getElementById('shopping-list-items').innerHTML = data.result.map(item => `<li>${item}</li>`).join('')
    }

    loadShoppingItems()
    document.getElementById('add-shopping-items').addEventListener('click', () => {
        const item = document.getElementById('list-input').value
        fetch('/api/shopping', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item })
        })
        loadShoppingItems()
    })
    document.getElementById('clear-shopping-list').addEventListener('click', () => {
        fetch('/api/shopping', { method: 'DELETE' }).then(() => loadShoppingItems())
    })
})