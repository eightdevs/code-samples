import { model } from "mongoose";
import { IMessage, IMessageDocument } from "./message.interface";
import MessageSchema from "./message.schema";

const Model = model<IMessageDocument>("Message", MessageSchema, "messages");

export class Message extends Model implements IMessage {

}
