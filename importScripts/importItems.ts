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

const parseContact = (contactString) => {
  let contactEmail;
  let contactName;
  if (contactString) {
    if (contactString.includes(' - ')) {
      const parts = contactString.split(' - ');
      contactName = parts[0].trim();
      contactEmail = parts[1].trim();
    } else if (contactString.includes(',')) {
      const parts = contactString.split(',');
      contactName = parts[0].trim();
      contactEmail = parts[1].trim();
    } else {
      const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (reg.test(contactString)) {
        contactEmail = contactString.trim();
      } else {
        const parts = contactString.split(' ');
        contactEmail = parts[parts.length - 1].trim();
      }
    }
  }
  return { contactEmail, contactName };
};

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
      const {
        provider,
        user,
        geojson,
        bbox,
        contact,
        gsd,
        file_size,
        title,
        acquisition_start,
        acquisition_end,
        platform,
        uuid
      } = meta;
      if (provider !== 'Astro Digital') {
        let dbUser;
        if (user != null) {
          dbUser = await User.findOne({
            where: {
              mongoId: meta.user.$oid
            }
          });
        }
        let centroidGeom;
        if (geojson.type === 'MultiPolygon') {
          const bboxGeoJSON = bboxPolygon(bbox);
          centroidGeom = polylabel(bboxGeoJSON.geometry.coordinates);
        } else {
          centroidGeom = polylabel(geojson.coordinates);
        }
        const centroid = {
          type: 'Point',
          coordinates: centroidGeom
        } as Geometry ;
        const { contactEmail, contactName } = parseContact(contact);
        const item = Item.create({
          thumbnail,
          crs,
          license,
          centroid,
          contactName,
          contactEmail,
          gsd,
          title,
          provider,
          user: dbUser,
          geom: geojson,
          fileSize: file_size,
          href: url || uuid,
          startDatetime: acquisition_start && new Date(acquisition_start.$date),
          endDatetime: acquisition_end && new Date(acquisition_end.$date),
          platform: platform.toLowerCase(),
          instrument: sensor,
          keywords: tags
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
