import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

const sentry = Sentry.init({
  dsn:
    "https://5c1de2e212574b2b8c1d8c326220c1f5@o556609.ingest.sentry.io/5687830",

  // Alternatively, use `process.env.npm_package_version` for a dynamic release version
  // if your build tool supports it.
  release: "millicast-sdk-js@1.0.0",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

export default sentry;
