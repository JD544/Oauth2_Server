import mysql from 'mysql';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

const connection = mysql.createConnection({
    host: dotenv.config().parsed?.MYSQL_HOST,
    user: dotenv.config().parsed?.MYSQL_USER,
    password: dotenv.config().parsed?.MYSQL_PASSWORD,
    database: dotenv.config().parsed?.MYSQL_DATABASE
});

const authentication_backend = dotenv.config().parsed?.AUTHENTICATION_BACKEND;

if (authentication_backend == "external") {
    connection.connect(err => {
        if (err) {
            console.error('Error connecting to database...' );
            return;
        }
        console.log('Connected to database server...');
    });
}
/**
 * Executes a SQL query with the given parameters and returns a Promise that resolves with the query results or rejects with an error.
 *
 * @param {string} sql - The SQL query to execute.
 * @param {any} params - The parameters to bind to the query.
 * @return {Promise<any>} A Promise that resolves with the query results or rejects with an error.
 */
function query(sql: string, params: string[]) {
    return new Promise<any>((resolve, reject) => {
        connection.query(sql, params, (err, rows) => {
            if (err) {
                console.error(err);
               return reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * Escapes special characters in a string for use in a MySQL query.
 *
 * @param {string} str - The string to be escaped.
 * @return {string} The escaped string.
 */
function escape(str: string) {
    return mysql.escape(str);
}

export {
    query,
    escape
}