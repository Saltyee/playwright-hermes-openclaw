#!/usr/bin/env node

const { randomUUID } = require('node:crypto');

const HERMES_A2A_URL = 'http://127.0.0.1:9900/';
const POLL_INTERVAL_MS = 2_000;
const MAX_WAIT_MS = 660_000;
const TERMINAL_STATES = new Set([
  'TASK_STATE_COMPLETED',
  'TASK_STATE_FAILED',
  'TASK_STATE_REJECTED',
]);

function isTerminal(state) {
  return TERMINAL_STATES.has(state);
}

async function requestA2A(method, params) {
  const response = await fetch(HERMES_A2A_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: `openclaw-${randomUUID()}`,
      method,
      params,
    }),
    signal: AbortSignal.timeout(MAX_WAIT_MS),
  });

  if (!response.ok) {
    throw new Error(`Hermes A2A returned HTTP ${response.status}`);
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(`Hermes A2A error ${result.error.code}: ${result.error.message}`);
  }

  return result.result;
}

async function sendTask() {
  const text = process.env.OPENCLAW_HERMES_TASK?.trim();

  if (!text || Buffer.byteLength(text) > 65_536) {
    throw new Error('OPENCLAW_HERMES_TASK must contain 1 to 65,536 bytes');
  }

  const contextId = `ctx-oc-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
  const result = await requestA2A('SendMessage', {
    message: {
      messageId: randomUUID(),
      role: 'ROLE_USER',
      contextId,
      parts: [{ text }],
    },
  });
  const task = result?.task;

  if (!task?.id || !task?.status?.state) {
    throw new Error('Hermes A2A returned no task result');
  }

  console.log(JSON.stringify(task));
  process.exit(isTerminal(task.status.state) && task.status.state !== 'TASK_STATE_COMPLETED' ? 1 : 0);
}

async function waitForTask(taskId) {
  if (!/^task-[a-f0-9]{16}$/i.test(taskId || '')) {
    throw new Error('Task ID must match task-<16 hexadecimal characters>');
  }

  const startedAt = Date.now();

  while (Date.now() - startedAt < MAX_WAIT_MS) {
    const task = await requestA2A('GetTask', { id: taskId });
    const state = task?.status?.state;

    if (isTerminal(state)) {
      console.log(JSON.stringify(task));
      process.exit(state === 'TASK_STATE_COMPLETED' ? 0 : 1);
    }

    if (!['TASK_STATE_SUBMITTED', 'TASK_STATE_WORKING'].includes(state)) {
      throw new Error(`Unexpected Hermes A2A task state: ${state || 'missing'}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Hermes A2A task ${taskId} did not finish within ${MAX_WAIT_MS}ms`);
}

async function main() {
  const [command, value] = process.argv.slice(2);

  if (process.argv.length === 3 && command === 'send') {
    await sendTask();
    return;
  }

  if (process.argv.length === 4 && command === 'wait') {
    await waitForTask(value);
    return;
  }

  throw new Error('Usage: hermes-a2a-task.js send | wait <task-id>');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
