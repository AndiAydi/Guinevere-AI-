import { z } from 'zod';
import { ModeIdSchema } from './modes.js';

export const ProviderIdSchema = z.enum(['groq', 'gemini', 'openrouter']);
export type ProviderId = z.infer<typeof ProviderIdSchema>;

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system', 'tool']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const ToolCallSchema = z.object({
  id: z.string(),
  tool: z.string(),
  args: z.record(z.string(), z.unknown()),
  status: z.enum(['pending', 'running', 'success', 'error', 'denied']),
  result: z.unknown().optional(),
  durationMs: z.number().optional(),
  requiresApproval: z.boolean().default(false),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  mode: ModeIdSchema,
  provider: ProviderIdSchema.optional(),
  model: z.string().optional(),
  tokens: z.number().optional(),
  toolCalls: z.array(ToolCallSchema).default([]),
  createdAt: z.date(),
});
export type Message = z.infer<typeof MessageSchema>;

export const TaskStatusSchema = z.enum([
  'queued',
  'running',
  'needs_approval',
  'done',
  'failed',
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskStepSchema = z.object({
  id: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'running', 'done', 'failed', 'skipped']),
  output: z.string().optional(),
  error: z.string().optional(),
});
export type TaskStep = z.infer<typeof TaskStepSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  request: z.string(),
  status: TaskStatusSchema,
  mode: ModeIdSchema,
  steps: z.array(TaskStepSchema).default([]),
  artifacts: z.array(z.object({ name: z.string(), path: z.string() })).default([]),
  error: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Task = z.infer<typeof TaskSchema>;

export interface ProviderQuota {
  provider: ProviderId;
  limit: number | null;
  remaining: number | null;
  resetAt: Date | null;
}
