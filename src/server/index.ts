import Fastify from 'fastify'
import cors from '@fastify/cors'
import { conceptRoutes } from './routes.js'

const fastify = Fastify({ logger: true })

await fastify.register(cors, { origin: true })

await fastify.register(conceptRoutes)

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Server running at http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()