import Web3 from 'web3';
import konfig from "konfig";

export default class UserManager {
    constructor() {
        const config = konfig();
        const host = config.app.host;
        this.web3 = new Web3(new Web3.providers.HttpProvider(host));
    }
    add(context) {
        const password = context.req.body.password;
        const confirmPass = context.req.body.confirm;
        if (password != confirmPass) {
            context.res.status(403).json("Password dismatched");
            return;
        }

        this.web3.eth.personal.newAccount(password)
            .then(body =>
                context.res.status(200).json({
                    address: body
                })
            );
    }
}