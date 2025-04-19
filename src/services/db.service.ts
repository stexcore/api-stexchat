import { Dialect, Model, ModelStatic, Sequelize } from "sequelize";
import Service from "../class/service";
import ModelConstructor from "../types/model-constructor.types";

/**
 * DBService
 */
export default class DBService extends Service {

    /**
     * Sequelize Connection
     */
    public readonly connection = new Sequelize({
        dialect:    process.env.DB_TYPE as Dialect,
        database:   process.env.DB_DATABASE!,
        storage:    process.env.DB_STORAGE!,
        username:   process.env.DB_USER!,
        password:   process.env.DB_PASSWORD!,
        host:       process.env.DB_HOST!,
        port:       typeof process.env.DB_PORT == "string" ? Number(process.env.DB_PORT) : undefined
    });

    /**
     * Models instances
     */
    private models: {
        modelInstance: ModelStatic<any>,
        modelConstructor: ModelConstructor
    }[] = [];

    /**
     * Get model instance
     * @param modelConstructor Model Constructor
     * @returns Model item
     */
    public getModel<M extends ModelConstructor>(modelConstructor: M): ReturnType<M> {
        // Model item
        const modelItem = this.models.find((m) => m.modelConstructor === modelConstructor);

        // Model not found!
        if(!modelItem) throw new Error("Model not found!");

        // Model item
        return modelItem.modelInstance as ReturnType<M>;
    }

    public registerModel(modelConstructor: ModelConstructor) {
        if(this.models.some((m) => m.modelConstructor === modelConstructor)) {
            throw new Error("The model is already registered!");
        }

        this.models.push({
            modelConstructor,
            modelInstance: modelConstructor(this.connection)
        });
    }
    
}