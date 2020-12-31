import { Logger } from "app/core/electron/logger.helper";
import { Mod } from "../mod";

export class AutoHarvest extends Mod {
    private readonly STATE_USE: number = 2;

    private statedElements: any[];
    private waitingInteractives: Array<InteractiveElement> = new Array();
    private usedInteractive: InteractiveElement;
    private skillsToUse: number[] = [];

    private checkInterval: any;
    private resetHarvestInterval: any;
    private delayedUseInteractive: ReturnType<typeof setTimeout>;
    private isInHarvest: {status: boolean, elemId: number} = {status: false, elemId: 0};
    private maxWeightInPercent: number = 95;
    private weightLimitReached: boolean = false;
    private isLoading: boolean = false;
    private changeMap: boolean = false;

    startMod(): void {
        this.params = this.settings.option.vip.general;

        if(/*this.params.auto_harvest*/ true) {
            Logger.info('- enable AutoHarvest');

            setTimeout(() => {
                this.getJobsSkills();
            }, 4000);

            // Start Listener
            this.onGameMapChange();
            this.onInteractiveElementUpdate();
            this.onInteractiveUseEndedMessage();
            this.onInventoryWeightMessage();
            this.onStatedElementUpdatedMessage()
            this.onChangeMapMessage();

            this.checkForAwaitingInteractives();
        }
    }

    private checkForAwaitingInteractives() {
        // Triggers the use of interactive
        this.checkInterval = setInterval(() => {
            if (this.waitingInteractives.length > 0 && !this.isLoading && !this.changeMap && this.checkAllCondition()) {

                let interactive: InteractiveElement = this.waitingInteractives.shift();
                this.useInteractiveElement(interactive);
                this.usedInteractive = interactive;

                if (this.waitingInteractives.length > 1) {
                    this.isLoading = true;
                    setTimeout(() => this.sortByEstimateDistance(), 200);
                }
            }
        }, 500);

        // Reset harvest
        this.resetHarvestInterval = setInterval(() => {
            if (this.isInHarvest.status && (!this.wGame.isoEngine.actorManager.userActor.isLocked && !this.wGame.isoEngine.actorManager.userActor.moving)) {

                this.deleteUseInteractiveAtEnd(this.isInHarvest.elemId);
                console.log('Force "isInHarvest" reinitialization -> ', this.isInHarvest);
            }
        }, 1000);
    }

    // TODO Move in autoHarvest gestionnaire
    private getJobsSkills() {
        const listJobs: Array<number> = this.wGame.gui.playerData.jobs.jobOriginalOrder;
        listJobs.forEach(jobId => {
            const job = this.wGame.gui.playerData.jobs.list[jobId];

            job.description.skills.forEach(skill => {
                if (skill._type == 'SkillActionDescriptionCollect') {
                    this.skillsToUse.push(skill.skillId);
                }
            });
        });
    }

    /**
     * Launches use of interactive of the interactives passed in parameters
     * @param interactive The interactives to use
     */
    private useInteractiveElement(interactive: InteractiveElement) {
        if (!this.isInHarvest.status) {
            this.isInHarvest.elemId = interactive.elementId;

            this.delayedUseInteractive = setTimeout(() => {
                console.log('UseInteractive -> elementId : ', interactive.elementId);
                this.wGame.isoEngine.queueUseInteractive(interactive.elementId, interactive.skillInstanceUid);
                this.isInHarvest.status = true; 
            }, this.getRandomTime(1,2));
        }
    }

