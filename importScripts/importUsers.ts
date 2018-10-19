import { Writable } from 'stream';
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as PostgressConnectionStringParser from 'pg-connection-string';
import { config } from '../src/config';
import { BinarySplitter } from './binarySplitter';
import { User } from '../src/entity/user';
import { Item } from '../src/entity/item';

class UserImporter extends Writable {
  constructor() {
    super({
      objectMode: true
    });
  }

  async _write(line, _, callback) {
    try {
      const u = JSON.parse(line.toString());

      const user = User.create({
        mongoId: u._id.$oid,
        googleId: u.google_id,
        facebookId: u.facebook_id,
        name: u.name,
        contactEmail: u.contact_email,
        bio: u.bio || '',
        website: u.website,
        profilePicURI: u.profile_pic_uri
      });

      await user.save();
    } catch (err) {
      if (err.code !== '23505') {
        // not a duplicate key error
        console.log(err);
        console.log(line.toString());
        process.exit();
      }
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
  process.stdin.pipe(new BinarySplitter()).pipe(new UserImporter())
);
