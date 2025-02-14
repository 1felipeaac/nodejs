import fastify from "fastify";

import { transactionsRoutes } from "./routes/transactions";
import cookie from "@fastify/cookie";

export const app = fastify();

// GET, POST, PUT, DELETE, PATCH

app.register(cookie)

app.register(transactionsRoutes, {prefix: "transactions"})