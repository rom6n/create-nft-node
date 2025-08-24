import express, { Request, Response } from "express";
import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";
import cors from "cors";

const app = express();
const PORT = process.env.PORT ? process.env.PORT : "3000";

const getIrysUploader = async () => {
  const irysUploader = await Uploader(Ethereum).withWallet(
    process.env.PRIVATE_KEY
  );
  return irysUploader;
};

async function run() {
  const irys = await getIrysUploader();

  app.use(
    cors({
      origin: "https://rom6n.github.io/create-nft-vite",
      methods: ["GET", "POST"],
    })
  );

  // Middleware для JSON
  app.use(express.json());

  // Маршрут
  app.get("/ping", (res: Response) => {
    res.send("pong");
  });

  app.get("/api/upload-image", async (req: Request, res: Response) => {
    try {
      const img: Buffer<ArrayBufferLike> = Buffer.from(req.body);
      const tags = [{ name: "Content-Type", value: "image/*" }];

      const result = await irys.upload(img, { tags: tags });
      res.sendStatus(200).send(result.id);
    } catch (err) {
      res.sendStatus(200).send(`Error uploading image: ${err}`);
    }
  });

  app.get("/api/upload-metadata", async (req: Request, res: Response) => {
    try {
      const metadata = req.body;
      const tags = [{ name: "Content-Type", value: "application/json" }];

      const result = await irys.upload(metadata, { tags: tags });

      res.sendStatus(200).send(result.id);
    } catch (err) {
      res.sendStatus(200).send(`Error uploading metadata: ${err}`);
    }
  });

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту: ${PORT}`);
  });
}

run();
