# oam-api-next

This repository is the API supporting the next iteration of the `oam-browser`, [oam-browser-next](https://github.com/sharkinsspatial/oam-browser-next).
Thanks to [javieraviles](https://github.com/javieraviles) for the great boilerplate [application](https://github.com/javieraviles/node-typescript-koa-rest) on which this is based.

AVAILABLE ENDPOINTS

| method             | resource         | description                                                                                    |
|:-------------------|:-----------------|:-----------------------------------------------------------------------------------------------|
| `GET`              | `/`              | Simple hello world response                                                                    |
| `GET`              | `oauth/jwt`      | Get JWT for making secure API requests. 
| `GET`              | `/users`         | Returns the collection of users present in the DB                                              |
| `GET`              | `/users/:id`     | Returns the specified id user                                                                  |
| `GET`              | `/centroids`     | Returns collection of image items with only their id and centroid geometry.
| `POST`             | `/filteredItems` | Returns collection of image items with ids matching those in the request body.
| `GET`              | `/signupload`    | Provides crytpographic signing of multi-part S3 uploads for use with client EvaporateJS.
| `GET`              | `/oauth/facebook`| Provides Passport authentication of user via Facbook 


## Pre-reqs
To build and run this app locally you will need:
- Install [Yarn](https://yarnpkg.com/en/)

## Features:
 * Nodemon - server auto-restarts when code changes
 * Koa v2
 * TypeORM (SQL DB) with basic CRUD included
 * Class-validator - Decorator based entities validation
 * Docker-compose ready to go

## Included middleware:
 * koa-router
 * koa-bodyparser
 * Winston Logger
 * JWT auth koa-jwt
 * Helmet (security headers)
 * CORS
 * koa-passport (Social logins)

# Getting Started
- Clone the repository
```
git clone --depth=1 https://github.com/sharkinsspatial/oam-api-next
```
- Install dependencies
```
cd <project_name>
yarn install
```
- Run the project directly in TS
```
yarn watch-server
```

- Build and run the project in JS
```
yarn build
yarn start
```
- Run unit tests
```
yarn test
```

## Docker (optional)
A docker-compose file has been added to the project with a postgreSQL (already setting user, pass and dbname as the ORM config is expecting) and an ADMINER image (easy web db client).

It is as easy as go to the project folder and execute the command 'docker-compose up' once you have Docker installed, and both the postgreSQL server and the Adminer client will be running in ports 5432 and 8080 respectively with all the config you need to start playing around. 

If you use Docker natively, the host for the server which you will need to include in the ORM configuration file will be localhost, but if you were to run Docker in older Windows versions, you will be using Boot2Docker and probably your virtual machine will use your ip 192.168.99.100 as network adapter. This mean your database host will be the aforementioned ip and in case you want to access the web db client you will also need to go to http://19.168.99.100/8080

## Setting up the Database - ORM
This API is prepared to work with an postgreSQL database, using [TypeORM](https://github.com/typeorm/typeorm).

The ORM configuration and connection to the database can be specified in the file 'ormconfig.json'. Here is directly in the connection to the database in 'server.ts' file because a environment variable containing databaseUrl is being used to set the connection data. This is prepared for Heroku, which provides a postgres-string-connection as env variable.

It is importante to notice that, when serving the project directly with *.ts files using ts-node,the configuration for the ORM should specify the *.ts files path, but once the project is built (transpiled) and run as plain js, it will be needed to change it accordingly to find the built js files:

```
"entities": [
      "dist/entity/**/*.js"
   ],
   "migrations": [
      "dist/migration/**/*.js"
   ],
   "subscribers": [
      "dist/subscriber/**/*.js"
   ]
```

Notice that if NODE_ENV is set to development, the ORM config won't be using SSL to connect to the DB. Otherwise it will.

```
createConnection({
    ...
    extra: {
        ssl: config.DbSslConn, // if not development, will use SSL
    }
 })
```

You can find an implemented **CRUD of the entity user** in the correspondent controller controller/user.ts and its routes in routes.ts file.

## Legacy MongoDB data
With the database running you can import legacy user and metadata data exported from MongoDB with import scripts found in `importScripts`.  Use the following commands
Note that users must be loaded first to maintain referential integrity.
```
yarn ts-node importScripts/importUsers.ts < importScripts/users.json
```
```
yarn ts-node importScripts/importItems.ts < importScripts/metas.json
```

## Entities validation
This project uses the library class-validator, a decorator-based entity validation, which is used directly in the entities files as follows:
```
export class User {
    @Length(10, 100) // length of string email must be between 10 and 100 characters
    @IsEmail() // the string must comply with an standard email format
    @IsNotEmpty() // the string can't be empty
    email: string;
}
```
Once the decorators have been set in the entity, you can validate from anywhere as follows:
```
const user = new User();
user.email = "avileslopez.javier@gmail"; // should not pass, needs the ending .com to be a valid email

validate(user).then(errors => { // errors is an array of validation errors
    if (errors.length > 0) {
        console.log("validation failed. errors: ", errors); // code will get here, printing an "IsEmail" error
    } else {
        console.log("validation succeed");
    }
});
```

For further documentation regarding validations see [class-validator docs](https://github.com/typestack/class-validator).


## Environment variables
Create a .env file (or just rename the .example.env) containing all the env variables you want to set, dotenv library will take care of setting them.

 * PORT -> Port where the server will be started on, Heroku will set this env variable automatically
 * NODE_ENV -> Environment, development value will set the logger as debug level, also important for CI. In addition will determine if the ORM connects to the DB through SSL or not.
 * JWT_SECRET -> Secret value, JWT tokens should be signed with this value
 * DATABASE_URL -> DB connection data in connection-string format.
 * FACEBOOK_CLIENT_ID -> The Facebook client application Id from [here](https://developers.facebook.com/)
 * FACEBOOK_CLIENT_SECRET -> The Facebook client application Secret from [here](https://developers.facebook.com/)
 * AWS_ACCESS_KEY -> The access key for the AWS IAM role to manage access to the uploads S3 bucket
 * AWS_SECRET_ACCESS_KEY -> The secret access key for the AWS IAM role to manage access to the uploads S3 bucket
 * AWS_REGION -> The AWS region for the uploads S3 bucket.

## Project Structure
The most obvious difference in a TypeScript + Node project is the folder structure.
TypeScript (`.ts`) files live in your `src` folder and after compilation are output as JavaScript (`.js`) in the `dist` folder.

The full folder structure of this app is explained below:

> **Note!** Make sure you have already built the app using `yarn build`

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **dist**                 | Contains the distributable (or output) from your TypeScript build. This is the code you ship  |
| **node_modules**         | Contains all your npm dependencies                                                            |
| **importScripts**        | Contains scripts for importing legacy MongoDB data                                            |
| **src**                  | Contains your source code that will be compiled to the dist dir                               |
| **src**/server.ts        | Entry point to your KOA app                                                                   |
| .travis.yml              | Used to configure Travis CI build                                                             |
| .copyStaticAssets.ts     | Build script that copies images, fonts, and JS libs to the dist folder                        |
| package.json             | File that contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped)                          |
| docker-compose.yml       | Docker PostgreSQL and Adminer images in case you want to load the db from Docker              |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                               |
| tslint.json              | Config settings for TSLint code style checking                                                |
| .example.env             | Env variables file example to be renamed to .env                                              |

## Configuring TypeScript compilation
TypeScript uses the file `tsconfig.json` to adjust project compile options.
Let's dissect this project's `tsconfig.json`, starting with the `compilerOptions` which details how your project is compiled. 

```json
    "compilerOptions": {
        "module": "commonjs",
        "target": "es2017",
        "lib": ["es6"],
        "moduleResolution": "node",
        "sourceMap": true,
        "outDir": "dist",
        "baseUrl": ".",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,  
        }
    },
```

| `compilerOptions` | Description |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `"module": "commonjs"`             | The **output** module type (in your `.js` files). Node uses commonjs, so that is what we use            |
| `"target": "es2017"`               | The output language level. Node supports ES2017, so we can target that here                               |
| `"lib": ["es6"]`                   | Needed for TypeORM.                                             |
| `"moduleResolution": "node"`       | TypeScript attempts to mimic Node's module resolution strategy. Read more [here](https://www.typescriptlang.org/docs/handbook/module-resolution.html#node)                             |
| `"sourceMap": true`                | We want source maps to be output along side our JavaScript.     |
| `"outDir": "dist"`                 | Location to output `.js` files after compilation                |
| `"baseUrl": "."`                   | Part of configuring module resolution.                          |
| `"experimentalDecorators": true`   | Needed for TypeORM. Allows use of @Decorators                   |
| `"emitDecoratorMetadata": true`    | Needed for TypeORM. Allows use of @Decorators                   |



The rest of the file define the TypeScript project context.
The project context is basically a set of options that determine which files are compiled when the compiler is invoked with a specific `tsconfig.json`.
In this case, we use the following to define our project context: 
```json
    "include": [
        "src/**/*"
    ]
```
`include` takes an array of glob patterns of files to include in the compilation.
This project is fairly simple and all of our .ts files are under the `src` folder.
For more complex setups, you can include an `exclude` array of glob patterns that removes specific files from the set defined with `include`.
There is also a `files` option which takes an array of individual file names which overrides both `include` and `exclude`.


## Running the build

| Npm Script | Description |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `start`                   | Does the same as 'yarn serve'. Can be invoked with `yarn start`                                 |
| `build`                   | Full build. Runs ALL build tasks (`build-ts`, `tslint`, `copy-static-assets`)                     |
| `serve`                   | Runs node on `dist/server/server.js` which is the apps entry point                                |
| `watch-server`            | Nodemon, process restarts if crashes. Continuously watches `.ts` files and re-compiles to `.js`   |
| `build-ts`                | Compiles all source `.ts` files to `.js` files in the `dist` folder                               |
| `tslint`                  | Runs TSLint on project files                                                                      |
| `copy-static-assets`      | Calls script that copies JS libs, fonts, and images to dist directory                             |
| `test`                    | Runs all `tape` based unit tests located int `./test`.                                            |

## TSLint rules
Like most linters, TSLint has a wide set of configurable rules as well as support for custom rule sets.
All rules are configured through `tslint.json`.

## Running TSLint
Like the rest of our build steps, we use npm scripts to invoke TSLint.
To run TSLint you can call the main build script or just the TSLint task.
```
yarn build   // runs full build including TSLint
yarn tslint  // runs only TSLint
```
Notice that TSLint is not a part of the main watch task.

# Logging
Winston is designed to be a simple and universal logging library with support for multiple transports.

A "logger" middleware passing a winstonInstance has been created. Current configuration of the logger can be found in the file "logging.ts". It will log 'error' level to an error.log file and 'debug' or 'info' level (depending on NODE_ENV environment variable, debug if == development) to the console.

```
// Logger middleware -> use winston as logger (logging.ts with config)
app.use(logger(winston));
```

## CORS
This boilerplate uses @koa/cors, a simple CORS middleware for koa. If you are not sure what this is about, click [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

```
// Enable CORS with default options
app.use(cors());
```
Have a look at [Official @koa/cors docs](https://github.com/koajs/cors) in case you want to specify 'origin' or 'allowMethods' properties.


## Helmet
This boilerplate uses koa-helmet, a wrapper for helmet to work with koa. It provides important security headers to make your app more secure by default. 

Usage is the same as [helmet](https://github.com/helmetjs/helmet). Helmet offers 11 security middleware functions (clickjacking, DNS prefetching, Security Policy...), everything is set by default here.

```
// Enable helmet with default options
app.use(helmet());
```

Have a look at [Official koa-helmet docs](https://github.com/venables/koa-helmet) in case you want to customize which security middlewares are enabled.


## Changelog

