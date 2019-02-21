import { Grid, GridOptions, IServerSideGetRowsRequest } from 'ag-grid-community';
import "ag-grid-enterprise";
import "./styles/styles.scss";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { DataService } from './services/DataService';
import { TerminalManager } from './TerminalManager';

export class ServerGrid {
    private gridOptions: GridOptions = {};
    private dataService: DataService;
    private terminal: TerminalManager;

    constructor(selector: string) {
        this.dataService = new DataService(this.processRequestCb.bind(this));
        this.terminal = new TerminalManager();

        this.gridOptions = this.createGridOpts();

        let eGridDiv: HTMLElement = <HTMLElement>document.querySelector(selector);
        new Grid(eGridDiv, this.gridOptions);
        this.gridOptions.api.setServerSideDatasource(this.dataService);
    }

    private createGridOpts(): GridOptions {
        return {
            onGridReady: (params) => {
        
            },
            columnDefs: this.createColumnDefs(),
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
    }

    private createColumnDefs(): any[] {
        return [
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
        ];
    }

    private processRequestCb(request: IServerSideGetRowsRequest, response: any) {
        this.terminal.pushRequest(request, response);
    }
}