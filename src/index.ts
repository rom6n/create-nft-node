import express, { Request, Response } from "express";
import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? process.env.PORT : "3000";

const upload = multer();

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
      origin: "https://rom6n.github.io",
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

  app.post(
    "/api/upload-image",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const img = req.file?.buffer;
        if (!img) {
          return res.status(400).send("No file uploaded");
        }

        const tags = [
          { name: "Content-Type", value: req.file?.mimetype || "image/*" },
        ];

        const result = await irys.upload(img, { tags: tags });
        res.send(result.id);
      } catch (err) {
        res.status(400).send(`Error uploading image: ${err}`);
      }
    }
  );

  app.post("/api/upload-metadata", async (req: Request, res: Response) => {
    try {
      const metadata = req.body;
      const tags = [{ name: "Content-Type", value: "application/json" }];

      const result = await irys.upload(metadata, { tags: tags });

      res.send(result.id);
    } catch (err) {
      res.status(400).send(`Error uploading metadata: ${err}`);
    }
  });

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту: ${PORT}`);
  });
}

run();
