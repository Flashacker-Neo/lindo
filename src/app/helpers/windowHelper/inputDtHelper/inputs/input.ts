import { InputDtHelper } from "../inputDt.helper";
import { Button, ButtonColor } from "./button";

export class Input {
    private wGame: any|Window;
    private inputDtHelper: InputDtHelper;

    constructor(wGame: any|Window, inputDtHelper: InputDtHelper) {
        this.wGame = wGame;
        this.inputDtHelper = inputDtHelper;
    }

    /**
     * Return a HTMLDivElement with dofus touch input text skin
     * @param id The div id
     * @param placeholder The text display before use
     * @param maxLength Max lenght of input (default 50)
     * @param searchButton Add a search button
     * @param customClass A custom className for add your css
     */
    public createTextInput(id: string, placeholder: string, maxLength?: number, searchButton?: boolean, customClassName?: string): HTMLDivElement {
        // create global container
        const searchBox: HTMLDivElement = this.wGame.document.createElement('div');
        searchBox.id = id;
        searchBox.className = 'searchBox';
        if (customClassName) searchBox.classList.add(customClassName);

        const inputFrame: HTMLDivElement = this.wGame.document.createElement('div');
        inputFrame.className = 'inputFrame';

        // create input field
        const input: HTMLInputElement = this.wGame.document.createElement('input');
        input.className = 'InputBox' ;
        input.spellcheck = false;
        input.autocapitalize = 'off';
        input.autocomplete = 'off';
        input.maxLength = maxLength ? maxLength : 50;
        input.type = 'text';
        input.placeholder = placeholder;

        // create cancel/erase button
        const cancelBtn: HTMLDivElement = this.wGame.document.createElement('div');
        cancelBtn.className = 'cancelBtn Button scaleOnPress';
        cancelBtn.style.display = 'none';
        const btnIcon: HTMLDivElement = this.wGame.document.createElement('div');
        btnIcon.className = 'btnIcon';

        // create search button
        const searchBtn: HTMLDivElement = this.inputDtHelper.Button().createIconButton(id + '-searchBtn', 'searchBtn');

        // construct final element
        cancelBtn.insertAdjacentElement('afterbegin', btnIcon);
        inputFrame.insertAdjacentElement('afterbegin', input);
        inputFrame.insertAdjacentElement('beforeend', cancelBtn);
        searchBox.insertAdjacentElement('afterbegin', inputFrame);
        if (searchButton) searchBox.insertAdjacentElement('beforeend', searchBtn);

        return searchBox;
    }

    /**
     * Return a HTMLDivElement with dofus touch input chat skin
     * @param id The div id
     * @param sendButton Add a send button
     * @param maxLength Max length of input (default 256)
     * @param color The color of text in input
     * @param customClassName A custom className for add your css
     */
    public createChatInput(id: string, sendButton?: boolean, maxLength?: number, color?: InputColor, customClassName?: string): HTMLDivElement {
        const container: HTMLDivElement = this.wGame.document.createElement('div');
        container.id = id;
        container.className = 'chat';
        if (customClassName) container.classList.add(customClassName);
        container.style.display = 'flex';
        container.style.position = 'initial';
        container.style.width = 'calc(100% - 5px)';
        container.style.height = 'auto'; // fix height from dt class

        // create input field
        const input: HTMLInputElement = this.wGame.document.createElement('input');
        input.className = 'inputChat inputBox channel0';
        if (color) input.classList.replace('channel0', color);
        input.style.marginLeft = '0px'; // fix margin from dt class
        input.spellcheck = false;
        input.autocapitalize = 'off';
        input.autocomplete = 'off';
        input.maxLength = maxLength ? maxLength : 256;
        input.type = 'text';

        // create search button
        const sendBtn: HTMLDivElement = this.wGame.document.createElement('div');
        sendBtn.className = 'sendButton greenButton Button scaleOnPress';
        const btnIconSend: HTMLDivElement = this.wGame.document.createElement('div');
        btnIconSend.className = 'btnIcon';

        sendBtn.insertAdjacentElement('afterbegin', btnIconSend);
        container.insertAdjacentElement('afterbegin', input);
        if (sendButton) container.insertAdjacentElement('beforeend', sendBtn);

        return container;
    }

