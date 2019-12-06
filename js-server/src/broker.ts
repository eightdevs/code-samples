import * as dotenv from "dotenv";
import { BrokerOptions, LogLevels, ServiceBroker } from "moleculer";

dotenv.config();

const {
  LOGGER, LOGLEVEL, TRANSPORTER, REGISTRY_STRATEGY, REQUESTTIMEOUT, CIRCUITBREAKER_ENABLED, METRICS,
  SERIALIZER, NAMESPACE, CACHER,
} = process.env;

const opts: BrokerOptions = {
  cacher: CACHER || "Memory",
  circuitBreaker: {
    enabled: (CIRCUITBREAKER_ENABLED === "true"),
  },
  logLevel: (LOGLEVEL || "info") as LogLevels,
  logger: (LOGGER === "true"),
  metrics: (METRICS === "true"),
  namespace: NAMESPACE,
  registry: {
    strategy: REGISTRY_STRATEGY,
  },
  requestTimeout: parseInt(REQUESTTIMEOUT || "5000", 10),
  serializer: SERIALIZER,
  transporter: TRANSPORTER,
};

export const broker = new ServiceBroker(opts);
