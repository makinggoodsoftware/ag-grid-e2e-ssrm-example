"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const queryBuilder_1 = require("../utils/queryBuilder");
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password'
});
connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('db connection established');
});
class OlympicWinnersService {
    getRows(request, resultsCallback) {
        const SQL = queryBuilder_1.QueryBuilder.getRowsSql(request);
        connection.query(SQL, (error, results) => {
            const rowCount = this.getRowCount(request, results);
            const resultsForPage = this.cutResultsToPageSize(request, results);
            resultsCallback(resultsForPage, rowCount, SQL);
        });
    }
    addRow(data, callback) {
        const SQL = queryBuilder_1.QueryBuilder.addRowSql(data);
        connection.query(SQL, (error, results) => {
            console.log(error, results);
            callback();
        });
    }
    getRowCount(request, results) {
        if (results === null || results === undefined || results.length === 0) {
            return null;
        }
        const currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
    cutResultsToPageSize(request, results) {
        const pageSize = request.endRow - request.startRow;
        if (results && results.length > pageSize) {
            return results.splice(0, pageSize);
        }
        else {
            return results;
        }
    }
}
exports.OlympicWinnersService = OlympicWinnersService;
exports.default = new OlympicWinnersService();
//# sourceMappingURL=olympicWinnersService.js.map