function setTimer(minutes) {
    setTimeout(() => console.log(`Timer done: ${minutes} minute timer finished`), minutes * 60 * 1000)
    return `Timer set for ${minutes} minutes.`   
}

module.exports = { setTimer }