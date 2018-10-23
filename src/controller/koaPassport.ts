import * as koaPassport from 'koa-passport';
import * as passportFacebook from 'passport-facebook';
import { getRepository, Repository } from 'typeorm';
import { User } from '../entity/user';
const facebookStrategy = (passportFacebook).Strategy;

import { config } from '../config';

koaPassport.serializeUser((user, done) => {
  done(null, user);
});

koaPassport.deserializeUser((user, done) => {
  done(null, user);
});

koaPassport.use(new facebookStrategy(
  {
    clientID: config.facebookClientId,
    clientSecret: config.facebookClientSecret,
    callbackURL: config.facebookCallbackUrl,
    profileFields: [
      'id',
      'displayName',
      'email',
      'first_name',
      'middle_name',
      'last_name',
      'picture.type(small)'
    ]
  },
  async (accessToken, refreshToken, profile, done) => {
    const userRepository: Repository<User> = getRepository(User);
    // Handles incorrect parsing of 64bit Facebook ids from legacy appliacation.
    const facebookIds = [profile.id, Number.parseInt(profile.id, 10).toString()];
    const user = await userRepository
      .createQueryBuilder('user')
      .where('user.facebookId IN (:...facebookIds)', { facebookIds })
      .getOne();
    if (user) {
      done(null, user);
    } else {
      try {
        const newUser = new User();
        newUser.name = `${profile.name.givenName} ${profile.name.familyName}`;
        newUser.facebookId = profile.id;
        newUser.contactEmail = profile.emails[0].value;
        newUser.profilePicURI = profile.photos[0].value;
        newUser.bio = '';
        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err);
      }
    }
  })
);

export default koaPassport;
