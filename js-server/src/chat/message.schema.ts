import { Schema } from "mongoose";

export const MessageSchema: Schema = new Schema({
  body: String,
  chatId: String,
  from: String,
}, { timestamps: true });

MessageSchema.set("toObject", { virtuals: true });
MessageSchema.set("toJSON", { virtuals: true });

MessageSchema.index({ chatId: 1 });
MessageSchema.index({ from: 1 });
MessageSchema.index({ body: 1 });
MessageSchema.index({ createdAt: 1 });
MessageSchema.index({ updatedAt: 1 });

export default MessageSchema;
