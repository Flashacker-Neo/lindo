import { List } from "./components/list";

export class ComponentDtHelper {
    private wGame: any|Window;

    private list: List;

    constructor(wGame: any|Window) {
        this.wGame = wGame;

        if (!this.wGame.document.getElementById('componentDtCss')) {
            const componentCss = document.createElement('style');
            componentCss.id = 'componentDtCss';
            componentCss.innerHTML = `
            .menu {
                width: 100%;
            }
            .menu .listItem.selected {
                border-image: url(./assets/ui/table/tableHighlight.png) 0 fill / 1 / 0 stretch;
            }
            .menu .listItem {
                box-sizing: border-box;
                width: 100%;
                height: 40px;
                padding: 11px;
                border-width: 1px;
                border-style: solid;
                border-color: transparent;
            }
            .menu .listItem.odd {
                background-color: rgb(43, 44, 39);
            }
            `;

            this.wGame.document.querySelector('head').appendChild(componentCss);
        }

        this.list = new List(this.wGame);
    }

    /**
     * Get an helper to create button with dofus touch style
     * @returns Button
     */
    public get List(): List {
        return this.list;
    }

}