import { CustomDTElement } from "../customElement.abstract";
import { Button, ButtonColor } from "./button";

export class Input extends CustomDTElement<Input> {

    private searchBtn: Button;

    private constructor(wGame: any|Window) {
        super(wGame);
    }

    /**
     * Return a HTMLDivElement with dofus touch input text skin
     * @param id The div id
     * @param options The options of input
     */
    public static createTextInput(wGame: any|Window, id: string,
            options: {placeholder: string, value?: string, maxLength?: number, searchButton?: boolean, containerClassName?: string, inputClassName?: string}
        ): Input {
            const instance: Input = new Input(wGame);

            // create global container
            instance.htmlElement = instance.wGame.document.createElement('div');
            instance.htmlElement.id = id;
            instance.htmlElement.className = 'htmlElement';
            if (options.containerClassName) instance.htmlElement.classList.add(options.containerClassName);

            const inputFrame: HTMLDivElement = instance.wGame.document.createElement('div');
            inputFrame.className = 'inputFrame';

            // create input field
            const input: HTMLInputElement = instance.wGame.document.createElement('input');
            input.className = 'InputBox' ;
            if (options.inputClassName) input.classList.add(options.inputClassName);
            input.spellcheck = false;
            input.autocapitalize = 'off';
            input.autocomplete = 'off';
            input.maxLength = options.maxLength ? options.maxLength : 50;
            input.type = 'text';
            input.placeholder = options.placeholder;
            input.value = options.value ? options.value : '';

            // create cancel/erase button
            const cancelBtn: HTMLDivElement = instance.wGame.document.createElement('div');
            cancelBtn.className = 'cancelBtn Button scaleOnPress';
            cancelBtn.style.display = 'none';
            const btnIcon: HTMLDivElement = instance.wGame.document.createElement('div');
            btnIcon.className = 'btnIcon';

            // create search button
            instance.searchBtn = Button.createIconButton(wGame, id + '-searchBtn', {icon: 'searchBtn'});

            // construct final element
            cancelBtn.insertAdjacentElement('afterbegin', btnIcon);
            inputFrame.insertAdjacentElement('afterbegin', input);
            inputFrame.insertAdjacentElement('beforeend', cancelBtn);
            instance.htmlElement.insertAdjacentElement('afterbegin', inputFrame);
            if (options.searchButton) instance.htmlElement.insertAdjacentElement('beforeend', instance.searchBtn.getHtmlElement());

            return instance;
    }

    /**
     * Return a HTMLDivElement with dofus touch input chat skin
     * @param id The div id
     * @param options The option of input
     */
    public static createChatInput(wGame: any|Window, id: string, 
            options?: {sendButton?: boolean, maxLength?: number, color?: InputColor, containerClassName?: string, inputClassName?: string}
        ): Input {
            const instance: Input = new Input(wGame);
            
            instance.htmlElement = instance.wGame.document.createElement('div');
            instance.htmlElement.id = id;
            instance.htmlElement.className = 'chat';
            if (options.containerClassName) instance.htmlElement.classList.add(options.containerClassName);
            instance.htmlElement.style.display = 'flex';
            instance.htmlElement.style.position = 'initial';
            instance.htmlElement.style.width = 'calc(100% - 5px)';
            instance.htmlElement.style.height = 'auto'; // fix height from dt class

            // create input field
            const input: HTMLInputElement = instance.wGame.document.createElement('input');
            input.className = 'inputChat inputBox channel0';
            if (options.inputClassName) input.classList.add(options.inputClassName);
            if (options.color) input.classList.replace('channel0', options.color);
            input.style.marginLeft = '0px'; // fix margin from dt class
            input.spellcheck = false;
            input.autocapitalize = 'off';
            input.autocomplete = 'off';
            input.maxLength = options.maxLength ? options.maxLength : 256;
            input.type = 'text';

            // create search button
            instance.searchBtn = Button.createIconButton(wGame, id + '-searchBtn', {icon: 'sendButton', customClassName: "greenButton"});

            instance.htmlElement.insertAdjacentElement('afterbegin', input);
            if (options.sendButton) instance.htmlElement.insertAdjacentElement('beforeend', instance.searchBtn.getHtmlElement());

            return instance;
    }

