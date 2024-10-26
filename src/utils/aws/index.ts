import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from "node:fs";

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

export const uploadFileToBucket = async (filePath: string, bucketName: string, key: string) => {
  const s3Client = s3ClientInit(process.env.ACCESS_KEY_ID, process.env.SECRET_ACCESS_KEY);
  console.log(`Инициализирован клиент S3 для загрузки файла ${filePath}`);

  const fileContent = fs.readFileSync(filePath);
  console.log(`Прочитан файл для загрузки в бакет ${bucketName}`);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  });

  try {
    await s3Client.send(command);
    console.log(`Файл ${key} успешно загружен в бакет ${bucketName}`);
  } catch (error) {
    console.error(`Ошибка при загрузке файла в бакет: ${error}`);
  }

  fs.unlinkSync(filePath);
  console.log(`Файл ${filePath} удален после загрузки`);
};