    /**
     * Return a HTMLDivElement with dofus touch input number skin
     * @param id The div id
     * @param placeholder The number to display before use
     * @param maxLength Max lenght of input (default 50)
     * @param customClass A custom className for add your css
     */
    public createNumberInput(id: string, placeholder?: string, maxLength?: number, customClassName?: string): HTMLDivElement {
        const searchBox: HTMLDivElement = this.wGame.document.createElement('div');
        searchBox.id = id;
        if (customClassName) searchBox.classList.add(customClassName);

        const input: HTMLInputElement = this.wGame.document.createElement('input');
        input.className = 'NumberInputBox';
        input.placeholder = placeholder ? placeholder : '0';
        input.maxLength = maxLength ? maxLength : 14;
        input.type = 'number';

        searchBox.insertAdjacentElement('afterbegin', input);

        return searchBox;
    }

    /**
     * Add event on input and call the callBack
     * @param searchBox The input you wan't to add event
     * @param callBack The method to execute on keyUp or click on search
     */
    public addInputEvent(searchBox: HTMLDivElement, callBack: any) {
        if (searchBox.getElementsByClassName('NumberInputBox').length > 0) this.addInputNumberEvent(searchBox, callBack);
        else if (searchBox.getElementsByClassName('inputChat').length > 0) this.addInputChatEvent(searchBox, callBack);
        else this.addInputTextEvent(searchBox, callBack);
    }

    /**
     * Add event on input and call the callBack on keyup if is a number
     * @param searchBox The input you wan't to add event
     * @param callBack The method to execute on keyUp or click on search
     */
    private addInputNumberEvent(searchBox: HTMLDivElement, callBack: any) {
        const input: any = searchBox.children[0];
        let onKeyUp = () => {
            if (input.value) callBack(parseInt(input.value));
        };
        input.addEventListener('keyup', onKeyUp);
    }

    /**
     * Add event on input and call the callBack on keyup or on click on search button if option was activate in element
     * @param searchBox The input you wan't to add event
     * @param callBack The method to execute on keyUp or click on search
     */
    private addInputTextEvent(searchBox: HTMLDivElement, callBack: any) {
        const input: any = searchBox.children[0].children[0];
        const cancelBtn: any = searchBox.children[0].children[1];
        const btnIcon = cancelBtn.children[0];
        const searchBtn: any = searchBox.getElementsByClassName('searchBtn')[0];

        let onKeyUp = () => {
            cancelBtn.style.display = (input.value && input.value.length > 0) ? 'unset' : 'none';
            if (!searchBtn) callBack(input.value);
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
        if (searchBtn) this.inputDtHelper.Button().addButtonEvent(searchBtn, onClickSearch);
    }

    /**
     * Add event on input and call the callBack on key 'Enter' up or on click on search button if option was activate in element
     * @param searchBox The input you wan't to add event
     * @param callBack The method to execute on keyUp or click on search
     */
    private addInputChatEvent(searchBox: HTMLDivElement, callBack: any) {
        const input: any = searchBox.getElementsByClassName('inputChat')[0];
        const searchBtn: any = searchBox.getElementsByClassName('sendButton')[0];

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
        if (searchBtn) this.inputDtHelper.Button().addButtonEvent(searchBtn, onClickSearch);
    }

    /**
     * Get the value of the input
     * @param searchBox The input you wan't to get value
     */
    public getInputValue(searchBox: HTMLDivElement) {
        let input: any;

        if (searchBox.getElementsByClassName('NumberInputBox').length > 0) input = searchBox.getElementsByClassName('NumberInputBox')[0];
        else if (searchBox.getElementsByClassName('inputBox').length > 0) input = searchBox.getElementsByClassName('inputBox')[0];
        else if (searchBox.getElementsByClassName('inputChat').length > 0) input = searchBox.getElementsByClassName('inputChat')[0];

        return input.value;
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