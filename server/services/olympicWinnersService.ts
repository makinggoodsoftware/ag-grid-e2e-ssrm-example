import * as mysql from 'mysql';
import { QueryBuilder } from '../utils/queryBuilder';

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password'
});

connection.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('db connection established');
})

export class OlympicWinnersService {

    public getRows(request, resultsCallback: Function): void {

        const SQL = QueryBuilder.getRowsSql(request);
        

        connection.query(SQL, (error, results) => {
            const rowCount = this.getRowCount(request, results);
            const resultsForPage = this.cutResultsToPageSize(request, results);

            resultsCallback(resultsForPage, rowCount, SQL);
        });
    }

    private getRowCount(request, results): number {
        if (results === null || results === undefined || results.length === 0) {
            return null;
        }
        const currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }

    private cutResultsToPageSize(request, results) {
        const pageSize = request.endRow - request.startRow;
        if (results && results.length > pageSize) {
            return results.splice(0, pageSize);
        } else {
            return results;
        }
    }
}

export default new OlympicWinnersService();