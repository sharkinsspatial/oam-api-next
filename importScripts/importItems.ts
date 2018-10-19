import { Writable } from 'stream';
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as PostgressConnectionStringParser from 'pg-connection-string';
import polylabel from 'polylabel';
import bboxPolygon from '@turf/bbox-polygon';
import { Geometry } from 'geojson';
import { config } from '../src/config';
import { BinarySplitter } from './binarySplitter';
import { User } from '../src/entity/user';
import { Item } from '../src/entity/item';

class ItemImporter extends Writable {
  constructor() {
    super({
      objectMode: true
    });
  }

  async _write(line, _, callback) {
    try {
      const meta = JSON.parse(line.toString());
      const {
        wmts,
        tms,
        thumbnail,
        sensor,
        license,
        tags,
        crs,
        url,
        ...properties
      } = meta.properties;

      if (meta.provider !== 'Astro Digital') {
        let user;
        if (meta.user != null) {
          user = await User.findOne({
            where: {
              mongoId: meta.user.$oid
            }
          });
        }
        let centroidGeom;
        if (meta.geojson.type === 'MultiPolygon') {
          const bboxGeoJSON = bboxPolygon(meta.bbox);
          centroidGeom = polylabel(bboxGeoJSON.geometry.coordinates);
        } else {
          centroidGeom = polylabel(meta.geojson.coordinates);
        }
        const centroid = {
          type: 'Point',
          coordinates: centroidGeom
        } as Geometry ;
        const item = Item.create({
          user,
          thumbnail,
          crs,
          license,
          centroid,
          contact: meta.contact,
          geom: meta.geojson,
          gsd: meta.gsd,
          fileSize: meta.file_size,
          href: url || meta.uuid,
          title: meta.title,
          startDatetime: meta.acquisition_start && new Date(meta.acquisition_start.$date),
          endDatetime: meta.acquisition_end && new Date(meta.acquisition_end.$date),
          platform: meta.platform.toLowerCase(),
          instrument: sensor,
          keywords: tags,
          provider: meta.provider
        });
        await item.save();
      }
    } catch (err) {
      console.log(err);
      console.log(line.toString());
      process.exit();
    }
    return callback();
  }
}

const connectionOptions = PostgressConnectionStringParser.parse(config.databaseUrl);
createConnection({
  type: 'postgres',
  host: connectionOptions.host,
  port: connectionOptions.port,
  username: connectionOptions.user,
  password: connectionOptions.password,
  database: connectionOptions.database,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Item
  ],
  extra: {
    ssl: config.dbsslconn // if not development, will use SSL
  }
}
).then(() =>
  process.stdin.pipe(new BinarySplitter()).pipe(new ItemImporter())
);
