import { Context, Service, ServiceBroker } from "moleculer";
import { IUserComparePassword, IUserCreated, IUserDocument, IUserUpdated } from "./interface";
import { User } from "./model";
import { UserValidator } from "./validator";

export class UserService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      actions: {
        comparePassword: this.comparePassword,
        create: this.create,
        getById: this.getById,
        getByIds: this.getByIds,
        getByLogin: this.getByLogin,
        remove: this.remove,
        update: this.update,
      },
      events: {},
      name: "users",
      settings: {},
    });
  }

  private async comparePassword(ctx: Context): Promise<boolean> {
    const { id, password } = ctx.params as IUserComparePassword;
    this.logger.info("ComparePassword", id, password);
    /** VALIDATORS */
    const validator = new UserValidator();
    await validator.load(id);
    await validator.exists(id);
    /** PROCESSING */
    const [doc] = await validator.get(id) as [IUserDocument];
    return new User(doc).comparePassword(password);
  }

  private async getByLogin(ctx: Context): Promise<IUserDocument | null> {
    const { login } = ctx.params as { login: string };
    return User.findOne({ login }).exec();
  }

  private async create(ctx: Context): Promise<IUserDocument> {
    const { login, password } = ctx.params as IUserCreated;
    this.logger.info(ctx.params);
    /** VALIDATORS */
    await UserValidator.loginNotExists(login);
    /** PROCESSING */
    return User.create({ login, password });
  }

  private async getById(ctx: Context): Promise<IUserDocument | null> {
    const { id } = ctx.params as { id: string };
    return User.findById(id).exec();
  }

  private async getByIds(ctx: Context): Promise<IUserDocument[]> {
    const { ids } = ctx.params as { ids: string[] };
    return User.find({ _id: { $in: ids } }).exec();
  }

  private async update(ctx: Context): Promise<IUserDocument> {
    const { id, login, password } = ctx.params as IUserUpdated;
    /** VALIDATORS */
    const validator = new UserValidator();
    await validator.load(id);
    await validator.exists(id);
    await UserValidator.loginNotExistsWithExclude([login], [id]);
    /** PROCESSING */
    return await User.findByIdAndUpdate(id, { $set: { login, password } }, { new: true }).exec() as IUserDocument;
  }

  private async remove(ctx: Context): Promise<IUserDocument | null> {
    const { id } = ctx.params as { id: string };
    return User.findByIdAndRemove(id).exec();
  }
}
