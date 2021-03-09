export class Select {
    private wGame: any|Window;
    private static instance: Select;

    public static getInstance(wGame: any|Window): Select {
        if (!this.instance) this.instance = new Select(wGame);
        return this.instance;
    }

    private constructor(wGame: any|Window) {
        this.wGame = wGame;
        
        let selectDtCss = document.createElement('style');
        selectDtCss.id = 'selectDtCss';
        selectDtCss.innerHTML = `
            .customSelect:after {
                content: '';
                width: 34px;
                height: 100%;
                position: absolute;
                top: 0;
                right: 0;
                pointer-events: none;
                background-size: contain;
                background-position: right;
                background-repeat: no-repeat;
                background-image: url(../game/assets/ui/arrows/dropDown.png);
            }
        `;

        this.wGame.document.querySelector('head').appendChild(selectDtCss);
    }

    public createSelect(): HTMLDivElement {
        const selectBox: HTMLDivElement = this.wGame.document.createElement('div');
        selectBox.className = 'Selector customSelect';

        const select: HTMLSelectElement = this.wGame.document.createElement('select');
        select.className = 'selectorContent';
        select.style.webkitAppearance = 'none';
        select.style.height = '32px';

        const option = `
            <option>Test 1</option>
            <option>Test 2</option>
            <option>Test 3</option>
            <option>Test 4</option>
        `;

        select.insertAdjacentHTML('afterbegin', option);
        selectBox.insertAdjacentElement('afterbegin', select);

        return selectBox;
    }
}