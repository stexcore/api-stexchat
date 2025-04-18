import Joi from "joi";
import schemaUtils from "../utils/schema.utils";

/**
 * Schema to validate segment exchange info
 */
export default {

    /**
     * Schema to validate
     */
    GET: schemaUtils.createSchema({
        body: Joi.object({
            id_app_device: Joi.string().required(),
            public_key: Joi.string().required(),
        })
    })
    
}