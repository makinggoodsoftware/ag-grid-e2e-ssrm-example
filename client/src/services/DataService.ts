import {IServerSideGetRowsParams, IServerSideDatasource} from 'ag-grid-community';

export class DataService implements IServerSideDatasource {
    private processCallback: Function;

    constructor(processCallback: Function) {
        this.processCallback = processCallback;
    }

    public getRows(params: IServerSideGetRowsParams): void {
        // console.log('Getting Rows: ', JSON.stringify(params.request, null, 1));

        fetch('./olympicWinners/', {
            method: 'post',
            body: JSON.stringify(params.request),
            headers: {"Content-Type": "application/json; charset=utf-8"}
        })
        .then(httpResponse => httpResponse.json())
        .then(response => {
            this.processCallback(params.request, response);
            params.successCallback(response.rows, response.lastRow);
        })
        .catch(error => {
            console.error(error);
            params.failCallback();
        });
    }
}