import { Document } from "mongoose";
import { ICreatedUpdated } from "../common/created-updated.interface";

export interface IUser {
  login: string;
  password: string;
}

export interface IUserCreated {
  login: string;
  password: string;
}

export interface IUserUpdated {
  id: string;
  login: string;
  password?: string;
}

export interface IUserComparePassword {
  id: string;
  password: string;
}

export interface IUserDocument extends IUser, ICreatedUpdated, Document {}
