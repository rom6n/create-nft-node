"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = require("@irys/upload");
const upload_ethereum_1 = require("@irys/upload-ethereum");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const multer_1 = __importDefault(require("multer"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? process.env.PORT : "3000";
const upload = (0, multer_1.default)();
const getIrysUploader = async () => {
    const irysUploader = await (0, upload_1.Uploader)(upload_ethereum_1.Ethereum).withWallet(process.env.PRIVATE_KEY);
    return irysUploader;
};
async function run() {
    const irys = await getIrysUploader();
    app.use((0, cors_1.default)({
        origin: "https://rom6n.github.io",
        methods: ["GET", "POST"],
    }));
    app.use((0, morgan_1.default)("dev"));
    // Middleware для JSON
    app.use(express_1.default.json());
    // Маршрут
    app.get("/ping", (req, res) => {
        res.send("pong");
    });
    app.post("/api/upload-image", upload.single("file"), async (req, res) => {
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
        }
        catch (err) {
            res.status(400).send(`Error uploading image: ${err}`);
        }
    });
    app.post("/api/upload-metadata", async (req, res) => {
        try {
            const metadata = req.body;
            const tags = [{ name: "Content-Type", value: "application/json" }];
            const result = await irys.upload(metadata, { tags: tags });
            res.send(result.id);
        }
        catch (err) {
            res.status(400).send(`Error uploading metadata: ${err}`);
        }
    });
    // Запуск сервера
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту: ${PORT}`);
    });
}
run();
