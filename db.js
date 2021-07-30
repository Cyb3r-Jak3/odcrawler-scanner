const db = require('better-sqlite3')(process.env.SQL_FILE_PATH !== undefined ? process.env.SQL_FILE_PATH : "db.sqlite3");

const tables = [
    "CREATE TABLE IF NOT EXISTS blacklisted (username text UNIQUE, PRIMARY KEY (username));",
    "CREATE TABLE IF NOT EXISTS scrape (name text UNIQUE, type text);",
    "CREATE TABLE IF NOT EXISTS keyvalue (key text UNIQUE, value text);",
    "CREATE TABLE IF NOT EXISTS oldPMs (id text UNIQUE);",
    "CREATE TABLE IF NOT EXISTS oldMentions (id text UNIQUE);",
    "CREATE TABLE IF NOT EXISTS oldSubmissions (id text UNIQUE);",
    "CREATE TABLE IF NOT EXISTS excluded_domains (domain text UNIQUE);"

]

const insertStrings = {
    blacklisted: "INSERT INTO blacklisted (username) VALUES (?);",
    oldPMs: "INSERT INTO oldPMs (id) VALUES (?);",
    oldSubmissions: "INSERT INTO oldSubmissions (id) VALUES (?);",
    oldMentions: "INSERT INTO oldMentions (id) VALUES (?);"
}

module.exports.create = function create() {
    tables.forEach((element) => {
        var stmt = db.prepare(element)
        stmt.run()
    })

    console.debug("created tables")
}

module.exports.insert = function insert(table, ...data) {
    try {
        const stmt = db.prepare(insertStrings[table]);
        stmt.run(data);
    } catch (err) {
        console.error(err)
    }
}

module.exports.query = function query(queryString, ...params) {
    const stmt = db.prepare(queryString);
    const results = stmt.all(params);
    console.debug(queryString, params, "results: ", results)
    if (results.length === 0) {
        return results
    }
    var finalArray = [];
    const keys = Object.getOwnPropertyNames(results[0])
    results.forEach((result) => {
        finalArray.push(result[keys])
    })
    return finalArray
}