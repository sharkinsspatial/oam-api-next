import { Context } from 'koa';
import createToken from '../util/createToken';

const jwtController = {
  getJWT: async (ctx: Context) => {
    console.log(ctx.state.user);
    ctx.status = 200;
    const { id, name, contactEmail } = ctx.state.user;
    const jwt = createToken(id, name, contactEmail, 'user', '1d');

    const htmlWithJWT = `
      <html>
        <script type="text/javascript">
          window.opener.postMessage({"access_token": "${jwt}"}, '*');
          window.close();
        </script>
      </html>`;
    ctx.body = htmlWithJWT;
  }
};

export default jwtController;
