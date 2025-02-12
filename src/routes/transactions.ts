import { FastifyInstance } from "fastify";
import {z} from "zod"
import { knex } from "../database";
import { randomUUID } from "crypto";
export function transactionsRoutes(app: FastifyInstance){
    app.post('/', async (request, response) => {
       const createTRansactionBodySchema = z.object({
        text: z.string(),
        amount: z.number(),
        type: z.enum(['credit','debit'])
       })

       const {type, amount, text} = createTRansactionBodySchema.parse(request.body)

       await knex('transactions')
        .insert({
            id: randomUUID(),
            text,
            amount: type === 'credit' ? amount : amount * - 1
        })

        return response.status(201).send()

    })
}