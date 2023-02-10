import { AutoHarvest } from "./autoHarvest";
import { ShortcutsHelper } from "../../helpers/shortcuts.helper";
import { CustomWindow } from "../../helpers/windowHelper/customWindow";
import { WindowContentHelper } from "../../helpers/windowHelper/windowContent.helper";
import { List } from "../../helpers/windowHelper/components/list";
import { Select } from "../../helpers/windowHelper/inputs/select";
import { Input } from "../../helpers/windowHelper/inputs/input";
import { Button, ButtonColor } from "../../helpers/windowHelper/inputs/button";
import { Checkbox } from "../../helpers/windowHelper/inputs/checkbox";

export class WindowAutoHarvest {
    private static instance: WindowAutoHarvest;

    private wGame: any|Window;
    private params: any;
    public autoHarvest: AutoHarvest;

    private window: CustomWindow;
    private shortcutsHelper: ShortcutsHelper;

    private skillsCanUse: Array<number> = [];
    private select: Select;
    private checkBoxByJobSkill: {[jobSkill: number]: Checkbox} = {};

    public static getInstance(wGame: any|Window, params: any, autoHarvest: AutoHarvest): WindowAutoHarvest {
        if (!this.instance) return new WindowAutoHarvest(wGame, params, autoHarvest);
        return this.instance;
    }

    constructor(wGame: any|Window, params: any, autoHarvest: AutoHarvest) {
        this.wGame = wGame;
        this.params = params;
        this.autoHarvest = autoHarvest;

        let autoHarvestCss = document.createElement('style');
        autoHarvestCss.id = 'autoHarvestCss';
        autoHarvestCss.innerHTML = `
            #autoHarvestWindow {
                min-width: 650px; min-height: 450px;
                left: calc(50vw - 325px);
                top: calc(50vh - 225px);
            }
            .atohvt-body {
                display: flex;
                flex-direction: column;
            }
            #atohvt-container {
                display: flex;
                flex: 2;
            }
            #atohvt-listBox {
                flex: 1 1 0%;
            }
            #atohvt-resources, #atohvt-parameters, #atohvt-way {
                flex: 2 1 0%;
                flex-direction: column;
            }
            #atohvt-timeContainer {
                display: grid;
                grid-template-columns: 50% 50%;
                grid-template-rows: auto;
                grid-template-areas: "text text""min max";
                margin: 0 10px;
            }
            .atohvt-cb-container {
                display: none;
                flex-wrap: wrap;
                margin-top: 10px;
            }
            .atohvt-show {
                display: flex !important;
            }
            .atohvt-checkBox {
                min-width: 150px;
            }
            .atohvt-btn {
                width: 100%;
            }
            .atohvt-minTime {
                margin-right: 5px;
            }
        `;
        this.wGame.document.querySelector('head').appendChild(autoHarvestCss);

        this.shortcutsHelper = new ShortcutsHelper(this.wGame);
        this.shortcutsHelper.bind(this.params.auto_harvest_shortcut, () => this.toggle() );

        this.wGame.dofus.connectionManager.on('JobLevelUpMessage', this.onJobLevelUp);

        this.init();
    }

    /**
     * Initialize the window after job skill was get
     * @param tryCount Only for use in function
     */
    private init(tryCount?: number) {
        if (!tryCount) tryCount = 0;
        const listJobs: Array<number> = this.wGame.gui.playerData.jobs.jobOriginalOrder;

        if (tryCount && tryCount > 25) {
            console.log('Error, AutoHarvestWindow can\'t get jobsSkills...');
            return;
        }

        if (listJobs == undefined) setTimeout(() => this.init(tryCount+1), 100);
        else {
            this.getJobsSkills(listJobs);
            this.createWindow();
        }
    }

