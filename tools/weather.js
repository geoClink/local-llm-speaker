async function getWeather(city) {
    const coords = { detroit: { lat:  42.33, lon: -83.04 }}
    const c = coords[city.toLowerCase()] || coords.detroit
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m&temperature_unit=fahrenheit`)
        const data = await res.json()
        return `${city}: ${data.current.temperature_2m}F`
    } catch {
        return "Could not reach weather service."
    }
} 
module.exports = { getWeather }