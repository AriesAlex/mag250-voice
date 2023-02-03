const dgram = require('dgram')
const server = dgram.createSocket('udp4')
const fs = require('fs')

const keys = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'OK',
  'POWER',
  'UP',
  'DOWN',
  'LEFT',
  'RIGHT',
  'F1',
  'F2',
  'F3',
  'F4',
  'MENU',
  'EXIT',
  'BACK',
  'INFO',
  'VOLUME_UP',
  'VOLUME_DOWN',
]

let currentKey = null
currentKey = keys.shift()
console.log('Click', currentKey)

const file = 'commands.json'
server.on('message', (buf, info) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}')
  const commands = JSON.parse(fs.readFileSync(file))
  commands[currentKey] = buf
  fs.writeFileSync(file, JSON.stringify(commands, 0, 2))

  if (keys.length == 0) return process.exit()

  currentKey = keys.shift()
  console.log('Click', currentKey)
})

server.bind(7666)
