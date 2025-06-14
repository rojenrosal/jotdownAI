import { FastifyPluginAsync } from 'fastify';
import multer from 'fastify-multer';
import fs from 'fs';
import { transcribeAudio } from '../openai';
import { supabase } from '../supabase';

const upload = multer({ dest: 'uploads/' });

const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(multer.contentParser);

  fastify.post('/', { preHandler: upload.single('audio') }, async (req, reply) => {
    const file = (req as any).file;
    if (!file) return reply.status(400).send({ error: 'No audio file provided' });

    const transcript = await transcribeAudio(file.path);

    const { data, error } = await supabase.from('recordings').insert([
      {
        filename: file.originalname,
        transcript
      }
    ]).select().single();

    fs.unlinkSync(file.path); // cleanup

    if (error) return reply.status(500).send({ error: error.message });

    reply.send(data);
  });
};

export default uploadRoutes;
