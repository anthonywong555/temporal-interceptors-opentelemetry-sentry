# temporal-interceptors-opentelemetry-sentry

An example of sending traces, from your Temporal Worker, to Sentry.

## Prerequisite

- [Temporal Server](https://github.com/temporalio/cli/#installation)
- [Sentry](https://sentry.io/)
- [Sentry DNS](https://docs.sentry.io/concepts/key-terms/dsn-explainer/)
- [Sentry Auth Token](https://docs.sentry.io/cli/configuration/)

## Getting Started

Copy the .env-example file and rename it to .env. Modify the .env with the following:

| key                  | value                            |
|----------------------|----------------------------------|
| SENTRY_DNS           | http://XXXXX.com                 |
| SENTRY_AUTH_TOKEN    | sntrys_XXXXX                     |
| NODE_ENV             | development \| uat \| production |
| WORKFLOW_BUNDLE_PATH | ../lib/workflow-bundle.js        |

### Running this sample in development

1. `temporal server start-dev` to start [Temporal Server](https://github.com/temporalio/cli/#installation).
1. `npm install` to install dependencies.
1. `npm run start.watch` to start the Worker.
1. In another shell, `npm run workflow` to run the Workflow.

The Workflow should return:

```sh
Hello, Temporal!
```

The Worker should return:

```sh
🤖: Sentry is Online... Beep Boop
🤖: Connecting to Local Temporal
🤖: Temporal Worker Online! Beep Boop Beep!
🤖: Node Env development
{
  resource: { attributes: { 'service.name': 'interceptors-sample-worker' } },
  instrumentationScope: {
    name: '@temporalio/interceptor-workflow',
    version: undefined,
    schemaUrl: undefined
  },
  traceId: 'a57e18db0d973fc7e8c3971bf6f94258',
  parentId: '2858d078e7ab6fce',
  traceState: undefined,
  name: 'StartActivity:greet',
  id: '9850cdda3a6c9dc2',
  kind: 0,
  timestamp: 1725667289766000,
  duration: 44000,
  attributes: {
    workflowId: 'otel-example-0',
    runId: '9b6469fc-2b89-4d4d-87a1-c07b778861cc',
    workflowType: 'example',
    searchAttributes: {},
    memo: undefined,
    parent: undefined,
    lastResult: undefined,
    lastFailure: undefined,
    taskQueue: 'interceptors-opentelemetry-example',
    namespace: 'default',
    firstExecutionRunId: '9b6469fc-2b89-4d4d-87a1-c07b778861cc',
    continuedFromExecutionRunId: undefined,
    startTime: 2024-09-07T00:01:29.765Z,
    runStartTime: 2024-09-07T00:01:29.766Z,
    executionTimeoutMs: undefined,
    executionExpirationTime: undefined,
    runTimeoutMs: undefined,
    taskTimeoutMs: 10000,
    retryPolicy: undefined,
    attempt: 1,
    cronSchedule: undefined,
    cronScheduleToScheduleInterval: undefined,
    historyLength: 9,
    historySize: 2589,
    continueAsNewSuggested: false,
    currentBuildId: '@temporalio/worker@1.11.1+ea9b865b508aa1f0c37e82a16f5bcedf7408624f6a440301481ee4539bdbf49f',
    unsafe: { isReplaying: false, now: [Function: now] }
  },
  status: { code: 1 },
  events: [],
  links: []
}
{
  resource: { attributes: { 'service.name': 'interceptors-sample-worker' } },
  instrumentationScope: {
    name: '@temporalio/interceptor-workflow',
    version: undefined,
    schemaUrl: undefined
  },
  traceId: 'a57e18db0d973fc7e8c3971bf6f94258',
  parentId: undefined,
  traceState: undefined,
  name: 'RunWorkflow:example',
  id: '2858d078e7ab6fce',
  kind: 0,
  timestamp: 1725667289766000,
  duration: 44000,
  attributes: {
    workflowId: 'otel-example-0',
    runId: '9b6469fc-2b89-4d4d-87a1-c07b778861cc',
    workflowType: 'example',
    searchAttributes: {},
    memo: undefined,
    parent: undefined,
    lastResult: undefined,
    lastFailure: undefined,
    taskQueue: 'interceptors-opentelemetry-example',
    namespace: 'default',
    firstExecutionRunId: '9b6469fc-2b89-4d4d-87a1-c07b778861cc',
    continuedFromExecutionRunId: undefined,
    startTime: 2024-09-07T00:01:29.765Z,
    runStartTime: 2024-09-07T00:01:29.766Z,
    executionTimeoutMs: undefined,
    executionExpirationTime: undefined,
    runTimeoutMs: undefined,
    taskTimeoutMs: 10000,
    retryPolicy: undefined,
    attempt: 1,
    cronSchedule: undefined,
    cronScheduleToScheduleInterval: undefined,
    historyLength: 9,
    historySize: 2589,
    continueAsNewSuggested: false,
    currentBuildId: '@temporalio/worker@1.11.1+ea9b865b508aa1f0c37e82a16f5bcedf7408624f6a440301481ee4539bdbf49f',
    unsafe: { isReplaying: false, now: [Function: now] }
  },
  status: { code: 1 },
  events: [],
  links: []
}
```

### Pushing the Source Map to Sentry

Modify the `package.json`'s source map script `sentry:sourcemaps` to target to your own Sentry Instance.
```
sentry-cli sourcemaps inject --org sentry --project temporal ./lib && sentry-cli --url http://192.168.50.245:9000 sourcemaps upload --org sentry --project temporal ./lib
```

1. `npm run build` to build the Worker script and Activities code.
1. `npm run build:workflow` to build the Workflow code bundle.
1. `npm run sentry:sourcemaps` Uploads the `lib` directory to Sentry.
1. `node lib/worker.js` to run the production Worker.