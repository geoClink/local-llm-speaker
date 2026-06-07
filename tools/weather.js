function getCondition(code) {
    if (code === 0) return "Clear sky"
    if (code <= 3) return "Partly cloudy"
    if (code <= 49) return "Foggy"
    if (code <= 69) return "Rainy"
    if (code <= 79) return "Snowy"
    if (code <= 99) return "Thunderstorm"
    return "Unknown"
}

async function getWeather(city) {
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
        const geoData = await geoRes.json()
        if (!geoData.results?.length) return `Couldn't find city: ${city}`
        const { latitude, longitude } = geoData.results[0]

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,uv_index&temperature_unit=fahrenheit&windspeed_unit=mph`)
        const data = await res.json()
        const w = data.current
        const conditions = getCondition(w.weathercode)
        return `${city}: ${w.temperature_2m}°F, ${conditions}, Wind: ${w.windspeed_10m}mph, Humidity: ${w.relativehumidity_2m}%,
  UV: ${w.uv_index}`
    } catch {
        return "Could not reach weather service."
    }
}
module.exports = { getWeather }