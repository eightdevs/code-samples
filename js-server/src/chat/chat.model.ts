import { model } from "mongoose";
import { broker } from "../broker";
import { IChat, IChatDocument, IChatWithMessages } from "./chat.interface";
import ChatSchema from "./chat.schema";

const Model = model<IChatDocument>("Chat", ChatSchema, "chats");

export class Chat extends Model implements IChat {
}
