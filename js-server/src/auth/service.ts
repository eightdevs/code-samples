import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Context, Service, ServiceBroker } from "moleculer";
import { ErrorException } from "../common/error-exception";
import { ErrorType } from "../common/error-type";
import { IUserDocument } from "../users/interface";
import { IAuthSignIn, IAuthSignUp, IToken } from "./interface";

dotenv.config();

const { JWT_SECRET } = process.env as { JWT_SECRET: string };

const createJWTToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "360d" });
};

export class AuthService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      actions: {
        createJWT: this.createJWT,
        signin: this.signin,
        signup: this.signup,
      },
      dependencies: ["users"],
      events: {},
      name: "auth",
      settings: {},
    });
  }

  private async signin(ctx: Context): Promise<IToken> {
    const { login, password } = ctx.params as IAuthSignIn;
    this.logger.info(ctx.params);
    /** VALIDATORS */
    const user = await this.broker.call("users.getByLogin", { login }) as IUserDocument;
    if (!user) {
      throw new ErrorException(ErrorType.USER_NOT_FOUND);
    }
    const isEqual = await this.broker.call("users.comparePassword", { id: user.id, password }) as boolean;
    if (!isEqual) {
      throw new ErrorException(ErrorType.USER_PASSWORD_INCORRECT);
    }
    /** PROCESSING */
    const token = createJWTToken(user.id);
    return { token };
  }

  private async signup(ctx: Context): Promise<IToken> {
    const { login, password } = ctx.params as IAuthSignUp;
    const user = await this.broker.call("users.create", { login, password }) as IUserDocument;
    const token = createJWTToken(user.id);
    return { token };
  }

  private async createJWT(ctx: Context): Promise<string> {
    const { userId } = ctx.params as { userId: string };
    return createJWTToken(userId);
  }
}
