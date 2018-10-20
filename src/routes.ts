import * as jwt from 'koa-jwt';
import * as Router from 'koa-router';
import { config } from './config';
import GeneralController from './controller/GeneralController';
import UserController from './controller/UserController';
import ItemsController from './controller/ItemsController';

const router = new Router();

// GENERAL ROUTES
router.use('/secure1', jwt({ secret: config.jwtSecret }));

router.get('/', GeneralController.helloWorld);
router.get('/jwt', GeneralController.getJwtPayload);

router.get('/secure1', (ctx, next) => {
  ctx.body = 'Secure 1';
});

router.get('/users', UserController.getUsers);
router.get('/users/:id', UserController.getUser);
router.get('/centroids', ItemsController.getItemCentroids);
router.post('/filteredItems', ItemsController.getFilteredItems);
//router.post('/users', controller.user.createUser);
//router.put('/users/:id', controller.user.updateUser);
//router.delete('/users/:id', controller.user.deleteUser);

export { router };