    /**
     * Create the window and add event to input
     */
    private createWindow() {
        // Create container
        this.window = CustomWindow.createDofusWindow(this.wGame, 'Récolte Automatique', 'autoHarvestWindow', {customClassBody: 'atohvt-body'})
                                  .makeDraggable()
                                  .hide();

        // Create container
        const container: HTMLDivElement = this.wGame.document.createElement('div');
        container.id = 'atohvt-container';

        // Create menu list
        const listBox: HTMLDivElement = WindowContentHelper.createContentBox(this.wGame, 'atohvt-listBox');
        const list: List = List.create(this.wGame, 'atohvt-list',
            [{id: '0', text: 'Ressources'},{id: '1', text: 'Chemin'},{id: '2', text: 'Parametres'}]);

        // Create resources box
        const resources: HTMLDivElement = WindowContentHelper.createContentBox(this.wGame, 'atohvt-resources');
        const select: Select = Select.create(this.wGame, 'atohvt-select', selectChoices);
        select.setAttribute('margin', '0 5px');

        // Create way box
        const way: HTMLDivElement = WindowContentHelper.createContentBox(this.wGame, 'atohvt-way');
        way.style.display = 'none';

        // Create parameter box
        const parameters: HTMLDivElement = WindowContentHelper.createContentBox(this.wGame, 'atohvt-parameters');
        parameters.style.display = 'none';
        const timeContainer: HTMLDivElement = this.wGame.document.createElement('div');
        timeContainer.id = 'atohvt-timeContainer';
        const timeText: HTMLDivElement = this.wGame.document.createElement('div');
        timeText.innerText = 'Réaparition (Temps avant récolte)';
        timeText.style.gridArea = 'text';

        // Create btn container
        const btnContainer: HTMLDivElement = WindowContentHelper.createContentBox(this.wGame, 'atohvt-btn-container');
        btnContainer.style.display = 'flex';
        btnContainer.style.marginTop = '8px';


        // Create input
        const minTimeInput: Input = Input.createNumberInput(this.wGame, 'atohvt-minTime', {
            label: 'Min : ', value: this.autoHarvest.minTime ? this.autoHarvest.minTime.toString() : '1', inputClassName: 'atohvt-minTime'
        });
        minTimeInput.setAttribute('gridArea', 'min');
        const maxTimeInput: Input = Input.createNumberInput(this.wGame, 'atohvt-maxTime', {
            label: 'Max : ', value: this.autoHarvest.maxTime ? this.autoHarvest.maxTime.toString() : '2'
        });
        maxTimeInput.setAttribute('gridArea', 'max');
        const start: Button = Button.createTextButton(this.wGame, 'atohvt-start-btn', {
            text: 'Lancer', color: ButtonColor.PRIMARY, customClassName: 'atohvt-btn'
        });
        const stop: Button = Button.createTextButton(this.wGame, 'atohvt-stop-btn', {
            text: 'Arrêter', color: ButtonColor.SECONDARY, customClassName: 'atohvt-btn'
        });
        stop.disabled(); // Disable stop button


        // Add input to container
        listBox.append(list.getHtmlElement());
        btnContainer.append(start.getHtmlElement(), stop.getHtmlElement());
        timeContainer.append(timeText, minTimeInput.getHtmlElement(), maxTimeInput.getHtmlElement());
        // Add input container to box container
        container.append(listBox, resources, way, parameters);
        resources.append(select.getHtmlElement());
        parameters.append(timeContainer);

        this.window.addContent(container)
                   .addContent(btnContainer);

        // Add all checkBox foreach skill
        this.createCheckBox(resources);

        // Add event to list
        list.addEvent((choice) => {
            console.log('List event');
            resources.style.display = 'none';
            parameters.style.display = 'none';
            way.style.display = 'none';
            if (choice.id == 0) resources.style.display = 'flex';
            if (choice.id == 1) way.style.display = 'flex';
            if (choice.id == 2) parameters.style.display = 'flex';
        });
        // Add event to input
        start.addEvent(() => {
            this.autoHarvest.startAutoHarvest();
            start.disabled();
            start.changeButtonColor(ButtonColor.SECONDARY);
            stop.enabled();
            stop.changeButtonColor(ButtonColor.PRIMARY);
        });
        stop.addEvent(() => {
            this.autoHarvest.stopAutoHarvest();
            stop.disabled();
            stop.changeButtonColor(ButtonColor.SECONDARY);
            start.enabled();
            start.changeButtonColor(ButtonColor.PRIMARY);
        });
        select.addEvent((choice) => {
            console.log('Select event');
            resources.getElementsByClassName('atohvt-show')[0].classList.remove('atohvt-show');
            this.wGame.document.getElementById('atohvt-job-' + choice.id).classList.add('atohvt-show');
        });
        minTimeInput.addEvent((time) => {
            this.autoHarvest.minTime = +time;
        });
        maxTimeInput.addEvent((time) => {
            this.autoHarvest.maxTime = +time;
        });

        this.select = select;
    }

