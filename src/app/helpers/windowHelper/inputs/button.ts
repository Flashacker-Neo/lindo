import { CustomDTElement } from "../customElement.abstract";

export class Button extends CustomDTElement<Button> {

    private constructor(wGame: any|Window) {
        super(wGame);
    }

    /**
     * Return a Text Button with dofus touch button skin
     * @param id The div id
     * @param options The options of button
     * @returns Button
     */
    public static createTextButton(wGame: any|Window, id: string, options: {text: string, color: ButtonColor, customClassName?: string}): Button {
        const instance: Button = new Button(wGame);

        instance.htmlElement = instance.wGame.document.createElement('div');
        instance.htmlElement.id = id;
        instance.htmlElement.className = 'Button scaleOnPress ' + options.color;
        if (options.customClassName) instance.htmlElement.classList.add(options.customClassName);
        instance.htmlElement.insertAdjacentText('afterbegin', options.text);

        return instance;
    }

    /**
     * Return a Icon Button with dofus touch button icon skin
     * @param id The div id
     * @param options The options of button
     * @returns Button
     */
     public static createIconButton(wGame: any|Window, id: string, options: {icon: string, customClassName?: string}): Button {
        const instance: Button = new Button(wGame);

        instance.htmlElement = instance.wGame.document.createElement('div');
        instance.htmlElement.id = id;
        instance.htmlElement.className = `Button scaleOnPress ${options.icon}`;
        if (options.customClassName) instance.htmlElement.classList.add(options.customClassName);

        const btnIcon: HTMLDivElement = instance.wGame.document.createElement('div');
        btnIcon.className = 'btnIcon';

        instance.htmlElement.insertAdjacentElement('afterbegin', btnIcon);

        return instance;
    }

    /**
     * Add click event and call the callBack method on click.
     * (Call this method after insert element in DOM)
     * @param callBack The method to execute on click
     */
    public addEvent(callBack: any): Button {
        let onPress = () => {
            if (!this.htmlElement.classList.contains('disabled')) this.htmlElement.classList.add('pressed');
        };
        let onRelease = () => {
            if (this.htmlElement.classList.contains('pressed')) this.htmlElement.classList.remove('pressed'); 
        };
        let onClick = () => {
            if (!this.htmlElement.classList.contains('disabled')) callBack();
        };

        this.htmlElement.addEventListener('touchstart', onPress);
        this.htmlElement.addEventListener('touchend', onRelease);
        this.htmlElement.addEventListener('click', onClick);

        return this;
    }


    /**
     * Disabled button, block action on click
     */
    public disabled(): Button {
        if (!this.htmlElement.classList.contains('disabled')) this.htmlElement.classList.add('disabled');
        return this;
    }

    /**
     * Enabled button
     */
    public enabled(): Button {
        if (this.htmlElement.classList.contains('disabled')) this.htmlElement.classList.remove('disabled');
        return this;
    }

    /**
     * Change the color of button
     * @param buttonColor The color to applies
     */
    public changeButtonColor(buttonColor: ButtonColor): Button {
        for (let color in ButtonColor) {
            if (this.htmlElement.classList.contains(ButtonColor[color])) this.htmlElement.classList.replace(ButtonColor[color], buttonColor);
        }
        return this;
    }

    public setAttribute(qualifiedName: string, value: string): Button {
        super.setAttribute(qualifiedName, value);
        return this;
    }
}

export enum ButtonColor {
    'PRIMARY' = 'button',
    'SECONDARY' = 'secondaryButton',
    'SPECIAL' = 'specialButton'
}