import Server from "../server";

/**
 * Structure base of controller
 */
export default class Controller {

    /**
     * Initialize controller
     * @param server Server instance
     */
    constructor(public readonly server: Server) {}
    
}