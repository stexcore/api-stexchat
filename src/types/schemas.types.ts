import { ObjectSchema } from "joi";

/**
 * Schema request incomming
 */
export interface ISchemaRequest {

    /**
     * Schema validation to incomming params. This params is received when the path
     * has a segment params. Sample path:
     * 
     * ```javascript
     * "/segment/:id_segment"
     * ```
     * 
     * The params value incomming will be:
     * 
     * ```javascript
     * { id_segment: "any value" }
     * ```
     */
    params?: ObjectSchema,

    /**
     * Body schema. This body is received into body request incomming
     */
    body?: ObjectSchema,

    /**
     * Query schema. This query is received into searchParams by path. Sample path:
     * 
     * ```javascript
     * "/api?search=username"
     * ```
     * 
     * The query value incomming will be:
     * 
     * ```javascript
     * { search: "username" }
     * ```
     */
    query?: ObjectSchema
}