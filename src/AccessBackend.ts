import { brauxpilotClient, RequestType } from "./BrauxpilotClient";

// import * as http from 'http'
// import * as https from 'https'
import axios from "axios";
import { AxiosInstance } from "axios";
import OpenAI from 'openai';

const http = require('http');
const https = require('https');

//  It's quite strange, this does not work. The server received a request with `Connection: close` , 
//     even if using Node to run a simple script, the server receives a request with `Connection: keep-alive`.
//     Currently, whether using OpenAI or axios, it is impossible to achieve keep alive.
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });


class AccessBackendCache {
    private openai: OpenAI;
    private axiosInstance: AxiosInstance;


    constructor() {
        this.openai = new OpenAI({ apiKey: brauxpilotClient.Token, baseURL: brauxpilotClient.BaseUrl });
        this.axiosInstance = axios.create({
            httpAgent,
            httpsAgent,
            baseURL: brauxpilotClient.BaseUrl,
            timeout: 20000,
        });
    
    }

    public fetchUseOpenAI(data: any): Promise<OpenAI.Completion>{
        return this.openai.completions.create(data);
    }

    public fetchUseAxios(data: any): Promise<OpenAI.Completion> {
        return this.axiosInstance.post('/completions', data).then(response => response.data);
    }
}

let cacheInScript: AccessBackendCache;

export function rebuildAccessBackendCache() {
    cacheInScript = new AccessBackendCache();
}

function getCache(): AccessBackendCache {
    if (!cacheInScript) {
        console.log("rebuilding access backend cache");
        rebuildAccessBackendCache();
    }
    return cacheInScript;
}

export function fetch(prompt: string): Promise<OpenAI.Completion> {

    const data = {
        model: brauxpilotClient.Model,
        prompt: prompt,
        max_tokens: brauxpilotClient.MaxTokens,
        temperature: brauxpilotClient.Temperature,
        stop: brauxpilotClient.StopWords
    };

    if (brauxpilotClient.RequestType == RequestType.OpenAI) {
        return getCache().fetchUseOpenAI(data);
    } else {
        return getCache().fetchUseAxios(data);
    }
}
