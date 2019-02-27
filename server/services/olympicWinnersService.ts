import * as mysql from 'mysql';
import { QueryService } from './queryService';

const connection = mysql.createConnection({
    host: 'rds-mysql-10mintutorial.czaeteyho3wl.eu-west-2.rds.amazonaws.com',
    user: 'masterUsername',
    password: 'password'
});

connection.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('db connection established');
})

export class OlympicWinnersService {

    public getRows(request, resultsCallback: Function): void {

        const SQL = QueryService.getRowsSql(request);
        

        connection.query(SQL, (error, results) => {
            const rowCount = this.getRowCount(request, results);
            const resultsForPage = this.cutResultsToPageSize(request, results);

            resultsCallback(resultsForPage, rowCount, SQL);
        });
    }

    public addRow(data, callback: Function): void {
        const SQL = QueryService.addRowSql(data);

        connection.query(SQL, (error, results) => {
            console.log(error, results);
            callback();
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