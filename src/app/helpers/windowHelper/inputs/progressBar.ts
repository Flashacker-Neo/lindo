import { CustomDTElement } from "../customElement.abstract";

export class ProgressBar extends CustomDTElement<ProgressBar> {

    private constructor(wGame: any|Window) {
        super(wGame);
    }

    /**
     * Return an HTMLDivElement of with dofus touch progressBar skin
     * @param id The div id
     * @param options The options of progressBar
     */
    public static create(wGame: any|Window, id: string, options: {color: ProgressColor, percent?: number}): ProgressBar {
        const instance: ProgressBar = new ProgressBar(wGame);

        instance.htmlElement = instance.wGame.document.createElement('div');
        instance.htmlElement.id = id;
        instance.htmlElement.className = `ProgressBar ${options.color}`;
        instance.htmlElement.dataset.color = options.color;
        if (!options.percent) options.percent = 0;

        const barFill: any = instance.wGame.document.createElement('div');
        barFill.className = 'barFill';
        barFill.style.webkitMaskSize = `${options.percent}% 100%`;

        barFill.insertAdjacentHTML('afterbegin', '<div class="barColor"></div>');
        instance.htmlElement.insertAdjacentHTML('afterbegin', '<div class="barBg"></div>');
        instance.htmlElement.insertAdjacentElement('beforeend', barFill);

        return instance;
    }

    /**
     * Change the color of progressBar
     * @param color The new color
     */
    public changeColor(color: ProgressColor): ProgressBar {
        this.htmlElement.classList.replace(this.htmlElement.dataset.color, color);
        return this;
    }

    /**
     * Change the percentage value of progressBar
     * @param percent The new percent value
     */
    public changePercent(percent: number): ProgressBar {
        const barFill: any = this.htmlElement.getElementsByClassName('barFill')[0];
        barFill.style.webkitMaskSize = `${percent}% 100%`;
        return this;
    }

    public setAttribute(qualifiedName: string, value: string): ProgressBar {
        super.setAttribute(qualifiedName, value);
        return this;
    }
}

export enum ProgressColor {
    RED = 'red',
    GREEN = 'green',
    YELLOW = 'yellow',
    ORANGE = 'orange',
    BLUE = 'blue',
}