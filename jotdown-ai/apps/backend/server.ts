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


server.register(uploadRoutes, { prefix: '/api/upload' });
server.register(summarizeRoutes, { prefix: '/api/summarize' });


server.listen({ port: 3001 }, (err, address) => {
  if (err) throw err;
  console.log(`Server running at ${address}`);
});
