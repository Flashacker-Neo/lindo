import * as EventEmitter from 'eventemitter3';
import {ElectronService as electron} from '@services/electron/electron.service';

import {Mod} from "../mod";

export class Notifications extends Mod {
    public eventEmitter: EventEmitter;

    startMod(): void {
        this.eventEmitter = new EventEmitter();
        this.params = this.settings.option.notification;

        this.on(this.wGame.dofus.connectionManager, 'ChatServerMessage', (msg: any) => {
            this.sendMPNotif(msg);
        });
        this.on(this.wGame.gui, 'GameFightTurnStartMessage', (actor: any) => {
            this.sendFightTurnNotif(actor);
        });
        this.on(this.wGame.dofus.connectionManager, 'TaxCollectorAttackedMessage', (tc: any) => {
            this.sendTaxCollectorNotif(tc);
        });
        this.on(this.wGame.dofus.connectionManager, 'GameRolePlayArenaFightPropositionMessage', (e: any) => {
            this.sendKolizeumNotif(e);
        });
        this.on(this.wGame.dofus.connectionManager, 'PartyInvitationMessage', (e: any) => {
            this.sendPartyInvitationNotif(e);
        });
        this.on(this.wGame.dofus.connectionManager, 'GameRolePlayAggressionMessage', (e: any) => {
            this.sendAggressionNotif(e);
        });
    }

    private sendMPNotif(msg: any) {
        if (!this.wGame.document.hasFocus() && this.params.private_message) {
            if (msg.channel == 9) {

                this.eventEmitter.emit('newNotification');

                const mpNotif = new Notification(this.translate.instant('app.notifications.private-message', {character: msg.senderName}), {
                    body: msg.content
                });

                mpNotif.onclick = () => {
                    electron.getCurrentWindow().focus();
                    this.eventEmitter.emit('focusTab');
                };
            }
        }
    }

    private sendFightTurnNotif(actor: any) {
        if (!this.wGame.document.hasFocus()
            && this.wGame.gui.playerData.characterBaseInformations.id == actor.id) {

            if (this.params.fight_turn) {

                this.eventEmitter.emit('newNotification');

                const turnNotif = new Notification(this.translate.instant('app.notifications.fight-turn', {character: this.wGame.gui.playerData.characterBaseInformations.name}));

                turnNotif.onclick = () => {
                    electron.getCurrentWindow().focus();
                    this.eventEmitter.emit('focusTab');
                };
            }

            if (this.params.focus_fight_turn) {
                electron.getCurrentWindow().focus();
                this.eventEmitter.emit('focusTab');
            }
        }
    }

    private sendKolizeumNotif(msg: any) {
        if (!this.wGame.document.hasFocus()
            && this.params.fight_turn) {

            this.eventEmitter.emit('newNotification');

            const kolizeumNotif = new Notification(this.translate.instant('app.notifications.kolizeum'));

            kolizeumNotif.onclick = () => {
                electron.getCurrentWindow().focus();
                this.eventEmitter.emit('focusTab');
            };
        }
    }

    private sendTaxCollectorNotif(tc: any) {
        if (!this.wGame.document.hasFocus() && this.params.tax_collector) {

            this.eventEmitter.emit('newNotification');

            const guildName = tc.guild.guildName;
            const x = tc.worldX;
            const y = tc.worldY;
            const zoneName = tc.enrichData.subAreaName;
            const tcName = tc.enrichData.firstName + " " + tc.enrichData.lastName;

            const taxCollectorNotif = new Notification(this.translate.instant('app.notifications.tax-collector'), {
                body: zoneName + ' [' + x + ', ' + y + '] : ' + guildName + ', ' + tcName
            });

            taxCollectorNotif.onclick = () => {
                electron.getCurrentWindow().focus();
                this.eventEmitter.emit('focusTab');
            };

        }
    }

    private sendPartyInvitationNotif(e: any) {
        if (!this.wGame.document.hasFocus() && this.params.party_invitation) {

            this.eventEmitter.emit('newNotification');

            const fromName: string = e.fromName;

            const partyInvitationNotif = new Notification(this.translate.instant('app.notifications.party-invitation', {character: e.fromName}));

            partyInvitationNotif.onclick = () => {
                electron.getCurrentWindow().focus();
                this.eventEmitter.emit('focusTab');
            };
        }
    }

    private sendAggressionNotif(e: any) {
        if (!this.wGame.document.hasFocus()
            && this.params.aggression
            && e.defenderId == this.wGame.gui.playerData.characterBaseInformations.id) {

            this.eventEmitter.emit('newNotification');

            const aggressionNotif = new Notification(this.translate.instant('app.notifications.aggression'));

            aggressionNotif.onclick = () => {
                electron.getCurrentWindow().focus();
                this.eventEmitter.emit('focusTab');
            };
        }
    }

    public reset() {
        super.reset();
        this.eventEmitter.removeAllListeners();
    }

}
