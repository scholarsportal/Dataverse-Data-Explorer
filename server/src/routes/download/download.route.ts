import { Request, Response, Router } from "express";
import { XMLParser } from "fast-xml-parser";

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
        if(request){
            const response = await request.text()
            const json = new XMLParser(options).parse(response)
            res.json(json)
        }
    }
});

export default download;
