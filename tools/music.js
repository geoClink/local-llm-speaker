const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

async function playMusic(query) {
    try {
        await execAsync(`yt-dlp -f bestaudio -x --audio-format mp3 -o /tmp/music.mp3 "ytsearch1:${query}"`)
        await execAsync(`afplay /tmp/music.mp3`)
        return `Playing ${query}`
    } catch {
        return "Could not play music."
    }
}

module.exports = { playMusic }