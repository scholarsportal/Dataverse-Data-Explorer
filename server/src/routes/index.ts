import { Router } from "express";
import download from "./download/download.route";
import upload from "./upload/upload.route";

const routes = Router();

routes.use("/download", download);

// routes.use("/weights", );

routes.use("/upload", upload);

export default routes;
