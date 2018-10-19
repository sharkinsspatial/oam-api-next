import { Context } from 'koa';
import { getRepository, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { Item } from '../entity/item';
import { mapCentroids } from './geoJSONMapper';

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
  }
};

export default itemsController;
