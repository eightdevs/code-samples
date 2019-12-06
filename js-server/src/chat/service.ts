import { Context, Service, ServiceBroker } from "moleculer";
import { IJWT } from "../auth/interface";
import { UserValidator } from "../users/validator";
import { IChatDocument, IChatWithMessages } from "./chat.interface";
import { Chat } from "./chat.model";
import { ChatValidator } from "./chat.validator";
import { IMessage, IMessageDocument, IMessageUpdate } from "./message.interface";
import { Message } from "./message.model";
import { MessageValidator } from "./message.validator";

export class ChatService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      actions: {
        createChat: this.createChat,
        createMessage: this.createMessage,
        getByIds: this.getByIds,
        getChatList: this.getChatList,
        getLastMessages: this.getLastMessages,
        getLastMessagesByChats: this.getLastMessagesByChats,
        getMessage: this.getMessage,
        getMessageByIds: this.getMessageByIds,
        updateMessage: this.updateMessage,
      },
      events: {},
      name: "chat",
      settings: {},
    });
  }

  private async getMessageByIds(ctx: Context): Promise<IMessageDocument[]> {
    const { ids } = ctx.params as { ids: string[] };
    return Message.find({ _id: { $in: ids } }).exec();
  }

  private async getByIds(ctx: Context): Promise<IChatDocument[]> {
    const { ids } = ctx.params as { ids: string[] };
    return Chat.find({ _id: { $in: ids } }).exec();
  }

  private async createChat(ctx: Context): Promise<IChatWithMessages | null> {
    const { memberId, jwt: { userId } } = ctx.params as { memberId: string } & IJWT;
    this.logger.info("CREATE_CHAT", ctx.params);
    /** VALIDATORS */
    const validator = new UserValidator();
    await validator.load(userId, memberId);
    await validator.exists(userId, memberId);
    /** PROCESSING */
    let exists: IChatDocument | null = await Chat.findOne({ members: { $all: [userId, memberId] } }).exec();
    if (!exists) {
      exists = await Chat.create({ members: [userId, memberId] });
    }
    const messages =
      await this.broker.call("chat.getLastMessages", { userId, chatId: exists.id }) as IMessageDocument[];
    return { ...exists.toJSON(), messages };
  }

  private async getChatList(ctx: Context): Promise<IChatWithMessages[]> {
    const { jwt: { userId } } = ctx.params as IJWT;
    const chats: IChatDocument[] = await Chat.find( { members: { $in: [userId] } }).exec();
    const messagePool: Map<string, IMessageDocument[]> = await this.broker.call(
      "chat.getLastMessagesByChats", { userId, chatIds: chats.map((d: IChatDocument) => d.id) },
    ) as Map<string, IMessageDocument[]>;
    const result: IChatWithMessages[] = [];
    for (const chat of chats) {
      const messages = messagePool.get(chat.id) || [];
      result.push({ ...chat.toJSON(), messages });
    }
    this.logger.info(result);
    return result;
  }

  private async createMessage(ctx: Context): Promise<IMessageDocument> {
    const { jwt: { userId }, chatId, from, body } = ctx.params as IMessage & IJWT;
    /** VALIDATORS */
    const validator = new ChatValidator();
    await validator.load(chatId);
    await validator.exists(chatId);
    await validator.isMember(chatId, from, userId);
    /** PROCESSING */
    return Message.create({ chatId, from, body });
  }

  private async getMessage(ctx: Context): Promise<IMessageDocument> {
    const { jwt: { userId }, id } = ctx.params as { id: string } & IJWT;
    /** VALIDATORS */
    const validator = new MessageValidator();
    await validator.load(id);
    await validator.exists(id);
    // other validators...
    /** PROCESSING */
    const [message] = await validator.get(id) as [IMessageDocument];
    return message;
  }

  private async updateMessage(ctx: Context): Promise<IMessageDocument> {
    const { jwt: { userId }, id, body } = ctx.params as IMessageUpdate & IJWT;
    /** VALIDATORS */
    const validator = new MessageValidator();
    await validator.load(id);
    await validator.exists(id);
    await validator.owner(userId);
    /** PROCESSING */
    return await Message.findByIdAndUpdate(id, { $set: { body } }, { new: true }).exec() as IMessageDocument;
  }

  private async getLastMessages(ctx: Context): Promise<IMessageDocument[]> {
    const { chatId, userId, limit = 25 } = ctx.params as { chatId: string, userId: string, limit: number };
    const validator = new ChatValidator();
    await validator.load(chatId);
    await validator.exists(chatId);
    await validator.isMember(chatId, userId);
    /** PROCESSING */
    return Message.find({ chatId }).sort({ _id: -1 }).limit(limit).exec();
  }

  private async getLastMessagesByChats(ctx: Context): Promise<Map<string, IMessageDocument[]>> {
    const { chatIds, userId, limit = 25 } = ctx.params as { chatIds: string[], userId: string, limit: number };
    const validator = new ChatValidator();
    await validator.load(...chatIds);
    await validator.exists(...chatIds);
    for (const chatId of chatIds) {
      await validator.isMember(chatId, userId);
    }
    /** PROCESSING */
    const result: Map<string, IMessageDocument[]> = new Map<string, IMessageDocument[]>();
    const messagePool: IMessageDocument[][] =
      await Promise.all(chatIds.map((chatId: string) => Message.find({ chatId })
      .sort({ _id: -1 }).limit(limit).exec()));
    for (const messages of messagePool) {
      for (const message of messages) {
        const value = result.get(message.chatId) || [];
        value.push(message);
        result.set(message.chatId, value);
      }
    }
    return result;
  }
}
