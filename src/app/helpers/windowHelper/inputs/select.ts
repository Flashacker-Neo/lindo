import { CustomDTElement } from "../customElement.abstract"

export class Select extends CustomDTElement<Select> {
    private dropDown;
    private entryContainer: HTMLDivElement;
    //private elements: Array<{htmlElmnt: HTMLDivElement, callBack: any}> = [];

    // TODO Is now an object so we can save const in the object, like entryContainer, etc...

    private constructor(wGame: any|Window) {
        super(wGame);
        this.dropDown = this.wGame.document.getElementsByClassName('dropDown')[0];
    }

    /**
     * Return an HTMLDivElement with dofus touch select skin
     * @param id The div id
     * @param choices Array of choices in select list
     * @param customClassName A custom className for add your css
     */
    public static create(wGame: any|Window, id: string, choices: Array<{id: string, text: string, textInSelect?: string, ticked?: boolean}>, customClassName?: string
        ): Select {
            const instance: Select = new Select(wGame);

            // Create container of select
            instance.htmlElement = instance.wGame.document.createElement('div');
            instance.htmlElement.id = id;
            instance.htmlElement.className = 'Selector';
            if (customClassName) instance.htmlElement.classList.add(customClassName);

            // Child of container for display select element
            const selectorContent: HTMLDivElement = instance.wGame.document.createElement('div');
            selectorContent.className = 'selectorContent Button';
            let choice = choices.filter(choice => choice?.ticked == true)[0];
            choice = choice ? choice : choices[0];
            selectorContent.textContent = choice.textInSelect ? choice.textInSelect : choice.text;

            // Button for activate drop down
            const openBtn: HTMLDivElement = instance.wGame.document.createElement('div');
            openBtn.className = 'buttonOpen';

            instance.htmlElement.insertAdjacentElement('afterbegin', openBtn);
            instance.htmlElement.insertAdjacentElement('afterbegin', selectorContent);

            // Create EntryList for choices
            instance.createEntryList(id, choices);

            return instance;
    }

    /**
     * Private method for create list of choice in select
     * @param id The select div id
     * @param choices Array of choices in select list
     */
    private createEntryList(id: string, choices?: Array<{id: string, text: string, textInSelect?: string, ticked?: boolean}>) {
        // Container for all element
        this.entryContainer = this.wGame.document.createElement('div');
        this.entryContainer.className = 'entryContainer';
        this.entryContainer.id = id + '-entryContainer';
        this.entryContainer.style.display = 'none';

        const entryList: HTMLDivElement = this.wGame.document.createElement('div');
        entryList.className = 'entryList Scroller';

        const scrollerContent: HTMLDivElement = this.wGame.document.createElement('div');
        scrollerContent.className = 'scrollerContent customScrollerContent';

        // Create element
        choices.forEach((choice) => {
            const elmnt: HTMLDivElement = this.wGame.document.createElement('div');
            elmnt.className = 'dropDownEntry Button scaleOnPress';
            if (choice.ticked) elmnt.classList.add('ticked');
            elmnt.textContent = choice.text;
            elmnt.dataset.id = choice.id;
            elmnt.dataset.textInSelect = choice.textInSelect;

            scrollerContent.insertAdjacentElement('beforeend', elmnt);
        });

        entryList.insertAdjacentElement('afterbegin', scrollerContent);
        this.entryContainer.insertAdjacentElement('afterbegin', entryList);
        this.dropDown.insertAdjacentElement('beforeend', this.entryContainer);
    }

