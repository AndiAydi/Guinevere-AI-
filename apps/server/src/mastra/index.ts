import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';
import type { Env } from '../env.js';
import { createAgents } from './agents/index.js';
import { createStorage } from './storage.js';

export function createMastra(env: Env) {
  return new Mastra({
    storage: createStorage(env),
    agents: createAgents(env),
    logger: createLogger({
      name: 'guinevere',
      level: env.LOG_LEVEL,
    }),
  });
}
