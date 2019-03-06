import { Grid, GridOptions, IServerSideGetRowsRequest } from 'ag-grid-community';
import "ag-grid-enterprise";
import "./styles/styles.scss";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { DataService } from './services/DataService';
import { ServerToolPanel } from './components/ServerToolPanel';
import { TerminalManager, HistoryItem, DescriptionType } from './TerminalManager';

export class ServerGrid {
    private gridEl: HTMLElement;
    private gridOptions: GridOptions = {};
    private dataService: DataService;
    private terminal: TerminalManager;
    private lastEvent: DescriptionType;

    // Configurable by Tool Panel / SSRM properties
    private pagination: boolean = null;
    private paginationPageSize: number = null;
    private cacheBlockSize: number = null;
    private maxBlocksInCache: number = null;
    private cacheOverflowSize: number = null;
    private maxConcurrentDatasourceRequests: number = null;
    private infiniteInitialRowCount: number = null;
    private purgeClosedRowNodes: boolean = null;
    private serverSideSortingAlwaysResets: boolean = null;

    constructor(selector: string) {
        this.dataService = new DataService(this.processRequest.bind(this));
        this.terminal = new TerminalManager();

        this.gridOptions = this.createGridOpts();

        this.gridEl = <HTMLElement>document.querySelector(selector);
        this.createGrid(this.gridEl);
    }

    private createGrid(elem: HTMLElement): void {
        this.gridOptions = this.createGridOpts();
        new Grid(elem, this.gridOptions);
        this.gridOptions.api.setServerSideDatasource(this.dataService);
    }

    private createGridOpts(): GridOptions {
        let opts = {
            columnDefs: this.createColumnDefs(),
            defaultColDef: {
                sortable: true,
                enableValue: true,
                enablePivot: false,
                enableRowGroup: true
            },
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                    },
                    {
                        id: 'filters',
                        labelDefault: 'Filters',
                        labelKey: 'filters',
                        iconKey: 'filter',
                        toolPanel: 'agFiltersToolPanel',
                    },
                    {
                        id: 'serverProperties',
                        labelDefault: 'Server Properties',
                        labelKey: 'serverProperties',
                        iconKey: null,
                        toolPanel: 'serverToolPanel',
                        toolPanelParams: {
                            properties: {
                                pagination: {
                                    value: this.pagination,
                                    type: 'boolean'
                                },
                                paginationPageSize: {
                                    value: this.paginationPageSize,
                                    type: 'number'
                                },
                                cacheBlockSize: {
                                    value: this.cacheBlockSize,
                                    type: 'number'
                                },
                                maxBlocksInCache: {
                                    value: this.maxBlocksInCache,
                                    type: 'number'
                                },
                                cacheOverflowSize: {
                                    value: this.cacheOverflowSize,
                                    type: 'number'
                                },
                                maxConcurrentDatasourceRequests: {
                                    value: this.maxConcurrentDatasourceRequests,
                                    type: 'number'
                                },
                                infiniteInitialRowCount: {
                                    value: this.infiniteInitialRowCount,
                                    type: 'number'
                                },
                                purgeClosedRowNodes: {
                                    value: this.purgeClosedRowNodes,
                                    type: 'boolean'
                                },
                                serverSideSortingAlwaysResets: {
                                    value: this.serverSideSortingAlwaysResets,
                                    type: 'boolean'
                                }
                            },
                            setProperty: (key, value) => {
                                console.log('setting property: ', key, value);
                                console.log('this is: ', this);
                                this[key] = value;
                            },
                            refreshGrid: this.refreshGrid.bind(this)
                        }
                    }
                ],
                defaultToolPanel: 'serverProperties'
            },
            components: {
                serverToolPanel: ServerToolPanel
            },
            rowModelType: 'serverSide',
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

        if(this.pagination) opts['pagination'] = this.pagination;
        if(this.paginationPageSize) opts['paginationPageSize'] = this.paginationPageSize;
        if(this.cacheBlockSize) opts['cacheBlockSize'] = this.cacheBlockSize;
        if(this.maxBlocksInCache) opts['maxBlocksInCache'] = this.maxBlocksInCache;
        if(this.cacheOverflowSize) opts['cacheOverflowSize'] = this.cacheOverflowSize;
        if(this.maxConcurrentDatasourceRequests) opts['maxConcurrentDatasourceRequests'] = this.maxConcurrentDatasourceRequests;
        if(this.infiniteInitialRowCount) opts['infiniteInitialRowCount'] = this.infiniteInitialRowCount;
        if(this.purgeClosedRowNodes) opts['purgeClosedRowNodes'] = this.purgeClosedRowNodes;
        if(this.serverSideSortingAlwaysResets) opts['serverSideSortingAlwaysResets'] = this.serverSideSortingAlwaysResets;

        return opts;
    }

    private refreshGrid(): void {
        this.terminal.reset();
        this.gridEl.innerHTML = null;
        this.createGrid(this.gridEl);
    }

    private createColumnDefs(): any[] {
        return [
            {
                headerName: 'Row Index', valueGetter: (params) => {
                    return params.node.rowIndex;
                }
            },
            { field: 'athlete', filter: 'text' },
            { field: 'country', rowGroup: true, hide: true },
            { field: 'sport', rowGroup: true, hide: true },
            { field: 'year', filter: 'number', filterParams: { newRowsAction: 'keep' } },
            { field: 'gold', aggFunc: 'sum' },
            { field: 'silver', aggFunc: 'sum' },
            { field: 'bronze', aggFunc: 'sum' }
        ];
    }

    private processRequest(request: IServerSideGetRowsRequest, response: any): void {
        const item: HistoryItem = {
            request,
            response,
            descriptionType: this.lastEvent ? this.lastEvent : this.pagination ?
                DescriptionType.Page : DescriptionType.Scroll
        };
        this.terminal.pushItem(item);
        this.lastEvent = null;
    }
}