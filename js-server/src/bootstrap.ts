import dotenv from "dotenv";
import { Service } from "moleculer";
import { connect, set } from "mongoose";
import { broker } from "./broker";

// Services
import { AuthService } from "./auth/service";
import { ChatService } from "./chat/service";
import { GatewayService } from "./gateway/service";
import { UserService } from "./users/service";

dotenv.config();

const { MONGODB_URI, SERVICES, DEV } = process.env;

// set("debug", true);
set("useCreateIndex", true);
set("useFindAndModify", false);
set("useUnifiedTopology", true);

export async function bootstrap() {
  const services: string[] = (SERVICES || "").split(",").map((s: string) => s.trim());
  broker.logger.info("SERVICES", services);
  const serviceMap: Map<string, typeof Service> = new Map<string, typeof Service>([
    ["gateway", GatewayService],
    ["auth", AuthService],
    ["chat", ChatService],
    ["users", UserService],
  ]);
  services.forEach((name: string) => {
    const service = serviceMap.get(name);
    if (service) {
      broker.createService(service);
    }
  });

  await connect(
    MONGODB_URI || "mongodb://localhost:27017/local",
    {
      bufferMaxEntries: 0,
      connectTimeoutMS: 10000,
      poolSize: 10,
      reconnectInterval: 500,
      reconnectTries: Number.MAX_VALUE,
      socketTimeoutMS: 45000,
      useNewUrlParser: true,
    },
  );

  await broker.start();
  if (DEV && DEV === "true") {
    broker.repl();
  }
}
