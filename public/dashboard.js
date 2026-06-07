document.addEventListener('DOMContentLoaded', () => {
    async function checkStatus() {
        try {
            await fetch('/api/weather?city=detroit')
            document.getElementById('status-dot').className = 'dot online'
            document.getElementById('status-text').textContent = 'Online'
        } catch {
            document.getElementById('status-dot').className = 'dot offline'
            document.getElementById('status-text').textContent = 'Offline'
        }
    }
    checkStatus()
    setInterval(checkStatus, 30000)

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

    loadHistory()
    setInterval(loadHistory, 3000)
})