const fs = require('fs')
const { Client } = require('pg')
const format = require('../helpers/queryObjectFormatter')

let client;

async function upsertRows(table, rows) {

    console.info(`Upserting rows into table '${table}'`)
    
    try {
        for await (const row of rows) {
        
            const queryObj = await format(row)
    
            const queryValue = {
                text:
                    `INSERT INTO "${table}" (${queryObj.columns})
                    VALUES (${queryObj.valueParams})
                    ON CONFLICT (id)
                        DO UPDATE SET ${queryObj.updateSets}
                        RETURNING (id)
                    `,
                values: queryObj.values
            }
    
            let { rows: response } = await client.query(queryValue)
    
            console.log(response[0])
        }
    } catch (error) {
        throw error
    }
}

async function main(paramObj) {

    console.info(`Seeding database '${paramObj.database}'`)

    try {

        client = new Client({
            host: paramObj.domain,
            port: paramObj.port,
            user: paramObj.user,
            password: paramObj.password,
            database: paramObj.database
        })

        await client.connect()

        let { rows: response } = await client.query({
            text: `SELECT $1 AS message`,
            values: ['Database connected']
        })
        console.info(response[0].message)

        let directory = ''

        if (paramObj.source.endsWith('/')) {

            console.info('Source is a folder')

            directory = paramObj.source.slice(0, -1)
            
            const files = fs.readdirSync(directory)
            console.info(files)

            for await (const file of files) {
                const rows = JSON.parse(fs.readFileSync(`${directory}/${file}`))

                const tableName = file.replace('.json', '')

                await upsertRows(tableName, rows)
            }

        } else if (paramObj.source.endsWith('.json')) {

            console.info('Source is a single JSON file')

        } else if (paramObj.source.endsWith('.tar') || paramObj.source.endsWith('.tar.gz')) {

            console.info('Source is a tar file')

        }


        await client.end()

        console.info('Seeding complete!')

    } catch (error) {
        throw error
    }

}

module.exports = main