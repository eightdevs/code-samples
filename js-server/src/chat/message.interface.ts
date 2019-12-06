import { Document } from "mongoose";
import { ICreatedUpdated } from "../common/created-updated.interface";

export interface IMessage {
  chatId: string;
  from: string;
  body: string;
}

export interface IMessageUpdate {
  id: string;
  body: string;
}

export interface IMessageDocument extends IMessage, ICreatedUpdated, Document {}
