import { setupSentry, resource, exporter } from './instrumentation';
import { DefaultLogger, Worker, Runtime, NativeConnection } from '@temporalio/worker';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OpenTelemetryActivityInboundInterceptor, makeWorkflowExporter } from '@temporalio/interceptors-opentelemetry/lib/worker';
import * as activities from './activities';
import { namespace, taskQueue, getConnectionOptions, getWorkflowOptions, env } from './env';

async function main() {
  // Setup Sentry
  await setupSentry();

  const otel = new NodeSDK({ traceExporter: exporter, resource });
  await otel.start();

  // Silence the Worker logs to better see the span output in this sample
  Runtime.install({ logger: new DefaultLogger('WARN') });

  const connectionOptions = await getConnectionOptions();
  const connection = await NativeConnection.connect(connectionOptions);

  const worker = await Worker.create({
    connection,
    namespace,
    taskQueue,
    activities,
    ...getWorkflowOptions(),
    sinks: {
      exporter: makeWorkflowExporter(exporter, resource),
    },
    // Registers opentelemetry interceptors for Workflow and Activity calls
    interceptors: {
      activity: [(ctx) => ({ inbound: new OpenTelemetryActivityInboundInterceptor(ctx) })],
      ...(env != 'production' && {
        workflowModules: [require.resolve('./workflows')],
      })
    },
  });
  try {
    console.info('🤖: Temporal Worker Online! Beep Boop Beep!');
    console.info(`🤖: Node Env ${env}`);
    await worker.run();
  } finally {
    await otel.shutdown();
  }
}

main().then(
  () => void process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
