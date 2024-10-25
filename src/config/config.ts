export default (): IConfig => ({
  port: process.env.PORT,
  jwt_secret_key: process.env.JWT_SECRET_KEY,
  expires_in: process.env.EXPIRES_IN,
  database_url: process.env.DATABASE_URL,
  transport: process.env.MAIL_TRANSPORT,
  mailFromName: process.env.MAIL_FROM_NAME,
  mail: process.env.MAIL,
  access_key_id: process.env.ACCESS_KEY_ID,
  secret_acess_key: process.env.SECRET_ACCESS_KEY,
});

interface IConfig {
  port: string;
  jwt_secret_key: string;
  expires_in: string;
  database_url: string;
  transport: string;
  mailFromName: string;
  mail: string;
  access_key_id: string;
  secret_acess_key: string;
}
