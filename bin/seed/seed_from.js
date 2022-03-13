
const { Client } = require('pg')

async function main(paramObj) {

    console.info(`Seeding database: '${paramObj.database}'`)

    const client = new Client({
        host: paramObj.domain,
        port: paramObj.port,
        user: paramObj.user,
        password: paramObj.password,
        database: paramObj.database
    })

    await client.connect()

    let res = await client.query({
        text: `SELECT $1 AS message`,
        values: ['Database connected!']
    })
    console.info(res['rows'][0].message)

    

    await client.end()

}

module.exports = main