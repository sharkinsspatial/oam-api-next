import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export interface IConfig {
  port: number;
  debugLogging: boolean;
  dbsslconn: boolean;
  jwtSecret: string;
  databaseUrl: string;
  facebookClientId: string;
  facebookClientSecret: string;
  facebookCallbackUrl: string;
  awsAccessKey: string;
  awsSecretAccessKey: string;
  awsRegion: string;
}

const config: IConfig = {
  port: +process.env.PORT || 3000,
  debugLogging: process.env.NODE_ENV === 'development',
  dbsslconn: process.env.NODE_ENV !== 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-whatever',
  databaseUrl: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/apidb',
  facebookClientId: process.env.FACEBOOK_CLIENT_ID,
  facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  facebookCallbackUrl: process.env.FACEBOOK_CALLBACK_URL,
  awsAccessKey: process.env.AWS_ACCESS_KEY,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION
};

export { config };
