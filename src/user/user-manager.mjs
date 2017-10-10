import Web3 from 'web3';
import konfig from "konfig";

export default class UserManager {
    constructor() {
        const config = konfig();
        const host = config.app.host;
        this.web3 = new Web3(new Web3.providers.HttpProvider(host));
    }
    add(context) {
        this.web3.eth.getBlock(111, function (error, result) {
            if (!error)
                context.res.json({ "result": result })
            else
                console.error(error);
        });
    }
}