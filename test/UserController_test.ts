import test from 'tape-await';
import UserController from '../src/controller/UserController';

test('UserController', async (t) => {
  await UserController.getUsers(ctx);
  t.ok(true);
});
