import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { ErrorRequestHandler, Express, NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { GetTokenCallback, UnauthorizedError } from "express-jwt";
import unless from "express-unless";
import { Errors, Service, ServiceBroker } from "moleculer";

dotenv.config();

const { PORT, JWT_SECRET } = process.env as { PORT: string, JWT_SECRET: string };

const getToken: GetTokenCallback = (req: Request) => {
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const tokenUpdate = (broker: ServiceBroker): RequestHandler & { unless: typeof unless } => {
  const middleware = async (req: Request & { token: any }, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { userId } = req.user as { userId: string };
      req.token = await broker.call("auth.createJWT", { userId });
      next();
    } catch (err) {
      next(err);
    }
  };
  middleware.unless = unless;
  return middleware as any;
};

const debug = (): RequestHandler => {
  const middleware = async (req: Request & { id: string }, res: Response, next: NextFunction): Promise<any> => {
    next();
  };
  middleware.unless = unless;
  return middleware as any;
};

export class GatewayService extends Service {
  private server: Express;
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      actions: {
      },
      created: this.created,
      dependencies: ["auth", "chat"],
      events: {},
      name: "gateway",
      settings: {
        port: PORT || 4000,
      },
      started: this.started,
    });
  }

  private async created(): Promise<void> {
    this.server = express();
  }

  private async started(): Promise<void> {
    this.server.use("*",
      jwt({ getToken, secret: JWT_SECRET }).unless({ path: ["/signin", "/signup"] }),
      tokenUpdate(this.broker).unless({ path: ["/signin", "/signup"] }),
    );
    this.server.enable("trust proxy");
    // for parsing application/json
    this.server.use(bodyParser.json());
    // for parsing application/x-www-form-urlencoded
    this.server.use(bodyParser.urlencoded({ extended: false }));
    this.server.use(cors({
      origin: "*",
    }));
    this.server.use(debug()),
    this.server.enable("trust proxy");
    // for parsing application/json
    this.server.use(bodyParser.json());
    // for parsing application/x-www-form-urlencoded
    this.server.use(bodyParser.urlencoded({ extended: false }));

    // Routes
    this.server.post("/signin", this.createExternalRouteHandler("auth.signin"));
    this.server.post("/signup", this.createExternalRouteHandler("auth.signup"));

    this.server.get("/chat", this.createExternalRouteHandler("chat.getChatList"));
    this.server.post("/chat", this.createExternalRouteHandler("chat.createChat"));

    this.server.post("/message", this.createExternalRouteHandler("chat.createMessage"));
    this.server.get("/message/:id", this.createExternalRouteHandler("chat.getMessage"));
    this.server.put("/message/:id", this.createExternalRouteHandler("chat.updateMessage"));

    this.server.use(this.errorHandler());

    this.server.listen(this.settings.port, () => {
      this.logger.info(`🚀 Gateway server is available at ${this.settings.path}`);
    });
  }

  private createExternalRouteHandler(action: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      // this.logger.info("Req", req.params);
      try {
        const { token } = req as Request & { token?: string };
        const result: JSON = await this.broker.call(
          action,
          { jwt: req.user, ...req.params, ...req.query, ...req.body },
        );
        res.json({ status: 200, token, data: result });
      } catch (e) {
        next(e);
      }
    };
  }

  private errorHandler(): ErrorRequestHandler {
    return async (err: any, req: Request, res: Response, next: NextFunction): Promise<any> => {
      switch (true) {
        case (err instanceof Errors.MoleculerError): {
          const me: Errors.MoleculerError = err as Errors.MoleculerError;
          const { code, message } = me;
          res.status(code).json({ error: { code, message } });
          break;
        }
        case (err instanceof UnauthorizedError): {
          res.status(401).json({ error: { code: 401, message: err.message } });
          break;
        }
        default:
          res.status(500).json({ error: { code: 500, message: err.message } });
      }
    };
  }
}
