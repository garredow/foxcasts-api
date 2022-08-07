import { config } from './lib/config';
require('newrelic');
import mercuriusCodegen from 'mercurius-codegen';
import { configureServer } from './server';

const server = configureServer();

mercuriusCodegen(server, {
  targetPath: './src/graphql/generated.ts',
}).catch(console.error);

server.listen({ port: config.meta.serverPort, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
