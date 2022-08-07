import dotenv from 'dotenv';
import Joi from 'joi';
import { parseBool } from '../utils/parseBool';
dotenv.config();

enum LogLevel {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Fatal = 'fatal',
  Silent = 'silent',
}

export type Config = {
  meta: {
    appName: string;
    serverPort: number;
  };
  logger: {
    enabled: boolean;
    level: `${LogLevel}`;
    file?: string;
  };
  auth0: {
    domain: string;
    audience: string;
  };
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
  };
  podcastIndex: {
    apiKey: string;
    apiSecret: string;
  };
};

function createConfig() {
  const config: Config = {
    meta: {
      appName: process.env.APP_NAME!,
      serverPort: Number(process.env.SERVER_PORT),
    },
    logger: {
      enabled: parseBool(process.env.LOGGER_ENABLED, true),
      level: process.env.LOGGER_LEVEL! as any,
      file: process.env.LOGGER_FILE || undefined,
    },
    auth0: {
      domain: process.env.AUTH0_DOMAIN!,
      audience: process.env.AUTH0_AUDIENCE!,
    },
    database: {
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT)!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_DATABASE!,
      ssl: parseBool(process.env.DB_ENABLE_SSL, false),
    },
    podcastIndex: {
      apiKey: process.env.PI_API_KEY!,
      apiSecret: process.env.PI_API_SECRET!,
    },
  };

  const schema = Joi.object({
    meta: {
      appName: Joi.string().required(),
      serverPort: Joi.number().required(),
    },
    logger: {
      enabled: Joi.bool().required(),
      level: Joi.string()
        .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent')
        .required(),
      file: Joi.string().optional(),
    },
    auth0: {
      domain: Joi.string().required(),
      audience: Joi.string().required(),
    },
    database: {
      host: Joi.string().required(),
      port: Joi.number().required(),
      user: Joi.string().required(),
      password: Joi.string().required(),
      database: Joi.string().required(),
      ssl: Joi.bool().required(),
    },
    podcastIndex: {
      apiKey: Joi.string().required(),
      apiSecret: Joi.string().required(),
    },
  });
  const { error } = schema.validate(config, { abortEarly: false });

  if (error) {
    console.error(
      'Invalid config',
      error.details.map((a) => a.message)
    );
    process.exit(1);
  }

  return config;
}

export const config = createConfig();
