require('dotenv').config()

let jwt = null

async function getMeaterStatus() {
    if (!jwt) {
        const r = await fetch('https://public-api.cloud.meater.com/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: process.env.MEATER_EMAIL, password: process.env.MEATER_PASSWORD })
        })
        jwt = (await r.json()).data?.token
    }

    try {
        const res = await fetch('https://public-api.cloud.meater.com/v1/devices', {
            headers: { Authorization: `Bearer ${jwt}` }
        })
        const data = await res.json()
        if (!data.data?.devices?.length) return "No active cook. Make sure app is open."
        const p = data.data.devices[0]
        return `${p.temperature.internal}F internal, ${Math.round(p.cook?.time_remaining / 60)} min remaining, ${p.cook?.state}`
    } catch {
        return "Could not reach Meater service."
    }
}

module.exports = { getMeaterStatus }