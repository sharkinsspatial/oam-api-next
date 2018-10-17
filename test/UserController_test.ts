const test = require('tape-await');
const sinon = require('sinon');
//import test from 'tape-await';
import { ImportMock } from 'ts-mock-imports';
import { Context } from 'koa';
import UserController from '../src/controller/UserController';
import * as typeorm from 'typeorm';

test('UserController', async (t) => {
  const find = sinon.stub();
  find.resolves(['first', 'second']);
  const repository = { find }; 
  const getRepositoryStub =
    ImportMock.mockFunction(typeorm, 'getRepository', repository); 
  const ctx = { status: 401, body: [] } as Context;
  await UserController.getUsers(ctx);
  t.equal(ctx.status, 200);
  t.equal(ctx.body[1], 'second');
});
