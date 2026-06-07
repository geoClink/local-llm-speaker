const basicAuth = require('express-basic-auth')
module.exports = basicAuth({ users: { admin: process.env.DASHBOARD_PASSWORD }, challenge: true })