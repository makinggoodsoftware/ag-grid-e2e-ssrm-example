import {Grid, GridOptions} from 'ag-grid-community';
import 'ag-grid-enterprise';

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

const gridOptions: GridOptions = {
    columnDefs: [
        {headerName: 'Row Index', valueGetter: (params) => {
            return params.node.rowIndex;
        }},
        {field: 'athlete', filter: 'text'},
        {field: 'country', rowGroup: true, hide: true},
        {field: 'sport', rowGroup: true, hide: true},
        {field: 'year', filter: 'number', filterParams: {newRowsAction: 'keep'}},
        {field: 'gold', aggFunc: 'sum'},
        {field: 'silver', aggFunc: 'sum'},
        {field: 'bronze', aggFunc: 'sum'},
    ],

    defaultColDef: {
        sortable: true,
        enableValue: true,
        enablePivot: false,
        enableRowGroup: true
    },
    sideBar: 'columns',
    rowModelType: 'serverSide',
    cacheBlockSize: 50,
    maxBlocksInCache: 3,
    // maxConcurrentDatasourceRequests: 2,
    // blockLoadDebounceMillis: 1000
};

const gridDiv = document.querySelector('#myGrid') as HTMLElement;
new Grid(gridDiv, gridOptions);

function populateConsole(request, response) {
    const queryConsole = document.querySelector('#queryInfo pre');
    const requestConsole = document.querySelector('#requestInfo pre');
    const responseConsole = document.querySelector('#responseInfo pre');

    const requestText = JSON.stringify(request, null, 1).replace(',', '\n');
    const responseText = JSON.stringify(response, null, 1);
    const queryText = JSON.stringify(response.query, null, 1).replace('"', '');

    requestConsole.innerHTML = requestText;
    responseConsole.innerHTML = responseText;
    queryConsole.innerHTML = queryText;
}

const datasource = {
    getRows(params) {
         console.log(JSON.stringify(params.request, null, 1));

         fetch('./olympicWinners/', {
             method: 'post',
             body: JSON.stringify(params.request),
             headers: {"Content-Type": "application/json; charset=utf-8"}
         })
         .then(httpResponse => httpResponse.json())
         .then(response => {
            populateConsole(params.request, response);
            params.successCallback(response.rows, response.lastRow);
         })
         .catch(error => {
             console.error(error);
             params.failCallback();
         })
    }
};

gridOptions.api.setServerSideDatasource(datasource);