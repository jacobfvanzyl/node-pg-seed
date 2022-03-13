
async function main(recordJSON) {

    let queryObj = {
        columns: [],
        values: [],
        columnsList: '',
        valueParams: '',
        updateSets: ''
    }

    // Split key-value pairs into columns and values
    for (const prop in recordJSON) {
        queryObj.columns.push(prop)

        if (typeof recordJSON[prop] === 'object') {
            // log.info(`Found JSON in property '${prop}'`)
            queryObj.values.push(JSON.stringify(recordJSON[prop]))
        } else {
            queryObj.values.push(recordJSON[prop])
        }
    }

    // Create SQL $ parameters for each value
    queryObj.valueParams = queryObj.values.map((value, index) => `$${index + 1}`).join(', ')

    // Filter out 'id' field and join remaining fields and their $ parameter into an update string
    let setsArr = []
    let columnsArr = []
    for (let index = 0; index < queryObj.columns.length; index++) {
        
        if(queryObj.columns[index] === 'id') {
            // Do nothing
        } else {
            setsArr.push(`${queryObj.columns[index]} = $${index + 1}`)
            columnsArr.push(`${queryObj.columns[index]}`)
        }

    }
    queryObj.updateSets = setsArr.join(', ')
    queryObj.columnsList = columnsArr.join(', ')

    // log.warn(queryObj)

    return queryObj

}

module.exports = main