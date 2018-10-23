import * as jwt from 'koa-jwt';
import * as Router from 'koa-router';
import koaPassport from './controller/koaPassport';
import { config } from './config';
import GeneralController from './controller/GeneralController';
import UserController from './controller/UserController';
import ItemsController from './controller/ItemsController';
import JWTController from './controller/JWTController';

const router = new Router();

// GENERAL ROUTES
router.use(['/secure1'], jwt({ secret: config.jwtSecret }));

router.get('/', GeneralController.helloWorld);

router.get('/secure1', (ctx, next) => {
  ctx.body = 'Secure 1';
});

router.get('/oauth/facebook/', koaPassport.authenticate('facebook'));
router.get('/oauth/jwtfacebook/', koaPassport.authenticate('facebook', {
  successRedirect: '/oauth/jwt',
  failureRedirect: '/'
}));

router.get('/oauth/jwt/', JWTController.getJWT);
router.get('/users', UserController.getUsers);
router.get('/users/:id', UserController.getUser);
router.get('/centroids', ItemsController.getItemCentroids);
router.post('/filteredItems', ItemsController.getFilteredItems);

// router.put('/users/:id', controller.user.updateUser);

export { router };
