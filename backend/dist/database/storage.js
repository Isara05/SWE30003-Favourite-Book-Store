"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJson = readJson;
exports.writeJson = writeJson;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const dataDir = path_1.default.resolve(process.cwd(), 'data');
async function ensureDir() {
    await fs_1.promises.mkdir(dataDir, { recursive: true });
}
async function readJson(fileName, fallback) {
    await ensureDir();
    const filePath = path_1.default.join(dataDir, fileName);
    try {
        const raw = await fs_1.promises.readFile(filePath, 'utf8');
        return JSON.parse(raw);
    }
    catch (error) {
        await fs_1.promises.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
        return fallback;
    }
}
async function writeJson(fileName, data) {
    await ensureDir();
    const filePath = path_1.default.join(dataDir, fileName);
    await fs_1.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}
//# sourceMappingURL=storage.js.map