import bcrypt from "bcrypt";
import { Schema } from "mongoose";
import { IUserDocument } from "./interface";
import { User } from "./model";

export const UserSchema: Schema = new Schema({
  login: String,
  password: String,
}, { timestamps: true });

UserSchema.pre("save", async function(this: IUserDocument) {
  // only hash the password if it has been modified (or is new)
  if (this.isModified("password")) {
    // generate a salt
    const salt = await bcrypt.genSalt(User.saltRounds);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
  }
});

UserSchema.pre("findOneAndUpdate", async function() {
  if (this.getUpdate().hasOwnProperty("$set")) {
    if (this.getUpdate().$set.password) {
      const password: string = String(this.getUpdate().$set.password);
      const salt = await bcrypt.genSalt(User.saltRounds);
      const hash = await bcrypt.hash(password, salt);
      this.getUpdate().$set.password = hash;
    } else {
      delete this.getUpdate().$set.password;
    }
  }
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.index({ login: 1 });
UserSchema.index({ createdAt: 1 });
UserSchema.index({ updatedAt: 1 });

export default UserSchema;
