"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
// ========================================================
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
// ENV VARS
// ========================================================
(0, dotenv_1.config)();
const NODE_ENV = process.env.NODE_ENV || "development";
const FILE_DEST = process.env.FILE_DEST || "bucket";
const FILE_SERVER_URL = process.env.FILE_SERVER_URL || "http://localhost:5002";
const FILEBASE_BUCKET = process.env.FILEBASE_BUCKET || "";
// Configured AWS S3 Client For Filebase
const s3 = new client_s3_1.S3Client({
    endpoint: "https://s3.filebase.com",
    region: process.env.FILEBASE_REGION || "",
    credentials: {
        accessKeyId: process.env.FILEBASE_ACCESS_KEY || "",
        secretAccessKey: process.env.FILEBASE_SECRET_KEY || "",
    },
});
// Init
// ========================================================
/**
 * Initial ExpressJS
 */
const app = (0, express_1.default)();
// Middlewares
// ========================================================
/**
 * Allows for requests from other servers
 */
app.use((0, cors_1.default)());
/**
 * Main uploader middleware that configures the final `destination` of the file and how the `filename` would be set once saved
 */
const upload = 
// If production use the s3 client
NODE_ENV === "production"
    ? (0, multer_1.default)({
        storage: (0, multer_s3_1.default)({
            s3: s3,
            bucket: FILEBASE_BUCKET,
            metadata: (_req, file, cb) => {
                cb(null, { fieldName: file.fieldname });
            },
            key: (_req, file, cb) => {
                cb(null, file.originalname);
            },
        }),
    })
    :
        (0, multer_1.default)({
            storage: (0, multer_s3_1.default)({
                s3: s3,
                bucket: FILEBASE_BUCKET,
                metadata: (_req, file, cb) => {
                    cb(null, { fieldName: file.fieldname });
                },
                key: (_req, file, cb) => {
                    cb(null, file.originalname);
                },
            }),
        });
//multer({
// storage: multer.diskStorage({
//   destination: (_req, file, callback) => {
//     callback(null, FILE_DEST);
//   },
//  filename: (_req, file, callback) => {
//    callback(null, file.originalname);
//   },
//  }),
// });
// Endpoints / Routes
// ========================================================
/**
 * Main endpoint to verify that things are working and what environment mode it's running in
 */
app.get("/", (_req, res) => res.send({ environment: NODE_ENV }));
/**
 * Upload endpoint that accepts an input file field of `file`
 */
app.post("/upload", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const responseData = {
        file: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname,
        url: `${FILE_SERVER_URL}/${(_b = req.file) === null || _b === void 0 ? void 0 : _b.originalname}`,
    };
    // If production retrieve file data to get the ipfs CID
    //if (NODE_ENV === "production") {
    const commandGetObject = new client_s3_1.GetObjectCommand({
        Bucket: FILEBASE_BUCKET,
        Key: (_c = req.file) === null || _c === void 0 ? void 0 : _c.originalname,
    });
    const response = yield s3.send(commandGetObject);
    responseData.url = `ipfs://${(_d = response.Metadata) === null || _d === void 0 ? void 0 : _d.cid}`;
    //}
    return res.json({ data: responseData });
}));
// Exports
// ========================================================
exports.default = app;