    /**
     * Create checkbox for each skill and push to an categories container
     * @param resourceBox The global container
     */
    private createCheckBox(resourceBox: HTMLDivElement) {
        selectChoices.forEach((choices) => {
            // Create checkbox container
            
            const checkBoxContainer: HTMLDivElement = WindowContentHelper.createScrollableContent(this.wGame, 'atohvt-job-' + choices.id, 'atohvt-cb-container');
            if (choices.ticked) checkBoxContainer.classList.add('atohvt-show');

            // Insert container in resourceBox
            resourceBox.insertAdjacentElement('beforeend', checkBoxContainer);

            // Get all skill for the specified "jobId"
            const elmntSkill: Array<any> = elementsSkillList.filter((e) => e.jobId == +choices.id);

            // Create all checkBox for each skill
            elmntSkill.forEach((elmnt) => {
                // Create checkBox and define if enable or disabled
                const checkBox: Checkbox = Checkbox.create(this.wGame, 'atohvt-skill-' + elmnt.skillId, {
                    text: elmnt.name, isCheck: false, customClass: 'atohvt-checkBox'
                });
                if (!(+choices.id == 1) && !this.skillsCanUse.includes(+elmnt.skillId)) checkBox.disabled();

                this.checkBoxByJobSkill[elmnt.skillId] = checkBox;

                // Insert in checkBox container
                checkBoxContainer.append(checkBox.getHtmlElement());

                // Add event to checkBox
                checkBox.addEvent((isCheck) => {
                    if (isCheck) this.autoHarvest.addSkillToUse(elmnt.skillId);
                    else this.autoHarvest.removeSkillToUse(elmnt.skillId);
                });
            });
        });
    }

    /**
     * Get all know skill of the player
     * @param listJobs List of job learn by the player
     */
    private getJobsSkills(listJobs: Array<number>, nbrTry?: number) {
        nbrTry = nbrTry ? nbrTry : 1;

        if (this.wGame.gui.playerData && this.wGame.gui.playerData.jobs && this.wGame.gui.playerData.jobs.list
            && Object.keys(this.wGame.gui.playerData.jobs.list).length > 0) {

            listJobs.forEach(jobId => {
                const job = this.wGame.gui.playerData.jobs.list[jobId];
    
                job.description.skills.forEach(skill => {
                    if (skill._type == 'SkillActionDescriptionCollect') this.skillsCanUse.push(skill.skillId);
                });
            });

            if (nbrTry > 1) this.skillsCanUse.forEach(skillId => this.addJobSkill(skillId));
        }
        else if (nbrTry < 15) setTimeout(() => this.getJobsSkills(listJobs, nbrTry+1), 200);
        else console.log('[Error] Can\'t get jobs list...');
    }

    /**
     * Enable the checkbox associate to jobSkill
     * @param jobSkill The skill to add
     */
    private addJobSkill(jobSkill: number) {
        this.checkBoxByJobSkill[jobSkill].enabled();
        this.skillsCanUse.push(jobSkill);
    }


    /**
     * Function to execute when a job level up
     * @param e The receive data
     */
    private onJobLevelUp = (e) => {
        let skills: Array<any> = e.jobsDescription.skills;
        skills = skills.filter((skill) => skill.type == 'SkillActionDescriptionCollect' && skill.max < 4);

        skills.forEach((skill) => {
            if (!this.skillsCanUse.includes(skill.skillId)) this.addJobSkill(skill.skillId);
        });
    };
    

    /**
     * Show or hide window
     */
    private toggle() {
        if (this.window.isVisible()) {
            this.window.hide();
        } else {
            this.window.show();
        }
    }

    public reset() {
        if (this.select) this.select.remove();
        if (this.window) this.window.destroy();
        this.wGame.document.getElementById('autoHarvestCss').remove();
        this.wGame.dofus.connectionManager.removeListener('JobLevelUpMessage', this.onJobLevelUp);
        WindowAutoHarvest.instance = null;
    }
}


const selectChoices = 
[
    {id: '1',   text: 'Général', ticked: true},
    {id: '2',   text: 'Bûcheron'},
    {id: '24',  text: 'Mineur'},
    {id: '26',  text: 'Alchimiste'},
    {id: '28',  text: 'Paysan'},
    {id: '36',  text: 'Pêcheur'}
];

