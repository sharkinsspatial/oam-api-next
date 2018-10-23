'use strict';

import * as jsonwebtoken from 'jsonwebtoken';
import { config } from '../config';

const createToken = (id, name, contactEmail, scope, expiration) => {
  // Sign the JWT
  return jsonwebtoken.sign(
    {
      id,
      name,
      contactEmail,
      scope
    },
    config.jwtSecret,
    {
      algorithm: 'HS256',
      expiresIn: expiration
    });
};
export default createToken;
