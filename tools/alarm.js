function setAlarm(hour, minute, onFire) {
    const now = new Date()
    const target = new Date() 
    target.setHours(hour)
    target.setMinutes(minute)
    target.setSeconds(0)
    let delay = target - now

    if (delay < 0) delay += 24 * 60 *60 *1000
  
    const timeOutId = setTimeout(() => onFire(), delay)

    return { message: `Alarm set for ${hour}:${minute}`, timeOutId }
}

module.exports = { setAlarm }