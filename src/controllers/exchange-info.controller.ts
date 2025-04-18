import { RequestHandler } from "express";
import Controller from "../class/controller";
import DBService from "../services/db.service";
import KeyPairModel from "../models/key-pair.model";
import crypto from "crypto"; // Node.js crypto module for key generation

export default class ExchangeInfoController extends Controller {
    /**
     * Db Service
     */
    protected dbService = this.server.getService(DBService);

    /**
     * Key Pair Model
     */
    protected keyPairModel = this.dbService.getModel(KeyPairModel);

    /**
     * Handle exchange key public
     * @param req Request incomming
     * @param res Response incomming
     * @param next Next middleware
     */
    Exchange: RequestHandler = async (req, res, next) => {
        try {
            const { id_app_device, public_key } = req.body;

            // Generate RSA key pair for the server
            const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
                modulusLength: 2048, // Key size
                publicKeyEncoding: { type: "spki", format: "pem" },
                privateKeyEncoding: { type: "pkcs8", format: "pem" },
            });

            // Save data to database
            await this.keyPairModel.create({
                id_app_device,
                public_key_client: public_key,
                public_key_server: publicKey,
                private_key_server: privateKey,
            });

            // Respond with server public key
            res.status(200).json({
                public_key: publicKey,
            });
        } catch (err) {
            next(err); // Handle unexpected errors
        }
    };
}
