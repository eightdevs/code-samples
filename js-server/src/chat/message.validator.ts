import _ from "lodash";
import { broker } from "../broker";
import { ErrorException } from "../common/error-exception";
import { ErrorType } from "../common/error-type";
import { IMessageDocument } from "./message.interface";

export class MessageValidator {

  private data: IMessageDocument[] = [];

  public async load(...ids: string[]): Promise<void> {
    this.data = await broker.call("chat.getMessageByIds", { ids }) as IMessageDocument[];
  }

  public async exists(...ids: string[]): Promise<void> {
    const find: string[] = _.intersection(this.data.map((d) => d.id), ids);
    if (find.length < ids.length) {
      throw new ErrorException(ErrorType.CHAT_MESSAGE_NOT_FOUND);
    }
  }

  public async owner(userId: string, ...ids: string[]): Promise<void> {
    const data: IMessageDocument[] = await this.get(...ids);
    const res = [];
    for (const d of data) {
      if (d.from === userId) {
        res.push(d.id);
      }
    }
    if (res.length !== ids.length) {
      throw new ErrorException(ErrorType.CHAT_MESSAGE_NOT_OWNER);
    }
  }

  public async get(...ids: string[]): Promise<IMessageDocument[]> {
    const data: IMessageDocument[] = this.data.filter(
      (d: IMessageDocument) => ids.indexOf(d.id) !== -1,
    );
    if (data.length !== ids.length) {
      throw new Error(`Data not found. Use method "load" before use "get"`);
    }
    return data;
  }
}
