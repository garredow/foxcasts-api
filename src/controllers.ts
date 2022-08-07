import { FastifyReply, FastifyRequest } from 'fastify';
const { version: apiVersion } = require('../package.json');

export async function getHealth(request: FastifyRequest, reply: FastifyReply) {
  reply.send({
    version: apiVersion,
    uptime: Math.floor(process.uptime() * 1000),
    date: new Date().toUTCString(),
  });
}
