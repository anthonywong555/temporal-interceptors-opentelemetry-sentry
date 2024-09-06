import { resource, exporter, setupSentry } from './instrumentation';
import { Connection, Client } from '@temporalio/client';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OpenTelemetryWorkflowClientInterceptor } from '@temporalio/interceptors-opentelemetry';
import { example } from './workflows';
import { getConnectionOptions, namespace, taskQueue } from './env';

async function run() {
  // Setup Sentry
  await setupSentry();

  const otel = new NodeSDK({ traceExporter: exporter, resource });
  await otel.start();

  // Connect to localhost with default ConnectionOptions,
  // pass options to the Connection constructor to configure TLS and other settings.
  const connectionOptions = await getConnectionOptions();
  const connection = await Connection.connect(connectionOptions);
  // Attach the OpenTelemetryClientCallsInterceptor to the client.
  const client = new Client({
    connection,
    namespace,
    interceptors: {
      workflow: [new OpenTelemetryWorkflowClientInterceptor()],
    },
  });

  try {
    const result = await client.workflow.execute(example, {
      taskQueue,
      workflowId: 'otel-example-0',
      args: ['Temporal'],
    });
    console.log(result); // Hello, Temporal!
  } finally {
    await otel.shutdown();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
