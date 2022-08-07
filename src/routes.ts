import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getHealth } from './controllers';

const handleErrors =
  (controllerFn: (request: FastifyRequest, reply: FastifyReply) => any) =>
  (request: FastifyRequest, reply: FastifyReply) =>
    controllerFn(request, reply).catch((err: any) => {
      request.log.error(err);
      reply.code(500).send({
        statusCode: 500,
        error: 'API Error',
        message: '',
      });
    });

export async function routes(fastify: FastifyInstance) {
  // Health
  fastify.get('/health', {
    handler: handleErrors(getHealth),
  });
}
