import { ConfigService } from '@nestjs/config';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { createTransport } from 'nodemailer';
export const getMailConfig = async (
  configService: ConfigService,
): Promise<any> => {
  const mailFromName = process.env.MAIL_FROM_NAME;
  const mailFromAddress = process.env.MAIL;
  const mailPass = process.env.MAIL_PASS;
  return {
    transport: {
      host: 'smtp.mail.ru',
      secure: false,
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASS,
      },
    },
    defaults: {
      from: `"${mailFromName}" <${mailFromAddress}>`,
    },
    template: {
      adapter: new EjsAdapter(),
      options: {
        strict: false,
      },
    },
  };
};
