import { CustomDTElement } from "../customElement.abstract";

export class List extends CustomDTElement<List> {

    private constructor(wGame: any|Window) {
        super(wGame);
    }

    /**
     * Return an HTMLDivElement with dofus touch list skin
     * @param id The div id
     * @param choices Array of choices in list
     * @param customClassName A custom className for add your css
     */
    public static create(wGame: any|Window, id: string, choices: Array<{id: string, text: string}>, customClassName?: string): List {
        const instance: List = new List(wGame);

        // Create container
        instance.htmlElement = wGame.document.createElement('div');
        instance.htmlElement.id = id;
        instance.htmlElement.className = 'menu';
        if (customClassName) instance.htmlElement.classList.add(customClassName);

        const scrollableContent = wGame.document.createElement('div');
        scrollableContent.className = 'scrollableContent customScrollerContent';

        // Create item for each choice
        choices.forEach((choice, i) => {
            const item = wGame.document.createElement('div');
            item.className = 'listItem';
            if (i == 0) item.classList.add('selected');
            if (i%2 != 0) item.classList.add('odd');
            item.dataset.id = choice.id;
            item.textContent = choice.text;

            scrollableContent.insertAdjacentElement('beforeend', item);
        })

        instance.htmlElement.insertAdjacentElement('afterbegin', scrollableContent);

        return instance;
    }

    /**
     * Add event on item in list, return the item id and text
     * @param callBack The method to execute on list item click
     */
    public addEvent(callBack: any) {
        const scrollableContent = this.htmlElement.children[0];

        let onClick = (element: any) => {
            const selectedItem = scrollableContent.getElementsByClassName('selected')[0];
            if (selectedItem.classList.contains('selected')) selectedItem.classList.remove('selected');
            element = element.target;
            element.classList.add('selected');

            callBack({id: element.dataset.id, text: element.textContent});
        };

        // Add click event on each item
        Array.from(scrollableContent.getElementsByClassName('listItem')).forEach(item => {
            if (item == undefined) return;
            item.addEventListener('click', onClick);
        });
    }

    public setAttribute(qualifiedName: string, value: string): List {
        super.setAttribute(qualifiedName, value);
        return this;
    }
}