import { EventEmitter } from 'events'

const eventBus = new EventEmitter()
eventBus.setMaxListeners(0)

const notificationClients = new Map()

const getClientKey = (userId) => String(userId)

export const registerNotificationClient = (userId, res) => {
  const key = getClientKey(userId)

  if (!notificationClients.has(key)) {
    notificationClients.set(key, new Set())
  }

  const clients = notificationClients.get(key)
  clients.add(res)

  const removeClient = () => {
    clients.delete(res)
    if (clients.size === 0) {
      notificationClients.delete(key)
    }
  }

  res.on('close', removeClient)
  res.on('finish', removeClient)

  return removeClient
}

export const emitNotificationEvent = (userId, payload) => {
  const key = getClientKey(userId)
  const clients = notificationClients.get(key)

  if (!clients || clients.size === 0) {
    return
  }

  for (const res of clients) {
    res.write(`event: notification\n`)
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }
}

export const emitNotificationBatch = (userIds, payloadFactory) => {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean).map((userId) => String(userId)))]

  uniqueUserIds.forEach((userId) => {
    emitNotificationEvent(userId, typeof payloadFactory === 'function' ? payloadFactory(userId) : payloadFactory)
  })
}

export const emitRealtimeEvent = (eventName, payload) => {
  eventBus.emit(eventName, payload)
}

export const onRealtimeEvent = (eventName, listener) => {
  eventBus.on(eventName, listener)
  return () => eventBus.off(eventName, listener)
}
