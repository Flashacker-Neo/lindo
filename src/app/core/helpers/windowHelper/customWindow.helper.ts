import { DraggableWindowHelper } from "./draggableWindow.helper";
import { InputDtHelper } from "./inputDtHelper/inputDt.helper";
import { WindowContentHelper } from "./windowContent.helper";

export class CustomWindowHelper {
    private static instance: CustomWindowHelper;

    private wGame: any | Window;

    public static getInstance(wGame: any|Window) {
        if (!this.instance) this.instance = new CustomWindowHelper(wGame);
        return this.instance;
    }

    private constructor(wGame) {
        this.wGame = wGame;
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
    public WindowContent(): WindowContentHelper {
        return WindowContentHelper.getInstance(this.wGame);
    }

    // Input Helper

    /**
     * Get an helper for get instance of inputs helper
     * @returns InputDtHelper
     */
    public getInputsHelper(): InputDtHelper {
        return InputDtHelper.getInstance(this.wGame);
    }
}