import { Context } from 'koa';
import createToken from '../util/createToken';

const jwtController = {
  getJWT: async (ctx: Context) => {
    console.log(ctx.state.user);
    ctx.status = 200;
    const { id, name, contactEmail } = ctx.state.user;
    const userJWT = createToken(id, name, contactEmail, 'user', '1d');
    ctx.body = userJWT;
  }
};

export default jwtController;
