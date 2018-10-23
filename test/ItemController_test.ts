import * as sinon from 'sinon';
import * as test from 'tape-await';
import { ImportMock } from 'ts-mock-imports';
import { Context } from 'koa';
import ItemsController from '../src/controller/ItemsController';
import * as typeorm from 'typeorm';
import * as geoJSONMapper from '../src/util/geoJSONMapper';

test('ItemsController getItemCentroids', async (t) => {
  const items = ['item1', 'item2'];
  const select = sinon.stub().returns({
    getMany: sinon.stub().resolves(items)
  });
  const createQueryBuilder = sinon.stub().returns({
    select
  });
  const repository = {
    createQueryBuilder
  };
  const getRepositoryStub =
    ImportMock.mockFunction(typeorm, 'getRepository', repository);
  const mapCentroidsStub =
    ImportMock.mockFunction(geoJSONMapper, 'mapCentroids', {});

  const ctx = { status: 401, body: [] } as Context;
  await ItemsController.getItemCentroids(ctx);
  t.ok(createQueryBuilder.calledWith('item'));
  t.ok(select.calledWith(['item.id', 'item.centroid']));
  t.equal(ctx.status, 200);
  getRepositoryStub.restore();
  mapCentroidsStub.restore();
});

test('ItemsController getFilteredItems', async (t) => {
  const items = ['item1', 'item2'];
  const where = sinon.stub().returns({
    getMany: sinon.stub().resolves(items)
  });
  const createQueryBuilder = sinon.stub().returns({ where });
  const repository = {
    createQueryBuilder
  };
  const getRepositoryStub =
    ImportMock.mockFunction(typeorm, 'getRepository', repository);
  const mapItemsStub =
    ImportMock.mockFunction(geoJSONMapper, 'mapItems', {});
  const itemIds = [1, 2, 3];
  // @ts-ignore
  const ctx = {
    status: 401,
    request: { body: itemIds }
  } as Context;
  await ItemsController.getFilteredItems(ctx);
  t.ok(createQueryBuilder.calledWith('item'));
  t.ok(where.calledWith('item.id IN (:...itemIds)', { itemIds }));
  t.equal(ctx.status, 200);
  getRepositoryStub.restore();
  mapItemsStub.restore();
});
