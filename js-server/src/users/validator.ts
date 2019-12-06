import _ from "lodash";
import { broker } from "../broker";
import { ErrorException } from "../common/error-exception";
import { ErrorType } from "../common/error-type";
import { IUserDocument } from "./interface";
import { User } from "./model";

export class UserValidator {

  public static async loginNotExists(...logins: string[]): Promise<void> {
    const data: IUserDocument[] = await User.find({ login: { $in: logins } }).exec();
    if (data.length > 0) {
      throw new ErrorException(ErrorType.USER_LOGIN_EXISTS);
    }
  }

  public static async loginNotExistsWithExclude(logins: string[], excludeIds: string[] = []): Promise<void> {
    const data: IUserDocument[] = await User.find({ login: { $in: logins }, _id: { $nin: excludeIds } }).exec();
    if (data.length > 0) {
      throw new ErrorException(ErrorType.USER_LOGIN_EXISTS);
    }
  }

  private data: IUserDocument[] = [];

  public async load(...ids: string[]): Promise<void> {
    this.data = await broker.call("users.getByIds", { ids }) as IUserDocument[];
  }

  public async exists(...ids: string[]) {
    const find: string[] = _.intersection(this.data.map((d) => d.id), ids);
    if (find.length < ids.length) {
      throw new ErrorException(ErrorType.USER_NOT_FOUND);
    }
  }

  public async notExists(...ids: string[]) {
    const find: string[] = _.intersection(this.data.map((d) => d.id), ids);
    if (find.length > 0) {
      throw new ErrorException(ErrorType.USER_EXISTS);
    }
  }

  public async get(...ids: string[]): Promise<IUserDocument[]> {
    const data: IUserDocument[] = this.data.filter(
      (d: IUserDocument) => ids.indexOf(d.id) !== -1,
    );
    if (data.length !== ids.length) {
      throw new Error(`Data not found. Use method "load" before use "get"`);
    }
    return data;
  }
}
