import { Mod } from "../mod";
import { WindowAutoHarvest } from "./windowAutoHarvest";

export class AutoHarvest extends Mod {
    private canLog: boolean = false;
    private actorId: number;

    private statedElements: any[];
    private waitingInteractives: Array<InteractiveElement> = new Array();
    private usedInteractive: InteractiveElement;
    private skillsToUse: number[] = [];

    private delayedUseInteractive: ReturnType<typeof setTimeout>;
    private isInHarvest: {status: boolean, elemId: number} = {status: false, elemId: 0};
    private maxWeightInPercent: number = 95;
    private weightLimitReached: boolean = false;
    private isLoading: boolean = false;
    private changeMap: boolean = false;

    public minTime: number = 1;
    public maxTime: number = 2;

    private autoHarvestWindow: WindowAutoHarvest;

    startMod(): void {
        this.params = this.settings.option.vip.general;

        this.autoHarvestWindow = WindowAutoHarvest.getInstance(this.wGame, this.params, this);

        this.wGame.debugAutoHarvest = (isActivated: boolean) => {
            this.canLog = isActivated;
            console.log(`Debug AutoHarvest session ${(isActivated) ? 'start' : 'end'}`);
        }
    }

    /**
     * This function is use for load interactives and statedElements from client data.
     * Transform client data for use with websocket function
     */
     private loadInteractiveListFromLocalData() {
        const interactives: any = this.wGame.isoEngine.mapRenderer.interactiveElements;
        const interactiveElements: Array<any> = [];
        const statedElements: Array<any> = [];

        // Transform local data to match with data receive by websocket
        for (let i in interactives) { interactiveElements.push(interactives[i]); }
        this.wGame.isoEngine.mapRenderer.statedElements.forEach((s) => statedElements.push({elementId: s.id, elementCellId: s._position}));

        this.loadInteractiveList(interactiveElements, statedElements).then(() => this.useInterative());
    }

    /**
     * Reset data and load new interactives
     * @param interactiveElements Interactives received by websocket
     * @param statedElements StatedElements received by websocket
     */
    private async loadInteractiveList(interactiveElements: any, statedElements: any) {
        this.isLoading = true;
        this.statedElements = statedElements;

        this.clear();
        interactiveElements.forEach(async (interactiveElement) => {
            await this.addInteractiveToWaitingList(interactiveElement);
        });

        if (this.waitingInteractives.length > 1) await this.sortByEstimateDistance();
        this.isLoading = false;
    }
    
    /**
     * Create and add interactive to waiting list
     * @param interactiveElement Interactive to add
     */
     private async addInteractiveToWaitingList(interactiveElement: any) {

        if ((interactiveElement.enabledSkills != null && interactiveElement.enabledSkills.length > 0)
            && (!this.waitingInteractives.find(a => a.elementId == interactiveElement.elementId) || !(this.usedInteractive.elementId == interactiveElement.elementId))) {

            const statedElement = this.statedElements.find(e => e.elementId == interactiveElement.elementId);
            let pos;
            if (statedElement != null) {
                const scenePos = this.wGame.isoEngine.mapRenderer.getCellSceneCoordinate(statedElement.elementCellId);
                pos = this.wGame.isoEngine.mapScene.convertSceneToCanvasCoordinate(scenePos.x, scenePos.y);
            }
            
            const interactive: InteractiveElement = {elementId: interactiveElement.elementId,
                                                    elementTypeId: interactiveElement.elementTypeId,
                                                    skillId: interactiveElement.enabledSkills[0].skillId,
                                                    skillInstanceUid: interactiveElement.enabledSkills[0].skillInstanceUid,
                                                    posX: pos != null ? pos.x : -1,
                                                    posY: pos != null ? pos.y : -1}

            if (this.skillsToUse.includes(interactive.skillId) && interactive) {
                this.waitingInteractives.push(interactive);
                this.logMsg('Add interactive : ', interactive.elementId);
            }
        }
    }

