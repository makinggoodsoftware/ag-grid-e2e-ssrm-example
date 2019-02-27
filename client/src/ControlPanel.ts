export class ControlPanel {
    private addRowCb: Function;
    private addRowBtn: HTMLElement;

    constructor(addRowCb: Function) {
        this.addRowCb = addRowCb;
        this.addRowBtn = document.getElementById(('addRow'));
        this.addRowBtn.addEventListener('click', this.addRow.bind(this));
    }

    private addRow(): void {
        const country = (<HTMLInputElement>document.getElementById('countryInput')).value;
        const athlete = (<HTMLInputElement>document.getElementById('athleteInput')).value;
        const sport = (<HTMLInputElement>document.getElementById('sportInput')).value;
        const year = (<HTMLInputElement>document.getElementById('yearInput')).value;
        const gold = (<HTMLInputElement>document.getElementById('goldInput')).value;
        const silver = (<HTMLInputElement>document.getElementById('silverInput')).value;
        const bronze = (<HTMLInputElement>document.getElementById('bronzeInput')).value;
        this.addRowCb({
            country,
            athlete,
            sport,
            year: Number(year),
            gold: Number(gold),
            silver: Number(silver),
            bronze: Number(bronze)
        });
    }
   
}
