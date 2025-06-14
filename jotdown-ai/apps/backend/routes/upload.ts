import { FastifyPluginAsync } from 'fastify';
import fs from 'fs';
import path from 'path';
import { transcribeAudio } from '../openai';
import { supabase } from '../supabase';
import multipart from '@fastify/multipart';

const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(multipart);

  fastify.post('/', async (req, reply) => {
    const file = await req.file(); 

    if (!file) {
      return reply.status(400).send({ error: 'No audio file provided' });
    }

    const filePath = path.join('uploads', file.filename);
    const buffer = await file.toBuffer();

    fs.writeFileSync(filePath, buffer); 

    const transcript = await transcribeAudio(filePath);

    const { data, error } = await supabase.from('recordings').insert([
      {
        filename: file.filename,
        transcript,
      }
    ]).select().single();

    fs.unlinkSync(filePath); 

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send(data);
  });
};

export default uploadRoutes;
