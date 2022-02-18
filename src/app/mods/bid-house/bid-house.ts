import { WindowContentHelper } from "@helpers/windowHelper/windowContent.helper";
import { Mod } from "../mod";

export class BidHouse extends Mod {

    private optionsWindow: any;

    startMod(): void {
        // Set parent windows
        this.optionsWindow = this.wGame.gui.windowsContainer.getChildren().find(c => c.id === "tradeItem");
        // Define gui listener
        this.optionsWindow.on("open", () => this.onOpen());

        const bidHousePriceCss = document.createElement('style');
        bidHousePriceCss.id = 'bidHousePriceCss';
        bidHousePriceCss.innerHTML = `
            #price-indicator {
                display: flex;
                flex-flow: wrap;
                justify-content: space-between;
                align-items: center;
                padding: 0px 11px;;
            }
            .price-min {
                color: #68a724;
            }
            .price-max {
                color: #ea1d1d;
            }
            .price-median {
                color: #f58d1f;
            }
        `;

        this.wGame.document.querySelector('head').appendChild(bidHousePriceCss);

        this.on(this.wGame.dofus.connectionManager, 'send', (e) => this.getData(e));
    }

    private getData(e) {
        if (e?.data?.data?.type === 'ExchangeBidHouseListMessage') {
            this.once(this.wGame.dofus.connectionManager, 'ExchangeTypesItemsExchangerDescriptionForUserMessage', (i: any) => {
                const itemId = e.data.data.data.id;
                let item = {itemId, date: Date.now(), server: this.wGame.gui.serversData.connectedServerId, min: 0, max: 0, median: 0, prices: []};
    
                if (i.itemTypeDescriptions.length == 1) {
                    item.prices = i.itemTypeDescriptions[0].prices;
                }
                else {
                    let items = i.itemTypeDescriptions.map(i => i.prices[0]).sort((a,b) => a - b);
                    item.min = items[0];
                    item.max = items[items.length - 1];
                    item.median = this.findMedian(items);
                }
                
                this.updateData(item);
            });
        }
    }


    private onOpen() {
        if (this.optionsWindow.mode === "buy-bidHouse") {
            const table: HTMLElement = this.optionsWindow.rootElement.getElementsByClassName('BidHouseBuyerBox')[0];

            const contentBox: HTMLDivElement = new WindowContentHelper(this.wGame).createContentBox('price-indicator', 'neo-bhp');
            const content = `
                <div>Min : <span class="price-min">0</span></div>
                <div>Max : <span class="price-max">0</span></div>
                <div>Median : <span class="price-median">0</span></div>
            `;

            contentBox.insertAdjacentHTML('afterbegin', content);
            table.insertAdjacentElement('afterend', contentBox);
        }
    }

    private updateData(item) {
        const content: HTMLElement = this.optionsWindow.rootElement.getElementsByClassName('neo-bhp')[0];
        content.getElementsByClassName('price-min')[0].innerHTML = `${this.formatNumber(item.min)} K`;
        content.getElementsByClassName('price-max')[0].innerHTML = `${this.formatNumber(item.max)} K`;
        content.getElementsByClassName('price-median')[0].innerHTML = `${this.formatNumber(item.median)} K`;
    }


    private findMedian(m) {
        var middle = Math.floor((m.length - 1) / 2);
        return (m.length % 2) ? m[middle] : (m[middle] + m[middle + 1]) / 2.0;
    }

    private formatNumber(number: number): string {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
}