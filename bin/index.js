#! /usr/bin/env node

require('dotenv').config()

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv));

//* Subfolders for commands
const seed = require('./seed');

argv.scriptName("pg-seed").usage('$0 <cmd> [args]').strict();

argv.command(
    'seed-from <source> [domain] [port] [user] [password] [database] [verbose]',
    "Seed a target database from a JSON file, a folder containing JSON files or a tarball. \r\nOnly existing tables and their columns are populated.",
    (yargs) => {
        return yargs.positional('source', {
            describe: "The absolute path to the file or folder",
            type: "string"
        }).positional('domain', {
            describe: "The URL of the database",
            type: "string",
            default: 'localhost'
        }).positional('port', {
            describe: "The port of the database",
            type: "string",
            alias: "p",
            default: "5432"
        }).positional('user', {
            describe: "The user to authenticate with",
            type: "string",
            alias: "u"
        }).positional('password', {
            describe: "The port of the database",
            type: "string",
            alias: "pwd"
        }).positional('database', {
            describe: "The port of the database",
            type: "string",
            alias: "db"
        }).positional('verbose', {
            describe: "Verbose logging",
            type: "boolean",
            alias: "v",
            default: false
        })
    }, async (argv) => {
        try {

            let paramObj = { }

            // <source>
            if (argv.source) {
                paramObj['source'] = argv.source
            } else {
                throw new Error(`No source provided`)
            }

            // [domain]
            if (argv.domain !== undefined && argv.domain !== "") {
                paramObj['domain'] = argv.domain
            } else if (process.env.DB_DOMAIN !== undefined && process.env.DB_DOMAIN !== "") {
                paramObj.domain = process.env.DB_DOMAIN
            } else {
                throw new Error(`No domain provided`)
            }

            // [port]
            if (argv.port !== undefined && argv.port !== "") {
                paramObj['port'] = argv.port
            } else if (process.env.DB_PORT !== undefined && process.env.DB_PORT !== "") {
                paramObj.port = process.env.DB_PORT
            } else {
                throw new Error(`No port provided`)
            }

            // [user]
            if (argv.user !== undefined && argv.user !== "") {
                paramObj['user'] = argv.user
            } else if (process.env.DB_USER !== undefined && process.env.DB_USER !== "") {
                paramObj.user = process.env.DB_USER
            } else {
                throw new Error(`No user provided`)
            }

            // [password]
            if (argv.password !== undefined && argv.password !== "") {
                paramObj['password'] = argv.password
            } else if (process.env.DB_PWD !== undefined && process.env.DB_PWD !== "") {
                paramObj.password = process.env.DB_PWD
            } else {
                throw new Error(`No password provided`)
            }

            // [database]
            if (argv.database !== undefined && argv.database !== "") {
                paramObj['database'] = argv.database
            } else if (process.env.DB_DATABASE !== undefined && process.env.DB_DATABASE !== "") {
                paramObj.database = process.env.DB_DATABASE
            } else {
                throw new Error(`No database provided`)
            }

            await seed.seed_from(paramObj);

        } catch (error) {
            console.error(error.message);
        }
    }
).help().argv