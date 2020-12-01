import { Logger } from "app/core/electron/logger.helper";
import { Mod } from "../mod";

export class AutoHarvest extends Mod {
    private readonly STATE_USE: number = 2;

    private identifiedElements: any;
    private waitingInteractives: Array<InteractiveElement> = new Array();
    private usedInteractive: InteractiveElement;
    private skillsToUse: number[] = [];

    private checkInterval: any;
    private delayedUseInteractive: ReturnType<typeof setTimeout>;
    private isInHarvest: {status: boolean, startTime: number, elemId: number} = {status: false, startTime: -1, elemId: 0};
    private maxWeightInPercent: number = 95;
    private weightLimitReached: boolean = false;
    private isLoading: boolean = false;

    startMod(): void {
        this.params = this.settings.option.vip.general;

        if(/*this.params.auto_harvest*/ false) {
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

            this.checkForAwaitingInteractives();
        }
    }

    private checkForAwaitingInteractives() {
        this.checkInterval = setInterval(() => {
            // Reset harvest
            if (this.isInHarvest.status && (new Date().getTime() - this.isInHarvest.startTime) >= 20000) {

                this.deleteUseInteractiveAtEnd(this.isInHarvest.elemId);
                console.log('Force "isInHarvest" reinitialization -> ', this.isInHarvest);
            }

            console.log('isLoading : ', this.isLoading);

            // Triggers the use of interactive
            if (this.waitingInteractives.length > 0 && !this.isLoading && this.checkAllCondition()) {

                let interactive: InteractiveElement = this.waitingInteractives.shift();
                this.useInteractiveElement(interactive);
                this.usedInteractive = interactive;

                if (this.waitingInteractives.length > 1) {
                    this.isLoading = true;
                    setTimeout(() => this.sortByEstimateDistance(), 200);
                }
            }
        }, 2500);
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
        console.log('SkillsToUse : ', this.skillsToUse);
    }

    private useInteractiveElement(interactive: InteractiveElement) {
        if (!this.isInHarvest.status) {
            this.isInHarvest = {status: true, startTime: new Date().getTime(), elemId: interactive.elementId};

            this.delayedUseInteractive = setTimeout(() => {
                console.log('UseInteractive -> elementId : ', interactive.elementId);
                this.wGame.isoEngine.queueUseInteractive(interactive.elementId, interactive.skillInstanceUid);   
            }, this.getRandomTime(1,2));
        }
    }

    private addInteractiveToWaitingList(interactiveElement: any) {

        if ((interactiveElement.enabledSkills != null && interactiveElement.enabledSkills.length > 0)
            && (!this.waitingInteractives.find(a => a.elementId == interactiveElement.elementId) || !(this.usedInteractive.elementId == interactiveElement.elementId))) {

            const element = this.identifiedElements[interactiveElement.elementId];
            
            const interactive: InteractiveElement = {elementId: interactiveElement.elementId,
                                                    elementTypeId: interactiveElement.elementTypeId,
                                                    skillId: interactiveElement.enabledSkills[0].skillId,
                                                    skillInstanceUid: interactiveElement.enabledSkills[0].skillInstanceUid,
                                                    posX: element.x ? element.x : -1,
                                                    posY: element.y ? element.y : -1}

            if (this.skillsToUse.includes(interactive.skillId)) {
                this.waitingInteractives.push(interactive);
                console.log('Add interactive : ', interactive.elementId);
            }
        }
    }

    private deleteUseInteractiveAtEnd(elemId: number) {
        if (this.usedInteractive != null && this.usedInteractive.elementId == elemId) {
            console.log('Delete usedInteractive : ', elemId);
            this.usedInteractive = null;
            this.isInHarvest = {status: false, startTime: -1, elemId: 0};
        }
    }

    private loadInteractiveList(interactiveElements: any) {
        this.isLoading = true;
        setTimeout(() => {
            this.identifiedElements = this.wGame.isoEngine.mapRenderer.identifiedElements;

            this.clear();
            interactiveElements.forEach((interactiveElement) => {
                this.addInteractiveToWaitingList(interactiveElement);
            });

            if (this.waitingInteractives.length > 1) setTimeout(() => this.sortByEstimateDistance(), 200);
            else this.isLoading = false;
        }, 500);
    }

    private async sortByEstimateDistance() {
console.log('SortWaitingInteractives...');
        const actorPosX: number = this.wGame.isoEngine.actorManager.userActor.x;
        const actorPosY: number = this.wGame.isoEngine.actorManager.userActor.y;

        this.waitingInteractives.sort((a, b) => 
            Math.ceil(Math.sqrt(Math.pow(a.posX - actorPosX, 2) + Math.pow(a.posY - actorPosY, 2)))
            - Math.ceil(Math.sqrt(Math.pow(b.posX - actorPosX, 2) + Math.pow(b.posY - actorPosY, 2)))
        );
        this.isLoading = false;
    }

    private checkAllCondition(): boolean {
        return !this.isInHarvest.status                     // If player is already in harvest
            && !this.weightLimitReached                     // If weight limit reached
            && !this.wGame.gui.playerData.isFighting;       // If player is in fight
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
                if(this.weightLimitReached) console.log('Pods supérieur à ' + this.maxWeightInPercent + '%');
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

    private onGameMapChange() {
        this.on(this.wGame.dofus.connectionManager, 'MapComplementaryInformationsDataMessage', (e: any) => this.loadInteractiveList(e.interactiveElements));
    }


    /* Utils function */

    // FIXME Check if element is realy delete when is call by an other user interact with element 
    private deleteWaitingInteractive(elementId: number) {
        const elementToRemove: InteractiveElement = this.waitingInteractives.find(e => e.elementId == elementId);
        const index: number = this.waitingInteractives.indexOf(elementToRemove, 0);
        if (index > -1) {
            this.waitingInteractives.slice(index, 1);
            console.log('Delete waitingInteractive : ' + elementId);
        }
    }

    private clear() {
        this.waitingInteractives = [];
        this.usedInteractive = null;
        if (this.delayedUseInteractive) clearTimeout(this.delayedUseInteractive);
        this.isInHarvest = {status: false, startTime: -1, elemId: 0};
    }

    public reset() {
        super.reset();
        clearInterval(this.checkInterval);
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