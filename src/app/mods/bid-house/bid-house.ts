import { WindowContentHelper } from "@helpers/windowHelper/windowContent.helper";
import axios from "axios";
import { Mod } from "../mod";

export class BidHouse extends Mod {

    private optionsWindow: any;
    private alreadyCheckItems: {[key: number]: number} = {};

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
                const now = Date.now();

                // Create item object
                let item = {itemId, date: now, server: this.wGame.gui.serversData.connectedServerId, min: 0, max: 0, median: 0, prices: []};
    
                // Unique offer
                if (i.itemTypeDescriptions.length == 1) {
                    const prices = i.itemTypeDescriptions[0].prices;
                    item.prices = prices;

                    // Create object for each quantity with real price and unit price
                    let items: any = {};
                    if (prices[0] > 0) items['1'] = {   price: prices[0], unit: prices[0] };
                    if (prices[1] > 0) items['10'] = {  price: prices[1], unit: (prices[1] / 10) };
                    if (prices[2] > 0) items['100'] = { price: prices[2], unit: (prices[2] / 100) };

                    // Set min, max & median based on calculated unit prices.
                    const sort = Object.keys(items).sort((a,b) => items[a].unit - items[b].unit);
                    item.min = items[sort[0]].price;
                    item.max = items[sort[sort.length - 1]].price;
                    item.median = Math.round(items[sort[1]].price / Number(sort[1]));
                }
                // Multi offers
                else {
                    let items = i.itemTypeDescriptions.map(i => i.prices[0]).sort((a,b) => a - b);
                    item.min = items[0];
                    item.max = items[items.length - 1];
                    item.median = this.findMedian(items);
                }
                    
                this.updateData(item);

                // Send data to server only if the item wasn't already sent 5 minutes before
                if (!this.alreadyCheckItems[itemId] || this.alreadyCheckItems[itemId] < (now - 5*60*1000)) {
                    this.alreadyCheckItems[itemId] = now; // Set new time

                    // Send item prices to db
                    axios.post(
                        'http://localhost:5000/api/v2/hdv/itemsPrices',
                        item,
                        { headers: { Authorization: `Bearer DP55zH7g.m6uCv5C8IxQUQFpgSoRghkQiOK0AAcLNbZEqzfTj`} }
                    ).catch(err => console.error(err));
                }
            });
        }
    }


    // Add custom HTML when items details is open
    private onOpen() {
        if (this.optionsWindow.mode === "buy-bidHouse"
            && this.optionsWindow.rootElement.getElementsByClassName('neo-bhp').length < 1) {
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

    // Update content in HTML with item values
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