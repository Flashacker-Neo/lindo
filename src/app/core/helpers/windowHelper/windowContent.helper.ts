export class WindowContentHelper {
    private wGame: any|Window;
    private static instance: WindowContentHelper;

    public static getInstance(wGame: any|Window): WindowContentHelper {
        if (!this.instance) this.instance = new WindowContentHelper(wGame);
        return this.instance;
    }

    private constructor(wGame: any|Window) {
        this.wGame = wGame;

        const windowContentCss = document.createElement('style');
        windowContentCss.id = 'windowContentCss';
        windowContentCss.innerHTML = `
            .scrollableContent {
                overflow-y: scroll;
                overflow-x: hidden;
                width: 100%;
                padding: 0 7px;
                margin-right: 0 !important;
            }
            .scrollableContent::-webkit-scrollbar {
                width: 2px;
            }
            .scrollableContent::-webkit-scrollbar-track {
                background-color: transparent;
            }
            .scrollableContent::-webkit-scrollbar-thumb,
            .scrollableContent::-webkit-scrollbar-thumb:hover {
                background: #a3d52e;
                border-radius: 2px;
            }

            .customContent {
                box-sizing: border-box;
                position: relative;
                padding: 10px 7px;
                max-height: 100%;
                display: flex;
                width: 100%;
            }
            .customContent::before {
                content: "";
                width: 100%;
                height: 100%;
                position: absolute;
                z-index: -1;
                top: 0;
                left: 0;
                border-style: solid;
                border-width: 24px;
                border-image: url(../game/assets/ui/containerBg.png) 48 fill;
                box-sizing: border-box;
            }
        `;

        this.wGame.document.querySelector('head').appendChild(windowContentCss);
    }

    /**
     * Return an HTMLDivElement with the content dt style
     * @param id The div id
     * @param customClassName A custom className for add your css 
     */
    public createContentBox(id: string, customClassName?: string): HTMLDivElement {
        const contentBox: HTMLDivElement = this.wGame.document.createElement('div');
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
    public createScrollableContent(id: string, customClassName?: string): HTMLDivElement {
        const scrollableContent: HTMLDivElement = this.wGame.document.createElement('div');
        scrollableContent.id = id;
        scrollableContent.className = 'scrollableContent';
        if (customClassName) scrollableContent.classList.add(customClassName);

        return scrollableContent;
    }
}