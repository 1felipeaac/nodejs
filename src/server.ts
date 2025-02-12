import fastify from "fastify";
import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";

const app = fastify();

// GET, POST, PUT, DELETE, PATCH

app.register(transactionsRoutes, {prefix: "transactions"})

app.listen({
    port: env.PORT,
}).then(() => {
    console.log("HTTP Server Running");
})