    private async sortByEstimateDistance() {
        if (this.waitingInteractives.length <= 1) return;

        const actorPosX: number = this.wGame.isoEngine.actorManager.userActor.x;
        const actorPosY: number = this.wGame.isoEngine.actorManager.userActor.y;

        this.waitingInteractives.sort((a, b) => 
            Math.ceil(Math.sqrt(Math.pow(a.posX - actorPosX, 2) + Math.pow(a.posY - actorPosY, 2)))
            - Math.ceil(Math.sqrt(Math.pow(b.posX - actorPosX, 2) + Math.pow(b.posY - actorPosY, 2)))
        );
    }

    /**
     * Use the first interactive in the list
     */
     private useInterative() {
        if (this.waitingInteractives.length > 0 && !this.isInHarvest.status && this.checkAllCondition()) {

            let interactive: InteractiveElement = this.waitingInteractives.shift();
            this.usedInteractive = interactive;
            this.isInHarvest.elemId = interactive.elementId;
            
            this.logMsg('UseInteractive -> elementId : ', interactive.elementId);
            try {
                this.wGame.isoEngine.queueUseInteractive(interactive.elementId, interactive.skillInstanceUid);
            } catch {
                console.error('Can\'t use this interactive :', interactive);
            }
            this.isInHarvest.status = true;
        }
    }

    /**
     * Remove the interactive when used
     * @param elemId Element to remove
     */
     private deleteUseInteractiveAtEnd(elemId: number) {
        if (this.usedInteractive != null && this.usedInteractive.elementId == elemId) {
            this.logMsg('Delete usedInteractive : ', elemId);
            this.usedInteractive = null;
            this.isInHarvest = {status: false, elemId: 0};
        }
    }

    private checkAllCondition(): boolean {
        const wContainerList = this.wGame.gui.windowsContainer._childrenList;

        return !(this.isInHarvest.status || this.isInHarvest.elemId != 0)                     // If player is already in harvest
            && !this.weightLimitReached                                                       // If weight limit reached
            && !this.wGame.gui.playerData.isFighting                                          // If player is in fight
            && !wContainerList.find(child => child.id == "tradeStorage").openState            // If trade storage is open
            && !wContainerList.find(child => child.id == "bidHouseShop").openState            // If bidHouse shop is open
            && !this.wGame.isoEngine.actorManager.userActor.isLocked                          // If player use something
            && !this.changeMap                                                                // If player changing map
            && !this.isLoading;                                                               // If data is in process
    }


    /* Listener function */

    private onInventoryWeightMessage() {
        this.on(this.wGame.dofus.connectionManager, 'InventoryWeightMessage', (e: any) => {
            try {
                const weightPercent = Math.round(e.weight / e.weightMax * 100);
                this.weightLimitReached = weightPercent >= this.maxWeightInPercent;
                if(this.weightLimitReached) this.wGame.gui.chat.logMsg('Pods supérieur à ' + this.maxWeightInPercent + '%');
            } catch (error) {
                console.error(error);
            }
        });
    }

    private onInteractiveElementUpdate() {
        this.on(this.wGame.dofus.connectionManager, 'InteractiveElementUpdatedMessage', (e: any) => {
            if (e.interactiveElement.enabledSkills.length > 0)
                this.addInteractiveToWaitingList(e.interactiveElement).then(() => {
                    this.logMsg('[Debug] delayedUseInterative');
                    this.delayedUseInteractive = setTimeout(() => this.useInterative(), this.getRandomTime(this.minTime, this.maxTime));
                });
        });
    }

