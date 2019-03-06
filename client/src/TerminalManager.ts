import { IServerSideGetRowsRequest } from "ag-grid-community";

export interface HistoryItem {
    request: IServerSideGetRowsRequest,
    response: any,
    descriptionType: DescriptionType
}

export enum DescriptionType {
    Page = "Paginate",
    Scroll = "Scroll",
    Sort = "Sort Changed",
    Filter = "Filter Changed",
    GroupChanged = "Row Group Changed",
    GroupOpened = "Row Group Opened",
    Aggregation = "Aggregation Changed",
    Pivot = "Pivot On/Off",
    PivotLabel = "Pivot Column Changed"
}

export class TerminalManager {

    private history: HistoryItem[] = [];

    // UI Console Elements
    private historyViewport: HTMLElement;
    private descriptionEl: HTMLElement;
    private queryEl: HTMLElement;
    private requestEl: HTMLElement;
    private responseEl: HTMLElement;

    constructor() {
        this.historyViewport = document.querySelector('.button-viewport');
        this.descriptionEl = document.querySelector('#descriptionInfo p');
        this.queryEl = document.querySelector('#queryInfo pre');
        this.requestEl = document.querySelector('#requestInfo pre');
        this.responseEl = document.querySelector('#responseInfo pre');
    }

    public pushItem(item: HistoryItem) {
        this.addHistoryButton(item);
    }

    private addHistoryButton(item: HistoryItem) {
        const btn = document.createElement('button');
        btn.innerText = item.descriptionType + ' (' + (this.history.length) + ')';
        this.history.push(item);
        btn.classList.add('new');

        btn.addEventListener('click', () => {
            btn.classList.remove('new');
            this.populateTerminal(item);
        });

        this.historyViewport.prepend(btn);
    }

    private populateTerminal(item: HistoryItem) {
        this.descriptionEl.innerText = this.getDescription(item.request, item.descriptionType);
        this.queryEl.innerText = JSON.stringify(item.response.query, null, 1).replace('"', '');
        this.requestEl.innerText = JSON.stringify(item.request, null, 1);
        this.responseEl.innerText = JSON.stringify(item.response, null, 1);
    }

    private getDescription(request: IServerSideGetRowsRequest, type: DescriptionType): string {
        return `Loading rows ${request.startRow} to ${request.endRow} as a result of - ${type}`;
    }

    public reset(): void {
        this.history = [];
        this.descriptionEl.innerText = null;
        this.queryEl.innerText = null;
        this.requestEl.innerText = null;
        this.responseEl.innerText = null;
        this.historyViewport.innerHTML = null;
    }
}
