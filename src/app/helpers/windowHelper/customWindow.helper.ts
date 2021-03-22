import { DraggableWindowHelper } from "./draggableWindow.helper";
import { InputDtHelper } from "./inputDtHelper/inputDt.helper";
import { WindowContentHelper } from "./windowContent.helper";

export class CustomWindowHelper {
    private wGame: any | Window;
    private windowsContent: WindowContentHelper;
    private inputsHelper: InputDtHelper;

    constructor(wGame) {
        this.wGame = wGame;
        this.windowsContent = new WindowContentHelper(this.wGame);
        this.inputsHelper = new InputDtHelper(this.wGame);
    }

    // Windows Helper

    /**
     * Get an instance of this to create one window in game
     * @returns DraggableWindowHelper
     */
    public getWindow(): DraggableWindowHelper {
        return new DraggableWindowHelper(this.wGame);
    }

    /**
     * Get an helper for create content container to insert in your custom window
     * @returns WindowContentHelper
     */
    public get WindowContent(): WindowContentHelper {
        return this.windowsContent;
    }

    // Input Helper

    /**
     * Get an helper for get instance of inputs helper
     * @returns InputDtHelper
     */
    public get getInputsHelper(): InputDtHelper {
        return new InputDtHelper(this.wGame);
    }
}