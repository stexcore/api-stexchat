import { DataTypes, Model } from "sequelize";
import ModelConstructor from "../types/model-constructor.types";

/**
 * Key pair
 */
interface IKeyPair {
    /**
     * Identifier
     */
    id: number,
    /**
     * Id app device
     */
    id_app_device: string,
    /**
     * Public key
     */
    public_key_server: string,
    /**
     * Privave key
     */
    private_key_server: string,
    /**
     * App public key
     */
    public_key_client: string
}

/**
 * Create a model to key pair
 * @param sequelize Sequelize connection
 * @returns Model
 */
const KeyPairModel: ModelConstructor<IKeyPair, Omit<IKeyPair, "id">> = (sequelize) => {

    // Define Structure model
    return sequelize.define<Model<IKeyPair> & IKeyPair>("key_pair", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_app_device: {
            type: DataTypes.STRING,
            allowNull: false
        },
        private_key_server: {
            type: DataTypes.STRING,
            allowNull: false
        },
        public_key_server: {
            type: DataTypes.STRING,
            allowNull: false
        },
        public_key_client: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
}

export default KeyPairModel;