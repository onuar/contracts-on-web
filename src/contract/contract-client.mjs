import Web3 from "web3";
import konfig from "konfig";

const unlockAccount = ref => {
    return ref.web3.eth.personal.unlockAccount(ref.account, ref.password);
};
const createContract = (web3, artifact, address) => {
    const CurrentContract = new web3.eth.Contract(artifact.abi);
    if (address) {
        CurrentContract.options.address = address;
    }
    return CurrentContract;
};

export default class ContractClient {
    constructor({ account, password }) {
        this.account = account;
        this.password = password;

        const config = konfig();
        const host = config.app.host;
        this.web3 = new Web3(new Web3.providers.HttpProvider(host));
    }

    deployContract({ artifact, gas, gasPrice, args }) {
        const web3 = this.web3;
        const account = this.account;
        return unlockAccount(this).then(function () {
            const CurrentContract = createContract(web3, artifact);

            return CurrentContract.deploy({
                from: account,
                data: artifact.unlinked_binary,
                arguments: args
            })
                .send({
                    from: account,
                    gas: gas,
                    gasPrice: gasPrice
                })
                .on("error", function (error) {
                    console.log(`Error: ${JSON.stringify(error)}`);
                    throw error;
                })
                .on("transactionHash", function (transactionHash) {
                    console.log(`transactionHash: ${JSON.stringify(transactionHash)}`);
                })
                .on("receipt", function (receipt) {
                    console.log(
                        `Receipt: address: ${receipt.contractAddress}. json: ${receipt}`
                    );
                })
                .on("confirmation", function (confirmationNumber, receipt) {
                    console.log(
                        `confirmation: ${JSON.stringify(
                            confirmationNumber
                        )}, Receipt: ${receipt}`
                    );
                })
                .then(function (newContractInstance) {
                    console.log("done!");
                    console.log(
                        `Contract Address: '${newContractInstance.options.address}'`
                    );
                    console.log(
                        `Contract Instance: '${JSON.stringify(newContractInstance)}'`
                    );
                    return newContractInstance;
                });
        });
    }

    getState({ artifact, address, method, args }) {
        const web3 = this.web3;

        return unlockAccount(this).then(function () {
            const CurrentContract = createContract(web3, artifact, address);

            if (typeof CurrentContract.methods[method] !== "function") {
                throw new Error(`'${method}' is not a valid function.`);
            }

            return CurrentContract.methods[method]
                .apply(this, args)
                .call(function (err, val) {
                    return val;
                });
        });
    }

    setState({ artifact, address, method, args, gas, gasPrice }) {
        const web3 = this.web3;
        const fromAccount = this.fromAccount;

        return unlockAccount(this).then(function () {
            const CurrentContract = createContract(web3, artifact, address);

            if (typeof CurrentContract.methods[method] !== "function") {
                throw new Error(`'${method}' is not a valid function.`);
            }

            return CurrentContract.methods[method].apply(this, args).send({
                from: fromAccount,
                gas: gas,
                gasPrice: gasPrice
            });
        });
    }
}
