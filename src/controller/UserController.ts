import { Context } from 'koa';
import { getRepository, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { User } from '../entity/user';

const userController =  {
  getUsers: async (ctx: Context) => {
    const userRepository: Repository<User> = getRepository(User);
    const users: User[] = await userRepository.find();
    ctx.status = 200;
    ctx.body = users;
  },

  getUser: async (ctx: Context) => {
    const userRepository: Repository<User> = getRepository(User);
    const user: User = await userRepository.findOne(ctx.params.id);

    if (user) {
      ctx.status = 200;
      ctx.body = user;
    } else {
      ctx.status = 400;
      ctx.body = 'User does not exist';
    }
  }
};

export default userController;
