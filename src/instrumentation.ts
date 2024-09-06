import * as Sentry from '@sentry/node';
import { SentrySpanProcessor, SentryPropagator, SentrySampler } from '@sentry/opentelemetry';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { getenv } from './env';

export const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'interceptors-sample-worker',
});
// Export spans to console for simplicity
export const exporter = new ConsoleSpanExporter();

export async function setupSentry() {
  const sentryClient = Sentry.init({
    dsn: getenv('SENTRY_DNS'),
    skipOpenTelemetrySetup: true,
    tracesSampleRate: 1.0,
  });
  
  const provider = new NodeTracerProvider({
    sampler: sentryClient ? new SentrySampler(sentryClient) : undefined,
  });
  
  provider.addSpanProcessor(new SentrySpanProcessor());
  
  provider.register({
    propagator: new SentryPropagator(),
    contextManager: new Sentry.SentryContextManager(),
  });
  
  Sentry.validateOpenTelemetrySetup();
  console.info('🤖: Sentry is Online... Beep Boop');
}