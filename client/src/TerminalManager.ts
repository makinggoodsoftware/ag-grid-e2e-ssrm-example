import { IServerSideGetRowsRequest } from "ag-grid-community";

export class TerminalManager {
    private history: any[] = [];

    constructor() {}

    public pushRequest(request: IServerSideGetRowsRequest, response: any) {
        this.history.push({request, response});

        const index = this.history.length - 1;
        this.addHistoryButton(this.history[index], index);
    }

    private addHistoryButton(historyItem: any, index: number) {
        const btn = document.createElement('button');
        btn.innerText = index.toString();
        btn.classList.add('new');

        btn.addEventListener('click', () => {
            btn.classList.remove('new');
            this.populateTerminal(historyItem);
        });

        const btnVp = document.querySelector('.button-viewport');
        btnVp.prepend(btn);
    }

    private populateTerminal(historyItem: any) {
        const { request, response } = historyItem;

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
}