"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
// ========================================================
const app_1 = __importDefault(require("./app"));
const dotenv_1 = require("dotenv");
// ENV VARS
// ========================================================
(0, dotenv_1.config)();
const NODE_ENV = process.env.NODE_ENV || "development";
console.log(NODE_ENV);
const PORT = NODE_ENV == 'producti' ? 8080 : parseInt(process.env.PORT || "5001", 10);
// Server
// ========================================================
app_1.default.listen(PORT, () => console.log(`Listening on PORT ${PORT}\nEnvironment: ${NODE_ENV}`));
