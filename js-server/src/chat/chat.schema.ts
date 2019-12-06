import { Schema } from "mongoose";

export const ChatSchema: Schema = new Schema({
  members: [String],
}, { timestamps: true });

ChatSchema.set("toObject", { virtuals: true });
ChatSchema.set("toJSON", { virtuals: true });

ChatSchema.index({ members: 1 });
ChatSchema.index({ createdAt: 1 });
ChatSchema.index({ updatedAt: 1 });

export default ChatSchema;
