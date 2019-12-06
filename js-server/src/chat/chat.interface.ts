import { Document } from "mongoose";
import { ICreatedUpdated } from "../common/created-updated.interface";
import { IMessageDocument } from "./message.interface";

export interface IChat {
  members: string[];
}

export interface IChatWithMessages extends IChat {
  messages: IMessageDocument[];
}

export interface IChatDocument extends IChat, ICreatedUpdated, Document {}