    /**
     * Create and add interactive to waiting list
     * @param interactiveElement Interactive to add
     */
    private addInteractiveToWaitingList(interactiveElement: any) {

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

            if (this.skillsToUse.includes(interactive.skillId)) {
                this.waitingInteractives.push(interactive);
                console.log('Add interactive : ', interactive.elementId);
            }
        }
    }

    /**
     * Remove the interactive when used
     * @param elemId Element to remove
     */
    private deleteUseInteractiveAtEnd(elemId: number) {
        if (this.usedInteractive != null && this.usedInteractive.elementId == elemId) {
            console.log('Delete usedInteractive : ', elemId);
            this.usedInteractive = null;
            this.isInHarvest = {status: false, elemId: 0};
        }
    }

    /**
     * Reset data and load new interactives
     * @param interactiveElements Interactives received by websocket
     * @param statedElements StatedElements received by websocket
     */
    private loadInteractiveList(interactiveElements: any, statedElements: any) {
        this.isLoading = true;
        this.statedElements = statedElements;

        this.clear();
        interactiveElements.forEach((interactiveElement) => {
            this.addInteractiveToWaitingList(interactiveElement);
        });

        if (this.waitingInteractives.length > 1) setTimeout(() => this.sortByEstimateDistance(), 200);
        else this.isLoading = false;
    }

    private sortByEstimateDistance() {
        const actorPosX: number = this.wGame.isoEngine.actorManager.userActor.x;
        const actorPosY: number = this.wGame.isoEngine.actorManager.userActor.y;

        this.waitingInteractives.sort((a, b) => 
            Math.ceil(Math.sqrt(Math.pow(a.posX - actorPosX, 2) + Math.pow(a.posY - actorPosY, 2)))
            - Math.ceil(Math.sqrt(Math.pow(b.posX - actorPosX, 2) + Math.pow(b.posY - actorPosY, 2)))
        );
        this.isLoading = false;
    }

    private checkAllCondition(): boolean {
        const wContainerList = this.wGame.gui.windowsContainer._childrenList;

        return !(this.isInHarvest.status || this.isInHarvest.elemId != 0)                     // If player is already in harvest
            && !this.weightLimitReached                                                       // If weight limit reached
            && !this.wGame.gui.playerData.isFighting                                          // If player is in fight
            && !wContainerList.find(child => child.id == "tradeStorage").openState            // If trade storage is open
            && !wContainerList.find(child => child.id == "bidHouseShop").openState            // If bidHouse shop is open
            && !this.wGame.isoEngine.actorManager.userActor.isLocked;                         // If player use something
    }


    /* Listener function */

    private onStatedElementUpdatedMessage() {
        this.on(this.wGame.dofus.connectionManager, 'StatedElementUpdatedMessage', (e: any) => {
            if (this.waitingInteractives.find(a => a.elementId == e.statedElement.elementId) && e.statedElement.elementState == this.STATE_USE) {
                console.log('StatedElementUpdatedMessage -> Remove element ' + e.statedElement.elementId + ' already used...');
                this.deleteWaitingInteractive(e.statedElement.elementId);
            }
        });
    }

    private onInventoryWeightMessage() {
        this.on(this.wGame.dofus.connectionManager, 'InventoryWeightMessage', (e: any) => {
            try {
                const weightPercent = Math.round(e.weight / e.weightMax * 100);
                this.weightLimitReached = weightPercent >= this.maxWeightInPercent;
                if(this.weightLimitReached) this.wGame.gui.chat.logMsg('Pods supérieur à ' + this.maxWeightInPercent + '%');
            } catch (error) {
                Logger.info(error);
            }
        });
    }

    private onInteractiveElementUpdate() {
        this.on(this.wGame.dofus.connectionManager, 'InteractiveElementUpdatedMessage', (e: any) => this.addInteractiveToWaitingList(e.interactiveElement));
    }

    private onInteractiveUseEndedMessage() {
        this.on(this.wGame.dofus.connectionManager, 'InteractiveUseEndedMessage', (e: any) => this.deleteUseInteractiveAtEnd(e.elemId));
    }

    private onChangeMapMessage() {
        this.on(this.wGame.dofus.connectionManager, 'send', (e: any) => { if (e.data.data == 'ChangeMapMessage') this.changeMap = true; });
    }

    private onGameMapChange() {
        this.on(this.wGame.dofus.connectionManager, 'MapComplementaryInformationsDataMessage', (e: any) => {
            this.loadInteractiveList(e.interactiveElements, e.statedElements);
            setTimeout(() => {
                this.changeMap = false;
            }, 500);
        });
    }


    /* Utils function */

    private deleteWaitingInteractive(elementId: number) {
        const elementToRemove: InteractiveElement = this.waitingInteractives.find(e => e.elementId == elementId);
        const index: number = this.waitingInteractives.indexOf(elementToRemove, 0);
        if (index > -1) {
            this.waitingInteractives.splice(index, 1);
            console.log('Delete waitingInteractive : ' + elementId);
        }
    }

    private clear() {
        this.waitingInteractives = [];
        this.usedInteractive = null;
        if (this.delayedUseInteractive) clearTimeout(this.delayedUseInteractive);
        this.isInHarvest = {status: false, elemId: 0};
    }

    public reset() {
        super.reset();
        clearInterval(this.checkInterval);
        clearInterval(this.resetHarvestInterval);
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