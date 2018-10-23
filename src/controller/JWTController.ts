import { Context } from 'koa';

const jwtController = {
  getJWT: async (ctx: Context) => {
    ctx.status = 200;
    // @ts-ignore
    ctx.body = ctx.req.user;
  }
};

export default jwtController;
