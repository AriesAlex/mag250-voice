const commands = require('./commands.json')
const ws = require('ws')
const express = require('express')
const dgram = require('dgram')

const udp = dgram.createSocket('udp4')
const wss = new ws.Server({ port: 9301 })
const app = express()
app.get('/', (req, res) => res.sendFile(__dirname + '/voice.html'))
app.listen(9300)

const binding = {
  'включи телевизор': 'POWER',
  'выключи телевизор': 'POWER',
  тише: (msg, keyphrase) => {
    const count = [...msg.matchAll(keyphrase)].length
    return Array.from({ length: count }, () => 'VOLUME_DOWN')
  },
  громче: (msg, keyphrase) => {
    const count = [...msg.matchAll(keyphrase)].length
    return Array.from({ length: count }, () => 'VOLUME_UP')
  },
  канал: msg => {
    return msg.replace(/[^\d]/g, '').split('')
  },
}

function executeCmd(cmdId) {
  if (!Object.keys(commands).includes(cmdId))
    return console.log('Ignored:', cmdId)
  console.log('Executing:', cmdId)
  const data = Buffer.from(commands[cmdId].data)
  udp.send(data, 0, data.length, 7666, '192.168.0.195')
}

wss.on('connection', socket => {
  socket.on('message', data => {
    const msg = data.toString()
    console.log('Received:', msg)

    for (const keyphrase of Object.keys(binding)) {
      if (!msg.includes(keyphrase)) continue
      let activator = binding[keyphrase]
      if (typeof activator == 'function') activator = activator(msg, keyphrase)
      if (typeof activator == 'string') activator = [activator]
      for (const i in activator)
        setTimeout(() => executeCmd(activator[i]), i * 250)
    }
  })
})
