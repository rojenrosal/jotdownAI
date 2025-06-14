import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import rateLimit from '@fastify/rate-limit';

dotenv.config();

const server = Fastify();
server.register(cors);

server.get('/', async (request, reply) => {
  return { message: 'Server is running' };
});



import uploadRoutes from './routes/upload';
import summarizeRoutes from './routes/summarize';

server.register(rateLimit, {
  max: 3,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'You have exceeded the allowed number of requests. Please try again later.'
  })
});

server.register(uploadRoutes, { prefix: '/api/upload' });
server.register(summarizeRoutes, { prefix: '/api/summarize' });


server.listen({ port: 3001 }, (err, address) => {
  if (err) throw err;
  console.log(`Server running at ${address}`);
});
