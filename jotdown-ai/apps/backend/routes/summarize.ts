import { FastifyPluginAsync } from 'fastify';
import { generateDocument } from '../openai';
import { supabase } from '../supabase';

const summarizeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (req, reply) => {
    const { recordingId, format } = req.body as {
      recordingId: string;
      format?: string;
    };

    const { data: record, error } = await supabase
      .from('recordings')
      .select()
      .eq('id', recordingId)
      .single();

    if (error || !record) {
      return reply.status(404).send({ error: 'Recording not found' });
    }

    const document = await generateDocument(record.transcript, format || 'meeting notes');

    const { error: updateError } = await supabase
      .from('recordings')
      .update({ document })
      .eq('id', recordingId);

    if (updateError) return reply.status(500).send({ error: updateError.message });

    reply.send({ document });
  });
};

export default summarizeRoutes;
