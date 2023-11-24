import { Request, Response, Router } from "express";
import { XMLParser } from "fast-xml-parser";

const weights = Router();
const API_KEY = process.env.API_KEY

weights.get("/", async function(req: Request, res: Response) {
    const variableID = req.query.variableID
    const weightID = req.query.weightID
    const siteURL = req.query.siteURL
    const fileID = req.query.fileID
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix : "@_"
    };
    if(!API_KEY){
        console.log('This app does not have an API key configured. Please add an API key to your .env file')
        throw new Error()
    }
    if (req) {
        const fetchURL = `${siteURL}/api/access/datafile/${fileID}?format=subset&variables=${variableID},${weightID}&key=${API_KEY}`;
        const request = await fetch(fetchURL)
        const response = await request.text()
        const json = new XMLParser(options).parse(response)
        // res.json(parsedJSON)
    }
});

export default weights;
