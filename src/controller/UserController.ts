import { BaseContext } from 'koa';
import { getRepository, Repository, Not, Equal } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { User } from '../entity/user';

const userController =  {
  getUsers: async (ctx: BaseContext) => {
    const userRepository: Repository<User> = getRepository(User);
    const users: User[] = await userRepository.find();
    ctx.status = 200;
    ctx.body = users;
  }
};

export default userController;
