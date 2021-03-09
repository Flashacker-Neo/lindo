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