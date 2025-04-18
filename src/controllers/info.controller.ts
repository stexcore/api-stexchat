import { RequestHandler } from "express";
import InfoService from "../services/info.service";
import Controller from "../class/controller";

/**
 * Handle server information
 */
export default class InfoController extends Controller {

    /**
     * Information service
     */
    private info: InfoService = this.server.getService(InfoService);

    /**
     * Handle request info API
     * @param req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    public GetInformation: RequestHandler = (_req, res, next) => {
        try {
            // Response information server
            res.json({
                success: true,
                message: "Information server: OK",
                data: this.info.GetInformationServer()
            });
        }
        catch(err) {
            // Forward error
            next(err);
        }
    }
    
}