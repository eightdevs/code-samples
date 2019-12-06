import bcrypt from "bcrypt";
import { model } from "mongoose";
import { broker } from "../broker";
import { IUser, IUserDocument } from "./interface";
import UserSchema from "./schema";

const Model = model<IUserDocument>("User", UserSchema, "users");

export class User extends Model implements IUser {
  public static readonly saltRounds = 10;

  public async comparePassword(password: string): Promise<boolean> {
    broker.logger.info("comparePassword.MODEL", this.password, password);
    return bcrypt.compare(String(password), this.password);
  }
}
