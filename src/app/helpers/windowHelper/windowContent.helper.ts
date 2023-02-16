export class WindowContentHelper {

    private constructor() {}

    /**
     * Return an HTMLDivElement with the content dt style
     * @param id The div id
     * @param customClassName A custom className for add your css 
     */
    public static createContentBox(wGame: any|Window, id: string, customClassName?: string): HTMLDivElement {
        const contentBox: HTMLDivElement = wGame.document.createElement('div');
        contentBox.id = id;
        contentBox.className = 'customContent';
        if (customClassName) contentBox.classList.add(customClassName);

        return contentBox;
    }

    /**
     * Return an HTMLDivElement with content scrollable.
     * (Can be insert in contentBox)
     * @param id The div id
     * @param customClassName A custom className for add your css
     */
    public static createScrollableContent(wGame: any|Window, id: string, customClassName?: string): HTMLDivElement {
        const scrollableContent: HTMLDivElement = wGame.document.createElement('div');
        scrollableContent.id = id;
        scrollableContent.className = 'scrollableContent';
        if (customClassName) scrollableContent.classList.add(customClassName);

        return scrollableContent;
    }
}