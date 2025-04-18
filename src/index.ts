import Server from "./server";
import dotenv from "dotenv";

// Load environments
dotenv.config();

// Create server instance
const server = new Server();
// Extract port server
const port = Number(process.env.APP_PORT);

// Start server
server.initialize(port)
    .then(() => {
        console.log("Server listenning on: http://localhost:" + port);
    })
    .catch((err) => {
        console.error(err);
    });
