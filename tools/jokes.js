async function getJoke() {
    try {
        const res = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode&type=twopart')
        const data = await res.json()

        return `${data.setup} ... ${data.delivery}`
    } catch {
        return "Could not fetch a joke."
    }
}

module.exports = { getJoke }