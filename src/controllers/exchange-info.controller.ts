import { RequestHandler } from "express";
import Controller from "../class/controller";
import DBService from "../services/db.service";
import KeyPairModel from "../models/key-pair.model";
import forge from "node-forge";

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

            // Validate incoming request data
            if (!id_app_device || !public_key) {
                res.status(400).json({ error: "Missing id_app_device or public_key" });
                return;
            }

            // Generate RSA key pair for the server
            const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
            const publicKeyServer = forge.pki.publicKeyToPem(keyPair.publicKey);
            const privateKeyServer = forge.pki.privateKeyToPem(keyPair.privateKey);

            // Insert newlines every 64 characters to conform to PEM format
            const formattedKey = public_key.match(/.{1,64}/g)?.join("\n") ?? public_key;

            // Add PEM headers and footers
            const public_key_client = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;

            // Save data to database
            await this.keyPairModel.create({
                id_app_device,
                public_key_client: public_key_client,
                public_key_server: publicKeyServer,
                private_key_server: privateKeyServer,
            });

            // Respond with server public key (clean format without headers/footers)
            const cleanPublicKey = publicKeyServer
                // .replace(/-----BEGIN PUBLIC KEY-----/g, "")
                // .replace(/-----END PUBLIC KEY-----/g, "")
                // .replace(/\n/g, "");

            res.status(200).json({
                public_key: cleanPublicKey,
            });
        } catch (err) {
            next(err); // Handle unexpected errors
        }
    };
}
