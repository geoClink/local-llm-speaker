async function getScore(team) {
    const leagues = [
        { sport: "football", league: "nfl" },
        { sport: "football", league: "college-football" },
        { sport: "basketball", league: "nba" },
        { sport: "basketball", league: "mens-college-basketball" },
        { sport: "baseball", league: "mlb" },
        { sport: "baseball", league: "college-baseball" },
        { sport: "hockey", league: "nhl" }
    ]

    try {
        for (const { sport, league } of leagues) {
            const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`)
            const data = await res.json()
            const game = data.events?.find(e => e.name.toLowerCase().includes(team.toLowerCase()))
            if (game) {
                const scores = game.competitions[0].competitors.map(c => `${c.team.displayName} ${c.score}`).join(" - ")
                const series = game.competitions[0].series
                const seriesSummary = series ? ` | Series: ${series.summary}` : ""
                return scores + seriesSummary
            }
        }
        return `No recent ${team} game found.`
    } catch {
        return "Could not reach sports service."
    }
}

module.exports = { getScore }