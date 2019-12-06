import { Errors } from "moleculer";

export class ErrorException extends Errors.ValidationError {
  constructor(msg: string) {
    super(msg || `Internal Server Error`, msg, {});
  }
}
