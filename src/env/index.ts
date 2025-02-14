import {config} from 'dotenv'

import {z} from 'zod'

// console.log("./env/index.ts")

// console.log("variaveis de ambiente: "+ JSON.stringify(process.env))

if(process.env.NODE_ENV === 'test'){
    console.log("Rodando os testes...")
    config({path: '.env.test'})
}else{
    console.log("Rodando ambiente DEV...")
    config()
}

const envSchema = z.object({
    AMBIENTE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string(),
    PORT: z.number().default(3333)
})

const _env = envSchema.safeParse(process.env)

if(_env.success === false){
    console.error('⚠️ Invalid environment variable!', _env.error.format())
    throw new Error('Invalid environment variable!')
}

export const env = _env.data