    /**
     * Add event in select input, return selected option
     * @param callBack The method to execute on select choice
     */
    public addEvent(callBack: any) {
        const selectorContent = this.htmlElement.getElementsByClassName('selectorContent')[0];
        const dtEntryContainer = this.dropDown.getElementsByClassName('entryContainer')[0];

        // Event for style of select
        let onPress = () => {
            selectorContent.classList.add('pressed');
            setTimeout(() => {selectorContent.classList.remove('pressed')}, 1000);
        };
        let onRelease = () => selectorContent.classList.remove('pressed');

        // Event for display choice of select
        let onClick = () => {
            const scrollerContent: any = this.entryContainer.getElementsByClassName('customScrollerContent')[0];
            const selectBounding = this.htmlElement.getBoundingClientRect();
            const clientHeight = this.wGame.document.body.clientHeight;

            // Set manually visibility of DtDropDown & remove visibility of DtEntryContainer
            this.dropDown.style.display = '';
            this.dropDown.style.opacity = '1';
            dtEntryContainer.style.display = 'none';

            // Display custom select
            this.entryContainer.style.display = '';
            this.entryContainer.style.left = selectBounding.left + 'px';
            this.entryContainer.style.width = selectBounding.width - 34 + 'px';
            // Reset position
            this.entryContainer.style.bottom = '';
            this.entryContainer.style.top = '';

            let scrollerMaxHeight = clientHeight - selectBounding.bottom - 17;
            let entryContainerHeight = this.entryContainer.getBoundingClientRect().height;

            if (entryContainerHeight < scrollerMaxHeight || scrollerMaxHeight > clientHeight*0.4) {
                // Display entry container on bottom of select
                this.entryContainer.style.top = selectBounding.bottom + 1 + 'px';
            } else {
                // Display entry container on top of select
                this.entryContainer.style.bottom = clientHeight - selectBounding.top + 1 + 'px';
                scrollerMaxHeight = clientHeight - (clientHeight - selectBounding.top + 17);
            }
            // Define max height of scroller
            scrollerContent.style.maxHeight = scrollerMaxHeight + 'px';
        };

        // Add event on select
        selectorContent.addEventListener('touchstart', onPress);
        selectorContent.addEventListener('touchend', onRelease);
        selectorContent.addEventListener('click', onClick);

        this.addEntryListEvent(this.entryContainer, selectorContent, callBack);
    }

    /**
     * Private method for add event on each choice of target select input
     * @param entryContainer The entry container of select input
     * @param selectorContent The div of selected content display
     * @param callBack The method to execute when click on choice
     */
    private addEntryListEvent(entryContainer, selectorContent, callBack) {
        const dtEntryContainer = this.dropDown.getElementsByClassName('entryContainer')[0];
        const dropDownOverlay = this.dropDown.getElementsByClassName('dropDrownOverlay')[0];

        // Hide dropdown when click outside of it
        let hideDropDown = () => {
            this.dropDown.style.display = 'none';
            this.dropDown.style.opacity = '';
            dtEntryContainer.style.display = '';

            entryContainer.style.display = 'none';
        };

        // Event for style of choice
        let onPressChoice = (element) => {
            element.classList.add('pressed');
            setTimeout(() => {element.classList.remove('pressed')}, 1000);
        };
        let onReleaseChoice = (element) => element.classList.remove('pressed');
        // Event for action on choice
        let onClickChoice = (element) => {
            selectorContent.textContent = element.dataset.textInSelect != 'undefined' ? element.dataset.textInSelect : element.textContent;

            const tickedEntry = entryContainer.getElementsByClassName('ticked')[0];
            if (tickedEntry.classList.contains('ticked')) tickedEntry.classList.remove('ticked');
            element.classList.add('ticked');

            hideDropDown();
            callBack({id: element.dataset.id, text: element.textContent});
        }

        // Add Event on all choice in select
        for(const choice of entryContainer.getElementsByClassName('dropDownEntry')) {
            if (choice == undefined) return;
            choice.addEventListener('touchstart', () => {onPressChoice(choice)} );
            choice.addEventListener('touchend', () => {onReleaseChoice(choice)} );
            choice.addEventListener('click', () => {onClickChoice(choice)} );
        };

        dropDownOverlay.addEventListener('click', hideDropDown);
    }


    public setAttribute(qualifiedName: string, value: string): Select {
        super.setAttribute(qualifiedName, value);
        return this;
    }

    /**
     * Use this for remove all the select element (DropDown and input)
     */
    public remove() {
        try {
            this.entryContainer.remove();
            super.remove();
        } catch (ex) {
            console.error(ex);
        }
    }
}