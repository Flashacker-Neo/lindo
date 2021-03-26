export class DraggableWindowHelper {
    public wGame: any|Window;
    private newDragPosX = 0;
    private newDragPosY = 0;
    private currentDragPosX = 0;
    private currentDragPosY = 0;
    private resizePosX = 0;
    private resizePosY = 0;
    private isCustomElmnt: boolean = false;

    private window: HTMLDivElement;
    private windowTitle;
    private windowBody;
    private closeButton;

    constructor(wGame: any|Window) {
        this.wGame = wGame;
    }

    /**
     * Use custom html div element
     * @param elmnt The window element
     */
    public createCustomWindow(elmnt: HTMLDivElement): DraggableWindowHelper {
        this.isCustomElmnt = true;
        this.window = elmnt;
        return this;
    }

    /**
     * Create a basic window with dofus style but without define size.
     * Auto insert in DOM (windowsContainer)
     * @param title Title will show to user
     * @param id The id of that window
     */
    public createDofusWindow(title: string, id: string): DraggableWindowHelper {
        this.window = this.wGame.document.createElement('div');
        this.window.className = "window";
        this.window.id = id;

        const content = `<div class="windowBorder"></div>
            <div class="windowContent">
                <div class="windowHeadWrapper">
                    <div class="windowTitle">${title}</div>
                    <div class="closeButton Button scaleOnPress"></div>
                </div>
                <div class="windowBodyWrapper">
                    <div class="windowBody"></div>
                </div>
            </div>`;

        this.window.insertAdjacentHTML("afterbegin", content);
        this.wGame.document.getElementsByClassName("windowsContainer")[0].appendChild(this.window);

        this.closeButton = this.window.children[1].children[0].children[1];
        this.windowTitle = this.window.children[1].children[0].children[0];
        this.windowBody = this.window.children[1].children[1].children[0];

        this.closeButton.addEventListener('click', () => this.window.style.visibility = "hidden");

        return this;
    }

    /**
     * Add content to the dofus window
     * @param content Content to add
     */
    public addContent(content: HTMLElement): DraggableWindowHelper {
        if (!this.isCustomElmnt) this.windowBody.appendChild(content);
        else console.error('Can\'t add content on custom window');
        
        return this;
    }

    /**
     * Add a button to the right of the header
     * @param button The div button to add
     */
    public addButtonToRightToHeader(button: HTMLDivElement): DraggableWindowHelper {
        this.windowTitle.insertAdjacentElement('afterend', button);
        return this;
    }

    /**
     * Add a button to the left of the header
     * @param button The div button to add
     */
    public addButtonToLeftToHeader(button: HTMLDivElement): DraggableWindowHelper {
        this.windowTitle.insertAdjacentElement('beforebegin', button);
        return this;
    }

    /**
     * Make the window draggable
     * @param draggableAnchor Use if is custom window
     */
    public makeDraggable(draggableAnchor?: HTMLElement): DraggableWindowHelper {
        const container: any = this.wGame.document.getElementsByClassName('gameGuiContainer')[0];

        let dragMouseDown = (event: TouchEvent) => {
            const e = event.touches[0];
            this.currentDragPosX = e.clientX;
            this.currentDragPosY = e.clientY;

            this.wGame.document.addEventListener('touchend', closeDragElement);
            this.wGame.document.addEventListener('touchmove', elementDrag);
        };

        let elementDrag = (event: TouchEvent) => {
            const e = event.touches[0];
            // calculate the new cursor position
            this.newDragPosX = this.currentDragPosX - e.clientX;
            this.newDragPosY = this.currentDragPosY - e.clientY;
            this.currentDragPosX = e.clientX;
            this.currentDragPosY = e.clientY;

            // check if window is in the container and set new X pos
            if (this.window.offsetLeft < 0) this.window.style.left = '0px';
            else if (this.window.offsetLeft + this.window.offsetWidth > container.offsetWidth) this.window.style.left = container.offsetWidth - this.window.offsetWidth + 'px';
            else this.window.style.left = (this.window.offsetLeft - this.newDragPosX) + "px";
            
            // check if window is in the container and set new Y pos
            if (this.window.offsetTop < 0) this.window.style.top = '0px';
            else if (this.window.offsetTop + this.window.offsetHeight > container.offsetHeight) this.window.style.top = container.offsetHeight - this.window.offsetHeight + 'px';
            else this.window.style.top = (this.window.offsetTop - this.newDragPosY) + "px";
        };

        let closeDragElement = () => {
            this.wGame.document.removeEventListener('touchend', closeDragElement);
            this.wGame.document.removeEventListener('touchmove', elementDrag);
        };

        if (this.isCustomElmnt) {
            if (draggableAnchor) draggableAnchor.addEventListener('touchstart', dragMouseDown);
            else console.error('You must specify an HTMLElement for make draggable a custom window');
        } else {
            this.windowTitle.addEventListener('touchstart', dragMouseDown);
        }

        return this;
    }

    /**
     * Make the window abble to resize
     * @param resizeAnchor Use if is a custom window
     */
    public makeResizable(resizeAnchor?: HTMLElement): DraggableWindowHelper {
        let resizeHandle: HTMLElement;

        if (!this.isCustomElmnt) {
            resizeHandle = this.wGame.document.createElement('div');
            resizeHandle.className = 'resizeHandle';
            this.window.insertAdjacentElement("beforeend", resizeHandle);
        }

        let resizeMouseDown = (event: TouchEvent) => {
            const e = event.touches[0];
            this.resizePosX = e.clientX;
            this.resizePosY = e.clientY;

            this.wGame.document.addEventListener('touchend', closeResizeElement);
            this.wGame.document.addEventListener('touchmove', elementResize);
        };

        let elementResize = (event: TouchEvent) => {
            const e = event.touches[0];
            this.resizePosX = e.clientX;
            this.resizePosY = e.clientY;

            this.window.style.width = (this.resizePosX - this.window.offsetLeft) + "px";
            this.window.style.height = (this.resizePosY - this.window.offsetTop) + "px";
        };

        let closeResizeElement = () => {
            this.wGame.document.removeEventListener('touchend', closeResizeElement);
            this.wGame.document.removeEventListener('touchmove', elementResize);
        };

        if (this.isCustomElmnt && resizeAnchor) {
            if (resizeAnchor) {
                resizeAnchor.addEventListener('touchstart', resizeMouseDown);
                resizeAnchor.style.position = 'absolute';
                resizeAnchor.style.bottom = '0';
                resizeAnchor.style.right = '0';
            } else {
                console.error('You must specify an HTMLElement for make resizable a custom window');
            }
        } else {
            resizeHandle.addEventListener('touchstart', resizeMouseDown);
        }

        return this;
    }

    public show() {
        this.window.style.visibility = "visible";
    }

    public hide() {
        this.window.style.visibility = 'hidden';
    }

    public isVisible(): boolean {
        return this.window.style.visibility === 'visible';
    }

    public getHtmlElement(): HTMLDivElement {
        return this.window;
    }

    public destroy() {
        this.window.remove();
    }
}