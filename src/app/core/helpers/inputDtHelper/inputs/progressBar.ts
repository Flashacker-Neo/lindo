export class ProgressBarHelper {
    private wGame: any|Window;
    private static instance: ProgressBarHelper;

    public static getInstance(wGame: any|Window): ProgressBarHelper {
        if (!this.instance) this.instance = new ProgressBarHelper(wGame);
        return this.instance;
    }

    private constructor(wGame: any|Window) {
        this.wGame = wGame;
    }

    /**
     * Return an HTMLDivElement of with dofus touch progressBar skin
     * @param id The div id
     * @param color The progressBar color
     * @param percent The percentage of progress
     */
    public createProgressBar(id: string, color: ProgressColor, percent?: number): HTMLDivElement {
        const progressBar: HTMLDivElement = this.wGame.document.createElement('div');
        progressBar.id = id;
        progressBar.className = `ProgressBar ${color}`;
        progressBar.dataset.color = color;
        if (!percent) percent = 0;
        progressBar.style.webkitMaskSize = `${percent}% 100%`;
        progressBar.style.webkitMaskPosition = '0px 0px';

        const barFill: HTMLDivElement = this.wGame.document.createElement('div');
        barFill.className = 'barFill';

        barFill.insertAdjacentHTML('afterbegin', '<div class="barColor"></div>');
        progressBar.insertAdjacentHTML('afterbegin', '<div class="barBg"></div>');
        progressBar.insertAdjacentElement('beforeend', barFill);

        return progressBar;
    }

    /**
     * Change the color of progressBar
     * @param progressBar The progressBar element
     * @param color The new color
     */
    public changeProgressColor(progressBar: HTMLDivElement, color: ProgressColor) {
        progressBar.classList.replace(progressBar.dataset.color, color);
    }

    /**
     * Change the percentage value of progressBar
     * @param progressBar The progressBar element
     * @param percent The new percent value
     */
    public changeProgressPercent(progressBar: HTMLDivElement, percent: number) {
        const barFill: any = progressBar.getElementsByClassName('barFill')[0];
        barFill.style.webkitMaskSize = `${percent}% 100%`;
    }
}

export enum ProgressColor {
    RED = 'red',
    GREEN = 'green',
    YELLOW = 'yellow',
    ORANGE = 'orange',
    BLUE = 'blue',
}