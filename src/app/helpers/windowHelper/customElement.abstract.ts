

export abstract class CustomDTElement<T> {

    protected wGame: any|Window;
    protected htmlElement: HTMLDivElement;

    protected constructor(wgame: any|Window) {
        this.wGame = wgame;
    }
    

    protected addEvent(callback: Function): void {
        return;
    }

    protected setAttribute(qualifiedName: string, value: string): T {
        this.htmlElement.setAttribute(qualifiedName, value);
        return;
    }

    /**
     * Remove completely the element from the DOM
     */
    public remove(): void {
        this.htmlElement.remove();
    }

    /**
     * Use to get the HTMLElement
     * @returns The HTMLDivElement
     */
    public getHtmlElement(): HTMLDivElement {
        return this.htmlElement;
    }
}