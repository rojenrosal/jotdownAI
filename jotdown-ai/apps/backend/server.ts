import Fastify from 'fastify';

const server = Fastify();
server.get('/', async () => ({ hello: 'voice-notes-backend' }));

server.listen({ port: 3001 }, () => {
  console.log('Backend listening on http://localhost:3001');
});