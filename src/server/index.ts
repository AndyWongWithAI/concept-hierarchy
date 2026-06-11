import Fastify from 'fastify'
import cors from '@fastify/cors'
import { conceptRoutes } from './routes.js'

const fastify = Fastify({ logger: true })

await fastify.register(cors, { origin: true })

await fastify.register(conceptRoutes)

const start = async () => {
  try {
    await fastify.listen({ port: 3001 })
    console.log('Server running at http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()