import { Context, Request } from 'koa';
import { getRepository, Repository } from 'typeorm';
import * as koaBodyparser from 'koa-bodyparser';
import { validate, ValidationError } from 'class-validator';
import { Item } from '../entity/item';
import { mapCentroids, mapItems } from '../util/geoJSONMapper';

const itemsController = {
  getItemCentroids: async (ctx: Context) => {
    const itemRepository: Repository<Item> = getRepository(Item);
    const items = await itemRepository
      .createQueryBuilder('item')
      .select([
        'item.id',
        'item.centroid'
      ])
      .getMany();
    const centroids = mapCentroids(items);
    ctx.status = 200;
    ctx.body = centroids;
  },

  getFilteredItems: async (ctx: Context) => {
    const itemRepository: Repository<Item> = getRepository(Item);
    const items = await itemRepository
      .createQueryBuilder('item')
      // @ts-ignore
      .where('item.id IN (:...itemIds)', { itemIds: ctx.request.body })
      .getMany();
    const filteredItems = mapItems(items);
    ctx.status = 200;
    ctx.body = filteredItems;
  }
};

export default itemsController;
