import { it,  beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import {execSync} from 'node:child_process'
import { app } from '../src/app'
import request from 'supertest'

describe('Transactions routes', () => {
    // esperar o app estar pronto para poder rodar os testes
    beforeAll(async () => {
        await app.ready()
    })
    // fechar o app apos o término da execução dos testes
    afterAll(async () => {
        await app.close()
    })

    //evitar erro 500 (internal error). apagando e criando as migrations do banco 
    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new transaction', async () => {
        //fazer uma chamada HTTP p/ criar uma nova transação
    
        await request(app.server).post('/transactions')
            .send({
            text: "New Transaction",
            amount: 1000,
            type: "credit"
    
            })
            .expect(201)
    })

    it('should be able to list all transaction', async () => {
        const createTransactionResponse = await request(app.server).post('/transactions')
            .send({
            text: "New Transaction",
            amount: 1000,
            type: "credit"
    
            })
        
        //resgatar o cookie da transação de inserir
        const cookies = createTransactionResponse.get('Set-Cookie')

        let listTransectionsResponse = null

        if (cookies != undefined){
            listTransectionsResponse = await request(app.server)
                .get('/transactions')
                .set('Cookie', cookies)
                .expect(200)
        }

        if(listTransectionsResponse != null){
            // espera que no corpo da listagem da transação, exista um objeto contendo as informações informadas
            expect(listTransectionsResponse.body.transactions).toEqual([
                expect.objectContaining({
                    text: "New Transaction",
                    amount: 1000
                })
            ])
        }
    })

    it('should be able to get a especific transaction', async () => {
        const createTransactionResponse = await request(app.server).post('/transactions')
            .send({
            text: "New Transaction",
            amount: 1000,
            type: "credit"
    
            })
        
        //resgatar o cookie da transação de inserir
        const cookies = createTransactionResponse.get('Set-Cookie')

        if (cookies != undefined){
           let listTransectionsResponse = await request(app.server)
                .get('/transactions')
                .set('Cookie', cookies)

            //recuperando o ID da transação
            const transactionId = listTransectionsResponse.body.transactions[0].id

            const getTransactionResponse = await request(app.server)
                .get(`/transactions/${transactionId}`)
                .set('Cookie', cookies)
                .expect(200)

            // espera que no corpo da transação, exista um objeto contendo as informações informadas
            expect(getTransactionResponse.body.transaction).toEqual(
                expect.objectContaining({
                    text: "New Transaction",
                    amount: 1000
                })
            )
        }
    })

    it('should be able to get the summary', async () => {
        const createTransactionResponse = await request(app.server).post('/transactions')
            .send({
            text: "New Transaction",
            amount: 1000,
            type: "credit"
    
            })
        
        //resgatar o cookie da transação de inserir
        const cookies = createTransactionResponse.get('Set-Cookie')


        if (cookies != undefined){
            //criando mais uma transição para cálculo
            await request(app.server).post('/transactions')
            .send({
            text: "New Transaction",
            amount: 500,
            type: "debit"
    
            })
            .set('Cookie', cookies)

           const summaryResponse = await request(app.server)
                .get('/transactions/summary')
                .set('Cookie', cookies)
                .expect(200)


            // espera que no corpo da transação, exista um objeto contendo as informações informadas
            expect(summaryResponse.body.summary).toEqual([{
                amount:500
            }])
        }
    })
})

