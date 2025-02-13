import { FastifyInstance } from "fastify";
import {z} from "zod"
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middleware/check-session-id-exists";
export function transactionsRoutes(app: FastifyInstance){

    // app.addHook('preHandler',async (request, response) => {
    //     console.log(`[${request.method}] ${request.url}`)
    // })

    app.get('/', 
        {preHandler: checkSessionIdExists},
        async (request, response) => {

        const sessionId = request.cookies.sessionId;

        if (!sessionId){
            return response.status(401).send({
                error: "Unauthorized access"
            })
        }

        const transactions = await knex('transactions')
            .where('session_id', sessionId)
            .select()

        return {transactions}
    })

    app.get('/:id', 
        {preHandler: checkSessionIdExists},
        async (request) => {

        const getTransactionParamsSchema = z.object({
            id: z.string().uuid()
        })

        const {id} = getTransactionParamsSchema.parse(request.params)

        const {sessionId} = request.cookies

        const transaction = await knex('transactions').where(
            {
                id, 
                'session_id': sessionId
            })
            .first()

        return {transaction}
    })

    app.get('/summary', 
        {preHandler: checkSessionIdExists},
        async (request) => {
            const {sessionId} = request.cookies
            const summary = await knex('transactions')
                .where('session_id', sessionId)
                .sum('amount', {as: 'amount'})

        return {summary}
    })

    app.post('/', async (request, response) => {
       const createTRansactionBodySchema = z.object({
        text: z.string(),
        amount: z.number(),
        type: z.enum(['credit','debit'])
       })

       const {type, amount, text} = createTRansactionBodySchema.parse(request.body)

       let sessionId = request.cookies.sessionId

       if (!sessionId) {
        sessionId = randomUUID()

        response.cookie('sessionId', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 dias
        })
       }

       await knex('transactions')
        .insert({
            id: randomUUID(),
            text,
            amount: type === 'credit' ? amount : amount * - 1,
            session_id: sessionId
        })

        return response.status(201).send()

    })
}