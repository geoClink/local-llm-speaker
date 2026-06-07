const Parser = require('rss-parser')
const parser = new Parser()

async function getNews() {
    try {
        const feed = await parser.parseURL('https://feeds.npr.org/1001/rss.xml')
        return feed.items.slice(0, 5).map(item => item.title).join('. ')
    } catch {
        return "Could not get any news stories."
    }
}

module.exports = { getNews }