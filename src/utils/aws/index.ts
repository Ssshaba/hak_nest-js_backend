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

const uploadFileToBucket = async (filePath: string, bucketName: string, key: string) => {
  const s3Client = s3ClientInit(process.env.ACCESS_KEY_ID, process.env.SECRET_ACCESS_KEY);

  // Чтение содержимого файла
  const fileContent = fs.readFileSync(filePath);

  // Загрузка файла в бакет
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  });

  await s3Client.send(command);
  console.log(`Файл ${key} загружен в бакет ${bucketName}`);

  // Удаление файла после загрузки
  fs.unlinkSync(filePath);
};


export { s3ClientInit, uploadFileToBucket };
