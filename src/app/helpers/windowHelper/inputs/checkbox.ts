import { CustomDTElement } from "../customElement.abstract";

export class Checkbox extends CustomDTElement<Checkbox> {

    private constructor(wGame: any|Window) {
        super(wGame);
    }

    /**
     * Return an CheckBox with dofus touch checkbox skin
     * @param id The div id
     * @param options The option of checkBox
     */
    public static create(wGame: any|Window, id: string, options: {text: string, isCheck?: boolean, customClass?: string}): Checkbox {
        const instance: Checkbox = new Checkbox(wGame);

        instance.htmlElement = instance.wGame.document.createElement('div');
        instance.htmlElement.id = id;
        instance.htmlElement.className = 'CheckboxLabel';
        if (options.isCheck) instance.htmlElement.classList.add('on');
        if (options.customClass) instance.htmlElement.classList.add(options.customClass);
        instance.htmlElement.insertAdjacentText('afterbegin', options.text);

        return instance;
    }

    /**
     * Add click event and call the callBack method on click
     * (Call this method after insert element in DOM)
     * @param callBack The method to execute on click (Add parameters to know if is check)
     */
    public addEvent(callBack: any): Checkbox {
        let onClick = () => {
            if (!this.htmlElement.classList.contains('disabled')) {

                if (this.htmlElement.classList.contains('on')) this.htmlElement.classList.remove('on');
                else this.htmlElement.classList.add('on');

                callBack(this.htmlElement.classList.contains('on'));
            }
        };

        this.htmlElement.addEventListener('click', onClick);

        return this;
    }

    /**
     * Disabled checkbox, block action on click
     */
    public disabled(): Checkbox {
        if (!this.htmlElement.classList.contains('disabled')) this.htmlElement.classList.add('disabled');
        return this;
    }

    /**
     * Enabled checkbox
     */
    public enabled(): Checkbox {
        if (this.htmlElement.classList.contains('disabled')) this.htmlElement.classList.remove('disabled');
        return this;
    }

    /**
     * Check the box
     */
    public check(): Checkbox {
        if (!this.htmlElement.classList.contains('on')) this.htmlElement.classList.add('on');
        return this;
    }

    /**
     * Uncheck the box
     */
    public uncheck(): Checkbox {
        if (this.htmlElement.classList.contains('on')) this.htmlElement.classList.remove('on');
        return this;
    }

    /**
     * Get if the checkbox is check
     */
    public getIfIsCheck(): boolean {
        return this.htmlElement.classList.contains('on');
    }
    
    public setAttribute(qualifiedName: string, value: string): Checkbox {
        super.setAttribute(qualifiedName, value);
        return this;
    }
}
