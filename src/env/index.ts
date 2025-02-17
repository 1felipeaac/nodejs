import {config} from 'dotenv'

import {z} from 'zod'

if(process.env.NODE_ENV === 'test'){
    config({path: '.env.test'})
}else{
    config()
    console.log(`PORT: ${process.env.PORT};\nNODE_ENV: ${process.env.NODE_ENV};\nDATABASE_CLIENT: ${process.env.DATABASE_CLIENT};\nDATABASE_URL: ${process.env.DATABASE_URL} `)
}

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
    DATABASE_URL: z.string(),
    PORT: z.coerce.number().default(3333)
})

const _env = envSchema.safeParse(process.env)

if(_env.success === false){
    console.error('⚠️ Invalid environment variable!', _env.error.format())
    throw new Error('Invalid environment variable!')
}

export const env = _env.data