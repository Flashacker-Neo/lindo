import { Button } from "./inputs/button";
import { Checkbox } from "./inputs/checkbox";
import { Input } from "./inputs/input";
import { ProgressBarHelper } from "./inputs/progressBar";
import { Select } from "./inputs/select";

export class InputDtHelper {
    private wGame: any|Window;

    private button: Button;
    private checkBox: Checkbox;
    private input: Input;
    private select: Select;
    private progressBar: ProgressBarHelper;

    constructor(wGame: any|Window) {
        this.wGame = wGame;

        const inputCss = document.createElement('style');
        inputCss.id = 'inputDtCss';
        inputCss.innerHTML = `
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
        this.button = new Button(this.wGame);
        this.checkBox = new Checkbox(this.wGame);
        this.input = new Input(this.wGame, this);
        this.select = new Select(this.wGame);
        this.progressBar = new ProgressBarHelper(this.wGame);
    }

    /**
     * Get an helper to create button with dofus touch style
     * @returns Button
     */
    public Button(): Button {
        return this.button;
    }

    /**
     * Get an helper to create checkbox with dofus touch style
     * @returns Checkbox
     */
    public Checkbox(): Checkbox {
        return this.checkBox;
    }

    /**
     * Get an helper to create input with dofus touch style
     * @returns Input
     */
    public Input(): Input {
        return this.input;
    }

    /**
     * Get an helper to create select with dofus touch style
     * @returns Select
     */
    public Select(): Select {
        return this.select;
    }

    /**
     * Get an helper to create progress bar with dofus touch style
     * @returns ProgressBarHelper
     */
    public ProgressBar(): ProgressBarHelper {
        return this.progressBar;
    }
}