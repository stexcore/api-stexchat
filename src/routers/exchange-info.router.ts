import { Router } from "express";
import Server from "../server";
import schemaMiddleware from "../middlewares/schema.middleware";
import exchangeInfoSchema from "../schemas/exchange-info.schema";
import ExchangeInfoController from "../controllers/exchange-info.controller";

/**
 * Make a router to exchange info segment
 * @param server Server instance
 */
export default function exchangeInfoRouter(server: Server) {
    // Create router instance
    const router = Router();
    // Create controller instance
    const exchangeInfoController = new ExchangeInfoController(server);

    // Append endpoint
    router.post("/", schemaMiddleware(exchangeInfoSchema.GET), exchangeInfoController.Exchange);
    
    return router;
}