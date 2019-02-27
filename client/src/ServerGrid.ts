import { Grid, GridOptions, IServerSideGetRowsRequest } from 'ag-grid-community';
import "ag-grid-enterprise";
import "./styles/styles.scss";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { DataService } from './services/DataService';
import { TerminalManager, HistoryItem, DescriptionType } from './TerminalManager';
import { ControlPanel } from './ControlPanel';

export class ServerGrid {
    private gridOptions: GridOptions = {};
    private dataService: DataService;
    private terminal: TerminalManager;
    private controlPanel: ControlPanel;
    private lastEvent: DescriptionType;

    constructor(selector: string) {
        this.dataService = new DataService(this.processRequest.bind(this), this.operationComplete.bind(this));
        this.terminal = new TerminalManager();
        this.controlPanel = new ControlPanel(this.addRow.bind(this));

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
            // blockLoadDebounceMillis: 1000,
            onSortChanged: (params) => {
                this.lastEvent = DescriptionType.Sort;
            },
            onFilterChanged: (params) => {
                this.lastEvent = DescriptionType.Filter;
            },
            onColumnRowGroupChanged: (params) => {
                this.lastEvent = DescriptionType.GroupChanged;
            },
            onRowGroupOpened: (params) => {
                this.lastEvent = DescriptionType.GroupOpened;
            },
            onColumnValueChanged: (params) => {
                this.lastEvent = DescriptionType.Aggregation;
            },
            onColumnPivotModeChanged: (params) => {
                this.lastEvent = DescriptionType.Pivot;
            },
            onColumnPivotChanged: (params) => {
                this.lastEvent = DescriptionType.PivotLabel;
            }
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

    private processRequest(request: IServerSideGetRowsRequest, response: any): void {
        const item: HistoryItem = {
            request,
            response,
            descriptionType: this.lastEvent || DescriptionType.Scroll
        };
        this.terminal.pushItem(item);
        this.lastEvent = null;
    }

    private addRow(data: any): void {
        this.dataService.addRow(data);
    }

    private operationComplete(response: any): void {
        // prompt get rows here
        console.log('operation complete', response);
        this.gridOptions.api.purgeServerSideCache();
    }
}