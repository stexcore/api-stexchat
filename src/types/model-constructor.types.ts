import { Model, ModelStatic, Sequelize } from "sequelize";

type ModelConstructor<
    TModelAttributes extends {} = any, 
    TCreationAttributes extends {} = TModelAttributes
> = {
    (sequelize: Sequelize): ModelStatic<Model<TModelAttributes, TCreationAttributes>>
}

export default ModelConstructor;