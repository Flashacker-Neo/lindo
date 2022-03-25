import { Mod } from '../mod';
import { Checkbox } from '@helpers/windowHelper/inputs/checkbox';

export class AutoPass extends Mod {
    private container: HTMLDivElement;
    private isActivate: boolean = false;
    private timeOut: any;

    startMod(): void {
        let autoPassCss = document.createElement('style');
        autoPassCss.id = 'autoPassCss';
        autoPassCss.innerHTML = `
            .auto-pass-container {
                position: absolute;
                z-index: 2;
                top: 0;
                right: 0;
                min-height: 20px;
                min-width: 50px;
                background-color: rgba(0,0,0,0.7);
                padding: 0 2px 5px 0;
                border-radius: 0 0 0 7px;
            }`;
        this.wGame.document.querySelector('head').appendChild(autoPassCss);

        this.on(this.wGame.dofus.connectionManager, 'GameFightStartingMessage', () => this.insertComponent());
        this.on(this.wGame.dofus.connectionManager, 'GameFightEndMessage', () => this.remove());
        this.on(this.wGame.dofus.connectionManager, 'GameFightTurnStartMessage', ({id}) => this.passTurn(id));
    }

    private passTurn(id: number) {
        if (this.isActivate && id == this.wGame.gui.playerData.id) {
            this.timeOut = setTimeout(() => {
                this.wGame.dofus.sendMessage('GameFightTurnFinishMessage', {});
            }, this.getRandomTime(1,3));
        }
    }

    private insertComponent() {
        // Create HTML Element
        const checkbox: Checkbox = Checkbox.createCheckbox(this.wGame, 'autoPass', {text: 'AutoPass', isCheck: this.isActivate});
        this.container = this.wGame.document.createElement('div');
        this.container.classList.add('auto-pass-container');

        // Add elements in DOM
        this.container.append(checkbox.getHtmlElement());
        this.wGame.foreground.rootElement.appendChild(this.container);

        // Add listener on checkbox
        checkbox.addEvent((isCheck: boolean) => {
            if (this.isActivate) clearTimeout(this.timeOut);
            this.isActivate = isCheck;
        });
    }

    private remove() {
        if (this.container) this.container.remove();
    }

    public reset() {
        super.reset();
        this.wGame.document.getElementById('autoPassCss').remove();
        this.remove();
    }
}