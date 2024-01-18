import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index";

const port = process.env.PORT || 2020;
const allowedOrigins = ["http://localhost:4200"];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

const app = express();
app.use(cors(options));
app.use(helmet());
app.use(express.json());
app.use(routes);
app.listen(port, () => {
  console.log(`🚀 Listening on port ${port}`);
});
