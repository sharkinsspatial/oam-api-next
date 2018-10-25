import { Context } from 'koa';
import * as crypto from 'crypto';
import { config } from '../config';

function hmac(key, value) {
  return crypto.createHmac('sha256', key).update(value).digest();
}

function hexhmac(key, value) {
  return crypto.createHmac('sha256', key).update(value).digest('hex');
}

const uploadsController = {
  signUpload: async (ctx: Context) => {
    const { request } = ctx;
    const timestamp = request.query.datetime.substr(0, 8);
    const date = hmac(`AWS4${config.awsSecretAccessKey}`, timestamp);
    const region = hmac(date, config.awsRegion);
    const service = hmac(region, 's3');
    const signing = hmac(service, 'aws4_request');
    ctx.body = hexhmac(signing, request.query.to_sign);
  }
};
export default uploadsController;
