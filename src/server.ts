import http from "http";
import express from "express";
import Service from "./class/service";
import catchGlobalErrorMiddleware from "./middlewares/catchGlobalError.middleware";
import catchHttpErrorMiddleware from "./middlewares/catchHttpError.middleware";
import infoRouter from "./routers/info.router";
import InfoService from "./services/info.service";
import morganMiddleware from "./middlewares/morgan.middleware";
import path from "path";
import DBService from "./services/db.service";
import cors from "cors";
import exchangeInfoRouter from "./routers/exchange-info.router";
import KeyPairModel from "./models/key-pair.model";

export default class Server {

    /**
     * Express application
     */
    private app: express.Application;
    
    /**
     * Http Server
     */
    private server: http.Server;

    /**
     * All services 
     */
    public readonly services: Service[] = [];
    
    /**
     * Initialize structure of server class
     */
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);

        // Register services
        this.registerService(InfoService);
        this.registerService(DBService);

        const dbService = this.getService(DBService);
        
        // Register models
        dbService.registerModel(KeyPairModel);

        // Syncronize
        dbService.connection.sync({ });

        // Append middlewares
        this.app.use(cors());
        this.app.use(morganMiddleware);
        this.app.use(express.json());
        this.app.use(express.static(path.resolve("public")));
        this.app.use(express.urlencoded({ extended: true }));

        // Append routers
        this.app.use("/info", infoRouter(this));
        this.app.use("/exchange-info", exchangeInfoRouter(this));

        // Append errors catch
        this.app.use(catchHttpErrorMiddleware);
        this.app.use(catchGlobalErrorMiddleware);
    }
    
    /**
     * Initialize server
     * @param port Port to open
     */
    public initialize(port: number) {
        return new Promise<void>((resolve, reject) => {
            try {
                this.server.listen(port, () => {
                    resolve();
                });
            }
            catch(err) {
                reject(err);
            }
        });
    }

    /**
     * Stop server listening
     */
    public destroy() {
        return new Promise<void>((resolve, reject) => {
            try {
                this.server.close((err) => {
                    if(err) {
                        return reject(err);
                    }
                    resolve();
                });
            }
            catch(err) {
                reject(err);
            }
        });
    }

    /**
     * Register service instance into this server
     * @param service Service Constructor
     * @returns Service instance created or existent
     */
    public registerService(service: new (server: this) => Service) {
        let serviceItem = this.services.find((s) => s instanceof service);

        if(!serviceItem) {
            this.services.push(serviceItem = new service(this));
        }

        return serviceItem;
    }

    /**
     * Get service instance from this server instance
     * @param service Service Constructor
     * @returns Service instance
     */
    public getService<S extends Service>(service: new (server: this) => S): S {
        const serviceItem = this.services.find((s) => s instanceof service);
        
        if(!serviceItem) throw new Error("Service not found!");
        return serviceItem as S;
    }
    
}