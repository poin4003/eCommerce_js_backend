const app = require('./src/app')
const config = require('./src/configs/config')

const PORT = config.app.port || 3056

const server = app.listen(PORT, () => {
  console.log(`WSV eCommerce start with port: http://localhost:${PORT}`)
})

process.on('SIGINT', () => {
  server.close(() => console.log('Exit Server Express'))
})