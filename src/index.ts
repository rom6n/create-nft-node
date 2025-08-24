import express, { Request, Response } from "express";
import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();

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

  app.use(morgan("dev"));
  // Middleware для JSON
  app.use(express.json());

  // Маршрут
  app.get("/ping", (req: Request, res: Response) => {
    res.send("pong");
  });

  app.post("/api/upload-image", async (req: Request, res: Response) => {
    try {
      const img = req.body as Buffer;
      const tags = [{ name: "Content-Type", value: "image/*" }];

      const result = await irys.upload(img, { tags: tags });
      res.send(result.id);
    } catch (err) {
      res.send(`Error uploading image: ${err}`);
    }
  });

  app.post("/api/upload-metadata", async (req: Request, res: Response) => {
    try {
      const metadata = req.body;
      const tags = [{ name: "Content-Type", value: "application/json" }];

      const result = await irys.upload(metadata, { tags: tags });

      res.send(result.id);
    } catch (err) {
      res.send(`Error uploading metadata: ${err}`);
    }
  });

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту: ${PORT}`);
  });
}

run();