const elementsSkillList = 
[
    // Général
    { jobId: 1,     skillId: '102', name: 'Puits' },
    { jobId: 1,     skillId: '42',  name: 'Tas de patates' },
    { jobId: 1,     skillId: '193', name: 'Coquillage Ité' },
    { jobId: 1,     skillId: '195', name: 'Coquillage Accio' },
    { jobId: 1,     skillId: '196', name: 'Coquillage Enstouriste' },
    { jobId: 1,     skillId: '210', name: 'Marron Glacé' },
    { jobId: 1,     skillId: '214', name: 'Cristal de Roche' },
    { jobId: 1,     skillId: '215', name: 'Perle de Sable' },
    { jobId: 1,     skillId: '237', name: 'Cawotte fraîche'},
    // Bûcheron
    { jobId: 2,     skillId: '6',   name: 'Frêne'},
    { jobId: 2,     skillId: '10',  name: 'Chêne'},
    { jobId: 2,     skillId: '33',  name: 'If' },
    { jobId: 2,     skillId: '34',  name: 'Ebène' },
    { jobId: 2,     skillId: '35',  name: 'Orme' },
    { jobId: 2,     skillId: '37',  name: 'Erable' },
    { jobId: 2,     skillId: '38',  name: 'Charme' },
    { jobId: 2,     skillId: '39',  name: 'Châtaignier' },
    { jobId: 2,     skillId: '40',  name: 'Noyer' },
    { jobId: 2,     skillId: '139', name: 'Bombu' },
    { jobId: 2,     skillId: '141', name: 'Oliviolet' },
    { jobId: 2,     skillId: '154', name: 'Bambou' },
    { jobId: 2,     skillId: '155', name: 'Bambou sombre' },
    { jobId: 2,     skillId: '158', name: 'Bambou sacré' },
    { jobId: 2,     skillId: '41',  name: 'Merisier' },
    { jobId: 2,     skillId: '174', name: 'Kaliptus' },
    { jobId: 2,     skillId: '190', name: 'Tremble' },
    // Mineur
    { jobId: 24,    skillId: '24',  name: 'Fer'},
    { jobId: 24,    skillId: '25',  name: 'Pierre Cuivrée'},
    { jobId: 24,    skillId: '26',  name: 'Bronze'},
    { jobId: 24,    skillId: '28',  name: 'Pierre de Kobalte'},
    { jobId: 24,    skillId: '29',  name: 'Argent'},
    { jobId: 24,    skillId: '30',  name: 'Or'},
    { jobId: 24,    skillId: '31',  name: 'Pierre de Bauxite' },
    { jobId: 24,    skillId: '55',  name: 'Etain' },
    { jobId: 24,    skillId: '56',  name: 'Manganèse' },
    { jobId: 24,    skillId: '161', name: 'Dolomite' },
    { jobId: 24,    skillId: '162', name: 'Silicate' },
    { jobId: 24,    skillId: '192', name: 'Obsidienne'},
    // Alchimiste
    { jobId: 26,    skillId: '68',  name: 'Lin' },
    { jobId: 26,    skillId: '69',  name: 'Chanvre' },
    { jobId: 26,    skillId: '71',  name: 'Trèfle à 5 feuilles' },
    { jobId: 26,    skillId: '72',  name: 'Menthe Sauvage' },
    { jobId: 26,    skillId: '73',  name: 'Orchidée Freyesque' },
    { jobId: 26,    skillId: '74',  name: 'Edelweiss' },
    { jobId: 26,    skillId: '160', name: 'Pandouille' },
    { jobId: 26,    skillId: '188', name: 'Perce-neige' },
    // Paysan
    { jobId: 28,    skillId: '45',  name: 'Blé' },
    { jobId: 28,    skillId: '46',  name: 'Houblon' },
    { jobId: 28,    skillId: '50',  name: 'Lin' },
    { jobId: 28,    skillId: '52',  name: 'Seigle' },
    { jobId: 28,    skillId: '53',  name: 'Orge' },
    { jobId: 28,    skillId: '54',  name: 'Chanvre' },
    { jobId: 28,    skillId: '57',  name: 'Avoine' },
    { jobId: 28,    skillId: '58',  name: 'Malt' },
    { jobId: 28,    skillId: '159', name: 'Riz' },
    { jobId: 28,    skillId: '191', name: 'Frostiz',},
    //Pêcheur
    { jobId: 36,    skillId: '124', name: 'Petits poissons (rivière)' },
    { jobId: 36,    skillId: '125', name: 'Poissons (rivière)' },
    { jobId: 36,    skillId: '126', name: 'Gros poissons (rivière)' },
    { jobId: 36,    skillId: '127', name: 'Poissons géants (rivière)' },
    { jobId: 36,    skillId: '128', name: 'Petits poissons (mer)' },
    { jobId: 36,    skillId: '129', name: 'Poissons (mer)' },
    { jobId: 36,    skillId: '130', name: 'Gros poissons (mer)' },
    { jobId: 36,    skillId: '131', name: 'Poissons géants (mer)' },
    { jobId: 36,    skillId: '136', name: 'Pichon' },
    { jobId: 36,    skillId: '189', name: 'Poisson de Frigost' }
  ];