import { S3Client } from '@aws-sdk/client-s3';

const s3ClientInit = (accessKeyId: string, secretAccessKey: string) => {
  return new S3Client({
    region: 'ru-central1',
    endpoint: 'https://storage.yandexcloud.net',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export default s3ClientInit;
