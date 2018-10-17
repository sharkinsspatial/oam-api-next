import * as sinon from 'sinon';
import * as test from 'tape-await';
import { ImportMock } from 'ts-mock-imports';
import { Context } from 'koa';
import UserController from '../src/controller/UserController';
import * as typeorm from 'typeorm';

test('UserController getUsers', async (t) => {
  const find = sinon.stub();
  find.resolves(['first', 'second']);
  const repository = { find };
  const getRepositoryStub =
    ImportMock.mockFunction(typeorm, 'getRepository', repository);
  const ctx = { status: 401, body: [] } as Context;
  await UserController.getUsers(ctx);
  t.equal(ctx.status, 200, 'Sets status as 200');
  t.equal(ctx.body[1], 'second', 'Return users as body');
  getRepositoryStub.restore();
});

test('UserController getUser found', async (t) => {
  const findOne = sinon.stub();
  const user = 'user';
  findOne.resolves(user);
  const repository = { findOne };
  const getRepositoryStub =
    ImportMock.mockFunction(typeorm, 'getRepository', repository);
  const ctx = { status: 401, body: 'none' } as Context;
  ctx.params = { id: 'id' };
  await UserController.getUser(ctx);
  t.equal(ctx.status, 200, 'Sets status as 200');
  t.equal(ctx.body, user, 'Return user as body');
  getRepositoryStub.restore();
});

test('UserController getUser not found', async (t) => {
  const findOne = sinon.stub();
  findOne.resolves(null);
  const repository = { findOne };
  const getRepositoryStub =
    ImportMock.mockFunction(typeorm, 'getRepository', repository);
  const ctx = { status: 401, body: 'none' } as Context;
  ctx.params = { id: 'id' };
  await UserController.getUser(ctx);
  t.equal(ctx.status, 400, 'Sets status as 400');
  getRepositoryStub.restore();
});
