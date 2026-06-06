async function getScore(team) {
    const map = {
        lions: { sport: "football", league: "nfl" },
        tigers: { sport: "baseball", league: "mlb" },
        pistons: { sport: "basketball", league: "nba" },
        redwings: { sport: "hockey", league: "nhl" }
    }

    const info = map[team.toLowerCase().replace(" ", "")]
    if (!info) return `No data for ${team}.`

    try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${info.sport}/${info.league}/scoreboard`)
        const data = await res.json()
        const game = data.events?.find(e => e.name.toLowerCase().includes(team.toLowerCase()))
        if (!game) return `No recent ${team} game found.`
        return game.competitions[0].competitors.map(c => `${c.team.displayName} ${c.score}`).join(" - ")
    } catch {
        return "Could not reach sports service."
    }
}

module.exports = { getScore }