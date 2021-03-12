import { Button } from "./inputs/button";
import { Checkbox } from "./inputs/checkbox";
import { Input } from "./inputs/input";
import { Select } from "./inputs/select";

export class InputDtHelper {
    private wGame: any|Window;
    private static instance: InputDtHelper;

    public static getInstance(wGame: any|Window): InputDtHelper {
        if (!this.instance) this.instance = new InputDtHelper(wGame);
        return this.instance;
    }

    private constructor(wGame: any|Window) {
        this.wGame = wGame;

        const inputCss = document.createElement('style');
        inputCss.id = 'inputDtCss';
        inputCss.innerHTML = `
            // custom Scroll
            .customScrollerContent {
                overflow-y: scroll;
                margin-right: 0 !important;
            }
            .customScrollerContent::-webkit-scrollbar {
                width: 2px;
            }
            .customScrollerContent::-webkit-scrollbar-track {
                background-color: black;
            }
            .customScrollerContent::-webkit-scrollbar-thumb,
            .customScrollerContent::-webkit-scrollbar-thumb:hover {
                background: #a3d52e;
                border-radius: 2px;
            }
            // Custom input
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
            }
        `;

        this.wGame.document.querySelector('head').appendChild(inputCss);
    }

    public getButtonHelper(): Button {
        return Button.getInstance(this.wGame);
    }

    public getCheckboxHelper(): Checkbox {
        return Checkbox.getInstance(this.wGame);
    }

    public getInputHelper(): Input {
        return Input.getInstance(this.wGame);
    }

    public getSelectHelper(): Select {
        return Select.getInstance(this.wGame);
    }
}