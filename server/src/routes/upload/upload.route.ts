import { Request, Response, Router } from "express";

const upload = Router();
const API_KEY = process.env.API_KEY;

upload.get("/", async function(req: Request, res: Response) {
    const siteURL = req.query.siteURL
    const fileID = req.query.fileID
    const key = API_KEY;
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix : "@_"
    };
    console.log(siteURL, fileID)
    if (req) {
        const fetchURL = `${siteURL}/api/access/datafile/${fileID}/metadata/ddi`;
        const request = await fetch(fetchURL)
        const response = await request.text()
    }
});

export default upload;
