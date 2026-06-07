const { spawn } = require('child_process')
let currentProcess = null

 async function playMusic(query) {
      if (currentProcess) currentProcess.kill()

      currentProcess = spawn('sh', ['-c', `yt-dlp -f bestaudio -o - "ytsearch1:${query}" | ffplay -nodisp -autoexit -`])

      return `Playing ${query}`
  }

function stopMusic() {
    if (currentProcess) {
        currentProcess.kill()
        currentProcess = null
        return "Music stopped."
    }
    return "Nothing is playing."
}

function skipMusic(query) {
    return playMusic(query)
}

module.exports = { playMusic, stopMusic, skipMusic }