export class Button {
    private wGame: any|Window;

    constructor(wGame: any|Window) {
        this.wGame = wGame;
    }

    /**
     * Return a HTMLDivElement with dofus touch button skin
     * @param id The div id
     * @param text The text inside
     * @param color The color of button
     * @param customClass A custom className for add your css
     */
    public createTextButton(id: string, text: string, color: ButtonColor, customClassName?: string): HTMLDivElement {
        const button: HTMLDivElement = this.wGame.document.createElement('div');
        button.id = id;
        button.className = 'Button scaleOnPress ' + color;
        if (customClassName) button.classList.add(customClassName);
        button.insertAdjacentText('afterbegin', text);

        return button;
    }

    /**
     * Return a HTMLDivElement with dofus touch button icon skin
     * @param id The div id
     * @param icon The icon class name
     * @param customClass A custom className for add your css
     */
     public createIconButton(id: string, icon: string, customClassName?: string): HTMLDivElement {
        const button: HTMLDivElement = this.wGame.document.createElement('div');
        button.id = id;
        button.className = `Button scaleOnPress ${icon}`;
        if (customClassName) button.classList.add(customClassName);

        const btnIcon: HTMLDivElement = this.wGame.document.createElement('div');
        btnIcon.className = 'btnIcon';

        button.insertAdjacentElement('afterbegin', btnIcon);

        return button;
    }

    /**
     * Add click event and call the callBack method on click.
     * (Call this method after insert element in DOM)
     * @param button The button you wan't to add event
     * @param callBack The method to execute on click
     */
    public addButtonEvent(button: HTMLDivElement, callBack: any) {
        let onPress = () => {
            if (!button.classList.contains('disabled')) button.classList.add('pressed');
        };
        let onRelease = () => {
            if (button.classList.contains('pressed')) button.classList.remove('pressed'); 
        };
        let onClick = () => {
            if (!button.classList.contains('disabled')) callBack();
        };

        button.addEventListener('touchstart', onPress);
        button.addEventListener('touchend', onRelease);
        button.addEventListener('click', onClick);
    }

    /**
     * Disabled button, block action on click
     * @param button The button you wan't to disable
     */
    public disabledButton(button: HTMLDivElement) {
        if (!button.classList.contains('disabled')) button.classList.add('disabled');
    }

    /**
     * Enabled button
     * @param button The button you wan't to enable
     */
    public enabledButton(button: HTMLDivElement) {
        if (button.classList.contains('disabled')) button.classList.remove('disabled');
    }
}

export enum ButtonColor {
    'PRIMARY' = 'button',
    'SECONDARY' = 'secondaryButton',
    'SPECIAL' = 'specialButton'
}