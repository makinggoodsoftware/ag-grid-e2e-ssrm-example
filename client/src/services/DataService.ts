import {IServerSideGetRowsParams, IServerSideDatasource} from 'ag-grid-community';

export class DataService implements IServerSideDatasource {
    private processCallback: Function;
    private operationCompleteCallback: Function;

    constructor(processCallback: Function, operationCompleteCallback: Function) {
        this.processCallback = processCallback;
        this.operationCompleteCallback = operationCompleteCallback;
    }

    public addRow(data: any) {
        fetch('./olympicWinners/new', {
            method: 'post',
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json; charset=utf-8"}
        })
        .then(response => {
            this.operationCompleteCallback(response);
        });
    }

    public getRows(params: IServerSideGetRowsParams): void {
        console.log('Getting Rows: ', JSON.stringify(params.request, null, 1));

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