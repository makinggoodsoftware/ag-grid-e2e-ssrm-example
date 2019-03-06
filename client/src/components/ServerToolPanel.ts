import {IToolPanel, IToolPanelParams} from "ag-grid-community";

interface ServerToolPanelParams extends IToolPanelParams {
    properties: object;
    setProperty: Function;
    refreshGrid: Function;
}

export class ServerToolPanel implements IToolPanel {
    private params: ServerToolPanelParams;

    public init(params: ServerToolPanelParams): void {
        this.params = params;
    }

    public getGui(): any {
        const props = this.params.properties;
        const el = document.createElement('div');
        el.innerHTML = `
            <h3>SERVER SIDE PROPERTIES</h3>
            <p>
                These controls can be used to modify some of the SSRM gridOptions.
                Once you are happy with the settings, scroll down and hit <strong>APPLY</strong>.
            </p>
            <p>
                <strong>EMPTY VALUES WILL USE GRID DEFAULTS, OR NULL</strong>
            </p>
            <p>
                <strong>For more info click 
                <a href="https://www.ag-grid.com/javascript-grid-server-side-model-infinite/#cache-configuration">
                    here.
                </a></strong>
            </p>
            <p>
                <strong>SIDENOTE:</strong> You may notice that <strong>pivot columnLabels are not implemented</strong> in this example.
                Pivot queries require bespoke SQL. If you want to implement Pivot, You should contact your Database Administrator concerning this.
            </p>
        `;

        el.classList.add('server-tool-panel');

        Object.keys(props).forEach(prop => {
            const configEl = document.createElement('div');
            configEl.innerHTML = `<label>${prop}</label>`;
            const input = document.createElement('input');
            input.id = prop + '-input';

            const { value, type } = props[prop];

            if(type === 'boolean') {
                input.type = 'checkbox';
                input.checked = value;
            } else {
                input.type = 'text';
                input.value = value;
            }

            configEl.appendChild(input);
            el.appendChild(configEl);
        });

        const applyBtn = document.createElement('button');
        applyBtn.innerText = 'Apply';
        applyBtn.addEventListener('click', this.applyChanges.bind(this));
        el.appendChild(applyBtn);

        return el;
    }

    private applyChanges(e: Event): void {
        const props = this.params.properties;
        Object.keys(props).forEach(prop => {
            const input = document.getElementById(prop + '-input');
            const { type } = props[prop];

            let newValue = null;
            if(type === 'boolean') {
                newValue = Boolean((<HTMLInputElement>input).checked);
            } else {
                const convert = (<HTMLInputElement>input).value;
                if(convert) {
                    newValue = Number(convert);
                }
            }
            this.params.setProperty(prop, newValue);
        });
        this.params.refreshGrid();
    }

    public refresh(): void {

    }
}