    private onInteractiveUsedMessage() {
        this.on(this.wGame.dofus.connectionManager, 'InteractiveUsedMessage', (e: any) => {
            if (this.waitingInteractives.find(a => a.elementId == e.elemId) && this.actorId != e.entityId) {
                this.logMsg('StatedElementUpdatedMessage -> Remove element ' + e.elemId + ' already used...');
                this.deleteWaitingInteractive(e.elemId);
            }
            else if (this.waitingInteractives.find(a => a.elementId == e.elemId) && this.actorId == e.entityId) {
                this.logMsg('StatedElementUpdatedMessage -> Remove element ' + e.elemId + ' you take the control');
                if (this.usedInteractive) this.waitingInteractives.push(this.usedInteractive);
                this.usedInteractive = this.waitingInteractives.find(a => a.elementId == e.elemId);
                this.deleteWaitingInteractive(e.elemId);
            }
            else if (this.usedInteractive && this.usedInteractive.elementId == e.elemId && this.actorId != e.entityId) {
                this.logMsg('[Debug] Someone else took this interactive before you...');
                this.deleteUseInteractiveAtEnd(e.elemId);
                this.useInterative();
            }
        });
    }

    private onInteractiveUseEndedMessage() {
        this.on(this.wGame.dofus.connectionManager, 'InteractiveUseEndedMessage', async (e: any) => {
            this.deleteUseInteractiveAtEnd(e.elemId);

            this.isLoading = true;
            await this.sortByEstimateDistance().then(() => this.isLoading = false);

            this.useInterative();
        });
    }

    private onSendChangeMapMessage() {
        this.on(this.wGame.dofus.connectionManager, 'send', (e: any) => { if (e.data.data != null && e.data.data.type == 'ChangeMapMessage') this.changeMap = true; });
    }

    private onGameMapChange() {
        this.on(this.wGame.dofus.connectionManager, 'MapComplementaryInformationsDataMessage', (e: any) => {
                setTimeout(() => {
                    this.loadInteractiveList(e.interactiveElements, e.statedElements).then(() => {
                        this.changeMap = false;
                        this.useInterative();
                    });
                }, 2500);
        });
    }


    /* Shared methods */

    public startAutoHarvest(): boolean {
        // Init global var
        this.actorId = this.wGame.isoEngine.actorManager.userId;

        // Start Listener
        this.onGameMapChange();
        this.onInteractiveElementUpdate();
        this.onInteractiveUseEndedMessage();
        this.onInventoryWeightMessage();
        this.onInteractiveUsedMessage();
        this.onSendChangeMapMessage();

        // Get interactives
        this.loadInteractiveListFromLocalData();

        return true;
    }

    public stopAutoHarvest(): boolean {
        super.reset();
        return false;
    }

    public addSkillToUse(skillId: number) {
        this.skillsToUse.push(+skillId);
    }

    public removeSkillToUse(skillId: number) {
        const index: number = this.skillsToUse.indexOf(+skillId);
        this.skillsToUse.splice(index, 1);
    }


    /* Utils function */

    /**
     * Remove specified interactive in the waitingInteractives array
     * @param elementId The id of element to remove
     */
    private deleteWaitingInteractive(elementId: number) {
        const elementToRemove: InteractiveElement = this.waitingInteractives.find(e => e.elementId == elementId);
        const index: number = this.waitingInteractives.indexOf(elementToRemove, 0);
        if (index > -1) {
            this.waitingInteractives.splice(index, 1);
            this.logMsg('Delete waitingInteractive : ' + elementId);
        }
    }

    private clear() {
        this.waitingInteractives = [];
        this.usedInteractive = null;
        if (this.delayedUseInteractive) clearTimeout(this.delayedUseInteractive);
        this.isInHarvest = {status: false, elemId: 0};
    }

    public reset() {
        this.autoHarvestWindow.reset();
        this.stopAutoHarvest();
    }

    private logMsg(...data: any[]) {
        if (this.canLog) console.log(...data);
    }
    
}
export interface InteractiveElement {
    elementId: number;
    elementTypeId: number;
    skillId: number;
    skillInstanceUid: number;
    posX?: number;
    posY?: number;
}