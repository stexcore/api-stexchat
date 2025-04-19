import { RequestHandler } from "express";
import Server from "../server";
import DBService from "../services/db.service";
import KeyPairModel from "../models/key-pair.model";
import { unauthorized } from "@stexcore/http-status";
import keyPairUtils from "../utils/key-pair.utils";

export default function StexcoreMiddleware(server: Server) {
    // Get dbService
    const dbService = server.getService(DBService);
    const keyPair = dbService.getModel(KeyPairModel);
    
    // Stexcore middleware
    const stexcoreMiddleware: RequestHandler = (req, res, next) => {
        try {
            if(
                req.headers["content-type"] === "stexcore/rsa" && 
                typeof req.headers["stx-id-app-device"] === "string"
            ) {
                const id_app_device = req.headers["stx-id-app-device"];
                const chunks: any[] = [];
                
                req.on("data", (chunk) => {
                    chunks.push(chunk);
                });
    
                req.on("end", () => {
                    const buffer = Buffer.concat(chunks);
                    const textEncrypt = buffer.toString();
    
                    // Find id UUID Client
                    keyPair.findOne({
                        where: {
                            id_app_device: id_app_device
                        }
                    })
                        .then((keyPair) => {
                            // Unauthorized device
                            if(!keyPair) throw unauthorized("The app device '" + id_app_device + "' has no encryption!");

                            const decoded: string = keyPairUtils.decryptWithPrivateKey(
                                keyPair.private_key_server,
                                textEncrypt
                            );

                            const incommingRequestDecoded: {
                                path: string,
                                method: string,
                                headers: Record<string, string>,
                                data: any,
                            } = JSON.parse(decoded);

                            // traverse the headers
                            for(const key in incommingRequestDecoded.headers) {
                                const headerValue = incommingRequestDecoded.headers[key];
                                const headerKey = key.toLowerCase();

                                req.headers[headerKey] = headerValue;

                                let found = false;

                                // traverse the raw headers
                                for(let x = 0; x < req.rawHeaders.length; x+=2) {
                                    if(found = (req.rawHeaders[x] === key)) {
                                        req.rawHeaders[x+1] = headerValue;
                                        break;
                                    }
                                }

                                if(!found) {
                                    // Append rawHeader
                                    req.rawHeaders.push(key, headerValue);
                                }
                            }

                            // set method
                            req.method = String(incommingRequestDecoded.method || "POST").toUpperCase();

                            // Append body
                            req.body = incommingRequestDecoded;

                            // Append url
                            req.url = incommingRequestDecoded.path;

                            // -------------- append logic to response request
                            let statusCode = 200;
                            let headers: Record<string, string | number | readonly string[]> = {};
                            let chunks: any[] = [];

                            const originalSetHeader = res.setHeader;
                            const originalWrite = res.write;
                            const originalEnd = res.end;

                            res.setHeader = function (name, value) {
                                headers[name.toLowerCase()] = value;
                                return res;
                            }

                            res.write = function (chunk: any, encoding_callback: any, maybe_callback?: any): boolean {
                                // Determine if the second argument is a callback or encoding
                                let encoding: BufferEncoding | undefined;
                                let callback: ((error: Error | null | undefined) => void) | undefined;
                            
                                if (typeof encoding_callback === "function") {
                                    callback = encoding_callback; // The second argument is a callback function
                                } else {
                                    encoding = encoding_callback; // The second argument is an encoding string
                                    callback = maybe_callback; // The third argument is the callback function
                                }
                            
                                // Convert the chunk based on the encoding
                                let chunkBuffer: Buffer;
                                if (Buffer.isBuffer(chunk)) {
                                    chunkBuffer = chunk; // If the chunk is already a Buffer, use it directly
                                } else {
                                    chunkBuffer = Buffer.from(chunk, encoding || "utf8"); // Convert to Buffer using the provided or default encoding
                                }
                            
                                // Add the converted chunk to the list of accumulated chunks
                                chunks.push(chunkBuffer);
                            
                                // Call the callback function with a null error (simulate successful write)
                                if (callback) {
                                    process.nextTick(callback, null); // Ensure the callback is executed asynchronously
                                }
                            
                                // Indicate the write operation was successful
                                return true;
                            };

                            res.end = function (chunkOrCallback?: any, encodingOrCallback?: any, callback?: any) {
                                let chunk: any;
                                let encoding: BufferEncoding | undefined;
                                let cb: (() => void) | undefined;
                            
                                // Determine the arguments provided
                                if (typeof chunkOrCallback === "function") {
                                    cb = chunkOrCallback; // First argument is a callback
                                } else {
                                    chunk = chunkOrCallback;
                                    if (typeof encodingOrCallback === "function") {
                                        cb = encodingOrCallback; // Second argument is a callback
                                    } else {
                                        encoding = encodingOrCallback; // Second argument is encoding
                                        cb = callback; // Third argument is a callback
                                    }
                                }
                            
                                // Convert chunk to a Buffer if provided
                                if (chunk) {
                                    const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding || "utf8");
                                    chunks.push(chunkBuffer); // Accumulate the chunk
                                }
                            
                                // Combine all chunks into a single buffer
                                const bodyBuffer = Buffer.concat(chunks);
                            
                                // // Call the callback if present
                                // if (cb) {
                                //     process.nextTick(cb);
                                // }

                                console.log("Output:", bodyBuffer.toString("utf8"));

                                try {
                                    const encodedData = keyPairUtils.encryptWithPublicKey(keyPair.public_key_client, JSON.stringify({
                                        statusCode: statusCode,
                                        headers: headers,
                                        data: JSON.parse(bodyBuffer.toString("utf8"))
                                    }));
    
                                    console.log("ENCONDED!", encodedData);
                                }
                                catch(err) {
                                    console.error(err);
                                }

                                // originalEnd(Buffer.from(encodedData, "base64"), cb);
                            
                                return res; // Return the original response object
                            };

                            Object.defineProperty(res, "statusCode", {
                                get() {
                                    return statusCode;
                                },
                                set(newStatusCode: number) {
                                    statusCode = newStatusCode;
                                }
                            });

                            next();
                        })
                        .catch(next);
                });
            }
            else next();
        }
        catch(err) {
            next(err);
        }
    }

    return stexcoreMiddleware;
}