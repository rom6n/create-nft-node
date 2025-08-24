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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? process.env.PORT : "3000";
const getIrysUploader = async () => {
    const irysUploader = await (0, upload_1.Uploader)(upload_ethereum_1.Ethereum).withWallet(process.env.PRIVATE_KEY);
    return irysUploader;
};
async function run() {
    const irys = await getIrysUploader();
    app.use((0, cors_1.default)({
        origin: "https://rom6n.github.io/create-nft-vite",
        methods: ["GET", "POST"],
    }));
    // Middleware для JSON
    app.use(express_1.default.json());
    // Маршрут
    app.get("/ping", (req, res) => {
        res.send("pong");
    });
    app.post("/api/upload-image", async (req, res) => {
        try {
            const img = req.body;
            const tags = [{ name: "Content-Type", value: "image/*" }];
            const result = await irys.upload(img, { tags: tags });
            res.send(result.id);
        }
        catch (err) {
            res.send(`Error uploading image: ${err}`);
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
            res.send(`Error uploading metadata: ${err}`);
        }
    });
    // Запуск сервера
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту: ${PORT}`);
    });
}
run();
