import _ from "lodash";
import { broker } from "../broker";
import { ErrorException } from "../common/error-exception";
import { ErrorType } from "../common/error-type";
import { IChatDocument } from "./chat.interface";

export class ChatValidator {

  private data: IChatDocument[] = [];

  public async load(...ids: string[]): Promise<void> {
    this.data = await broker.call("chat.getByIds", { ids }) as IChatDocument[];
  }

  public async exists(...ids: string[]): Promise<void> {
    const find: string[] = _.intersection(this.data.map((d) => d.id), ids);
    if (find.length < ids.length) {
      throw new ErrorException(ErrorType.CHAT_NOT_FOUND);
    }
  }

  public async isMember(chatId: string, ...ids: string[]): Promise<void> {
    const find: IChatDocument[] = this.data.filter(
      (d: IChatDocument) => d.id === chatId,
    );
    if (find.length <= 0) {
      throw new ErrorException(ErrorType.CHAT_NOT_FOUND);
    }
    const chat = find[0] as IChatDocument;
    for (const id of ids) {
      if (chat.members.indexOf(id) === -1) {
        throw new ErrorException(ErrorType.CHAT_NOT_MEMBER);
      }
    }
  }

  public async get(...ids: string[]): Promise<IChatDocument[]> {
    const data: IChatDocument[] = this.data.filter(
      (d: IChatDocument) => ids.indexOf(d.id) !== -1,
    );
    if (data.length !== ids.length) {
      throw new Error(`Data not found. Use method "load" before use "get"`);
    }
    return data;
  }
}
