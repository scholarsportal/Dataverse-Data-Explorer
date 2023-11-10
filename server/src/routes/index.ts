import { Request, Response, Router } from "express";
import { XMLParser } from "fast-xml-parser";
import download from "./download/download.route";

const routes = Router();

routes.use("/download", download);

routes.get("/", async function (req: Request, res: Response) {
  const siteURL = req.query.siteURL;
  const fileID = req.query.fileID;
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  };
  console.log(siteURL, fileID);
  if (req) {
    const fetchURL = `${siteURL}/api/access/datafile/${fileID}/metadata/ddi`;
    const request = await fetch(fetchURL);
    const response = await request.text();
    const parsedJSON = new XMLParser(options).parse(response);
    console.log(parsedJSON);
    res.json(parsedJSON);
  }
});

export default routes;
