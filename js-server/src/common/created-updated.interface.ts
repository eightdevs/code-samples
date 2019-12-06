import { Document } from "mongoose";

export interface ICreatedUpdated {
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatedUpdatedDocument extends ICreatedUpdated, Document {}
