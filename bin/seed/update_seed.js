const fs = require('fs')
const { Client } = require('pg')
const format = require('../helpers/queryObjectFormatter')

let client;

async function getTableSchema(tableName) {

    try {

        const queryValue =
            `
            SELECT
                column_name,
                column_default,
                data_type
            FROM information_schema.columns
            WHERE
                table_schema = 'public'
                AND table_name = '${tableName}'
            `

        let { rows: columns } = await client.query(queryValue)

        return columns

    } catch (error) {
        throw error
    }

}

async function main(paramObj) {

    console.info(`Updating seed data at '${paramObj.target}' from database '${paramObj.database}'`)

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

        if (paramObj.target.endsWith('/')) {

            console.info('Target is a folder')

            directory = paramObj.target.slice(0, -1)

            const files = fs.readdirSync(directory)
            console.info(files)

            for await (const file of files) {
                const objectsArr = JSON.parse(fs.readFileSync(`${directory}/${file}`))

                console.log('Before:')
                console.table(objectsArr)

                const tableName = file.replace('.json', '')

                console.info(`Updating '${tableName}' with latest DB schema:`)

                const columns = await getTableSchema(tableName)

                console.table(columns)

                objectsArr.forEach((record, index) => {
                    
                    // console.log(record)

                    //TODO: Upsert columns into each record and write back to array
                })

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