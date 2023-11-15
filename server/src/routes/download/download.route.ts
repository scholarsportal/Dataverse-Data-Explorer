import { Request, Response, Router } from "express";
import { XMLParser } from "fast-xml-parser";
import { parseJSON } from "./download.util";

const download = Router();

download.get("/", async function(req: Request, res: Response) {
    const siteURL = req.query.siteURL
    const fileID = req.query.fileID
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix : "@_"
    };
    console.log(siteURL, fileID)
    if (req) {
        const fetchURL = `${siteURL}/api/access/datafile/${fileID}/metadata/ddi`;
        const request = await fetch(fetchURL)
        const response = await request.text()
        const json = new XMLParser(options).parse(response)
        const parsedJSON = parseJSON(json)
        res.json(parsedJSON)
    }
});

export default download;
