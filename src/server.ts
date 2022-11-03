// Imports
// ========================================================
import app from "./app";
import { config } from "dotenv";


// ENV VARS
// ========================================================
config();
const NODE_ENV: string = process.env.NODE_ENV || "development";
console.log(NODE_ENV)



const PORT: number =
  NODE_ENV == 'producti' ? 8080 : parseInt(process.env.PORT || "5001", 10);

// Server
// ========================================================
app.listen(PORT, () =>
  console.log(`Listening on PORT ${PORT}\nEnvironment: ${NODE_ENV}`)
);
