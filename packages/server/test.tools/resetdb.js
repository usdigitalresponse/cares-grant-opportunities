#!/usr/bin/env node
const path = require('path');

let { log } = console;
let { dir } = console;

function execShellCommand(cmd, options = {}) {
    // eslint-disable-next-line global-require
    const { exec } = require('child_process');
    // eslint-disable-next-line no-param-reassign
    options.maxBuffer = 1024 * 500;
    return new Promise((resolve, reject) => {
        exec(cmd, options, (error, stdout, stderr) => {
            if (error) {
                // console.warn(error);
                reject(error);
                return;
            } if (stdout) {
                log(stdout);
            } else {
                console.log(stderr);
            }
            resolve(Boolean(stdout));
        });
    });
}

async function resetDB({ verbose = false }) {
    if (!verbose) {
        log = () => {};
        dir = () => {};
    }
    dir(__dirname);
    const knexfile = path.resolve(__dirname, '../knexfile.js');
    let url = process.env.POSTGRES_URL;
    const dbName = url.substring(url.lastIndexOf('/') + 1);
    url = url.substring(0, url.lastIndexOf('/'));
    const options = {
        env: process.env,
    };

    try {
        console.log(`Dropping database ${dbName}`);
        await execShellCommand(`psql ${url} -c "DROP DATABASE IF EXISTS ${dbName}"`);
        console.log(`Re-creating database ${dbName}`);
        await execShellCommand(`psql ${url} -c "CREATE DATABASE ${dbName}"`);
        console.log(`Seeding database ${dbName}`);
        await execShellCommand(`yarn knex migrate:latest`, options);
        await execShellCommand(`yarn knex --knexfile ${knexfile} seed:run`, options);
    } catch (err) {
        console.dir(err);
        return err;
    }
    return null;
}

// resetDB();
module.exports = resetDB;

/*

#!/bin/bash

# The actual directory of this file.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
# set -x
set -e

# Import .env variables if not already defined.
DOTENV="$DIR/../../.env"
source /dev/stdin <<DONE
$(grep -v '^#' $DOTENV | sed -E 's|^(.+)=(.*)|: ${\1=\2}; export \1|g')
DONE

# Default dbname is "postgres"
dbname=${1:-postgres}

echo Using database $dbname

mkdir -p $UPLOAD_DIRECTORY
rm -rf $UPLOAD_DIRECTORY/*

if [[ $dbname = postgres ]]
then
  # if the dbname is postgres it's easier to drop the schema than the database.
  psql -h localhost -U postgres -w postgres -c "DROP SCHEMA public CASCADE"
  psql -h localhost -U postgres -w postgres -c "CREATE SCHEMA public"
else

  psql -h localhost -U postgres -w postgres -c "DROP DATABASE IF EXISTS $dbname"
  psql -h localhost -U postgres -w postgres -c "CREATE DATABASE $dbname"
fi

yarn knex migrate:latest
yarn knex --knexfile tests/server/knexfile.js seed:run

*/