    /**
     * Return a HTMLDivElement with dofus touch input number skin
     * @param id The div id
     * @param options The options of input
     */
    public static createNumberInput(
            wGame: any|Window, id: string, 
            options?: {label?: string, placeholder?: string, value?: string, maxLength?: number, step?: string, containerClassName?: string, inputClassName?: string}
        ): Input {
            const instance: Input = new Input(wGame);

            instance.htmlElement = instance.wGame.document.createElement('div');
            instance.htmlElement.id = id;
            if (options.label && options.label.length > 0) instance.htmlElement.insertAdjacentText('afterbegin', options.label);
            if (options.containerClassName) instance.htmlElement.classList.add(options.containerClassName);

            const input: HTMLInputElement = instance.wGame.document.createElement('input');
            input.className = 'NumberInputBox customNumber';
            if (options.inputClassName) input.classList.add(options.inputClassName);
            input.value = options.value ? options.value : '0';
            input.placeholder = options.placeholder ? options.placeholder : '';
            input.maxLength = options.maxLength ? options.maxLength : 14;
            input.step = options.step ? options.step : '0.1';
            input.type = 'number';

            instance.htmlElement.insertAdjacentElement('beforeend', input);

            return instance;
    }

    /**
     * Add event on input and call the callBack
     * @param callBack The method to execute on keyUp or click on search
     */
    public addEvent(callBack: any) {
        if (this.htmlElement.getElementsByClassName('NumberInputBox').length > 0) this.addInputNumberEvent(callBack);
        else if (this.htmlElement.getElementsByClassName('inputChat').length > 0) this.addInputChatEvent(callBack);
        else this.addInputTextEvent(callBack);
    }

    /**
     * Add event on input and call the callBack on keyup if is a number
     * @param callBack The method to execute on keyUp or click on search
     */
    private addInputNumberEvent(callBack: any) {
        const input: any = this.htmlElement.children[0];
        let onKeyUp = () => {
            if (input.value) callBack(parseFloat(input.value));
        };
        input.addEventListener('keyup', onKeyUp);
    }

    /**
     * Add event on input and call the callBack on keyup or on click on search button if option was activate in element
     * @param callBack The method to execute on keyUp or click on search
     */
    private addInputTextEvent(callBack: any) {
        const input: any = this.htmlElement.children[0].children[0];
        const cancelBtn: any = this.htmlElement.children[0].children[1];
        const btnIcon = cancelBtn.children[0];

        let onKeyUp = () => {
            cancelBtn.style.display = (input.value && input.value.length > 0) ? 'unset' : 'none';
            if (!this.searchBtn) callBack(input.value);
        };
        let onClickCancel = () => {
            cancelBtn.style.display = 'none';
            input.value = '';
            callBack(input.value);
        }
        let onClickSearch = () => callBack(input.value);

        input.addEventListener('keyup', onKeyUp);
        btnIcon.addEventListener('click', onClickCancel);

        // return callBack when search button press
        if (this.searchBtn) this.searchBtn.addEvent(onClickSearch);
    }

    /**
     * Add event on input and call the callBack on key 'Enter' up or on click on search button if option was activate in element
     * @param callBack The method to execute on keyUp or click on search
     */
    private addInputChatEvent(callBack: any) {
        const input: any = this.htmlElement.getElementsByClassName('inputChat')[0];

        let onKeyUp = (event) => {
            // fire callback if 'enter' key up
            if (event.keyCode === 13) {
                callBack(input.value);
                input.value = '';
            }
        };
        let onClickSearch = () => {
            callBack(input.value);
            input.value = '';
        }

        input.addEventListener('keyup', onKeyUp);
        if (this.searchBtn) this.searchBtn.addEvent(onClickSearch);
    }

    /**
     * Get the value of the input
     * @param htmlElement The input you wan't to get value
     */
    public getInputValue() {
        let input: any;

        if (this.htmlElement.getElementsByClassName('NumberInputBox').length > 0) input = this.htmlElement.getElementsByClassName('NumberInputBox')[0];
        else if (this.htmlElement.getElementsByClassName('inputBox').length > 0) input = this.htmlElement.getElementsByClassName('inputBox')[0];
        else if (this.htmlElement.getElementsByClassName('inputChat').length > 0) input = this.htmlElement.getElementsByClassName('inputChat')[0];

        return input.value;
    }

    public setAttribute(qualifiedName: string, value: string): Input {
        super.setAttribute(qualifiedName, value);
        return this;
    }
}

export enum InputColor {
    WHITE = 'channel0',
    TURQUOISE = 'channel1',
    PURPLE = 'channel2',
    YELLOW = 'channel3',
    BLUE = 'channel4',
    BROWN = 'channel5',
    EMERAUD = 'channel6',
    ORANGE = 'channel7',
    PINK = 'channel8',
    CYAN = 'channel9',
    GREEN = 'channel10',
    CYAN2 = 'channel12',
}