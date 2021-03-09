import { Button } from "./button";

export class Input {
    private wGame: any|Window;
    private static instance: Input;

    public static getInstance(wGame: any|Window): Input {
        if (!this.instance) this.instance = new Input(wGame);
        return this.instance;
    }

    private constructor(wGame: any|Window) {
        this.wGame = wGame;

        let inputDtCss = document.createElement('style');
        inputDtCss.id = 'inputDtCss';
        inputDtCss.innerHTML = `
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
            }
        `;

        this.wGame.document.querySelector('head').appendChild(inputDtCss);
    }

    /**
     * Return a HTMLDivElement with dofus touch input skin
     * @param id The div id
     * @param placeholder The text display before use
     * @param type The type of input (text/number)
     * @param maxLenght Max lenght of input (default 50)
     * @param searchButton Add a search button
     * @param customClass A custom className for add your css
     */
    public createInput(id: string, placeholder: string, type: InputType, maxLenght?: number, searchButton?: boolean, customClassName?: string): HTMLDivElement {
        let result: HTMLDivElement;

        if (type == InputType.TEXT) result = this.createTextInput(id, placeholder, maxLenght, searchButton, customClassName);
        else result = this.createNumberInput(id, placeholder, maxLenght, customClassName);

        return result;
    }

    /**
     * Return a HTMLDivElement with dofus touch input text skin
     * @param id The div id
     * @param placeholder The text display before use
     * @param maxLenght Max lenght of input (default 50)
     * @param searchButton Add a search button
     * @param customClass A custom className for add your css
     */
    private createTextInput(id: string, placeholder: string, maxLenght?: number, searchButton?: boolean, customClassName?: string): HTMLDivElement {
        // create global container
        const searchBox: HTMLDivElement = this.wGame.document.createElement('div');
        searchBox.id = id;
        searchBox.className = 'searchBox';
        if (customClassName) searchBox.classList.add(customClassName);
        if (searchButton) searchBox.classList.add('withSearchBtn');

        const inputFrame: HTMLDivElement = this.wGame.document.createElement('div');
        inputFrame.className = 'inputFrame';

        // create input field
        const input: HTMLInputElement = this.wGame.document.createElement('input');
        input.className = 'InputBox' ;
        input.spellcheck = false;
        input.autocapitalize = 'off';
        input.autocomplete = 'off';
        input.maxLength = maxLenght ? maxLenght : 50;
        input.type = 'text';
        input.placeholder = placeholder;

        // create cancel/erase button
        const cancelBtn: HTMLDivElement = this.wGame.document.createElement('div');
        cancelBtn.className = 'cancelBtn Button scaleOnPress';
        cancelBtn.style.display = 'none';
        const btnIcon: HTMLDivElement = this.wGame.document.createElement('div');
        btnIcon.className = 'btnIcon';

        // create search button
        const searchBtn: HTMLDivElement = this.wGame.document.createElement('div');
        searchBtn.className = 'searchBtn Button scaleOnPress';
        const btnIconSearch: HTMLDivElement = this.wGame.document.createElement('div');
        btnIconSearch.className = 'btnIcon';

        // construct final element
        searchBtn.insertAdjacentElement('afterbegin', btnIconSearch);
        cancelBtn.insertAdjacentElement('afterbegin', btnIcon);
        inputFrame.insertAdjacentElement('afterbegin', input);
        inputFrame.insertAdjacentElement('beforeend', cancelBtn);
        searchBox.insertAdjacentElement('afterbegin', inputFrame);
        if (searchButton) searchBox.insertAdjacentElement('beforeend', searchBtn);

        return searchBox;
    }

    /**
     * Return a HTMLDivElement with dofus touch input number skin
     * @param id The div id
     * @param placeholder The number to display before use
     * @param maxLenght Max lenght of input (default 50)
     * @param customClass A custom className for add your css
     */
    private createNumberInput(id: string, placeholder?: string, maxLenght?: number, customClassName?: string): HTMLDivElement {
        const searchBox: HTMLDivElement = this.wGame.document.createElement('div');
        searchBox.id = id;
        if (customClassName) searchBox.classList.add(customClassName);

        const input: HTMLInputElement = this.wGame.document.createElement('input');
        input.className = 'NumberInputBox';
        input.placeholder = placeholder ? placeholder : '0';
        input.maxLength = maxLenght ? maxLenght : 14;
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

        let onKeyUp = () => {
            cancelBtn.style.display = (input.value && input.value.length > 0) ? 'unset' : 'none';
            if (!searchBox.classList.contains('withSearchBtn')) callBack(input.value);
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
        if (searchBox.classList.contains('withSearchBtn')) {
            const searchBtn: any = searchBox.getElementsByClassName('searchBtn')[0];
            Button.getInstance(this.wGame).addButtonEvent(searchBtn, onClickSearch);
        }
    }

    /**
     * Get the value of the input
     * @param searchBox The input you wan't to get value
     */
    public getInputValue(searchBox: HTMLDivElement) {
        const input: any = searchBox.children[0].children[0];
        return input.value;
    }
}

export enum InputType {
    TEXT, NUMBER
}