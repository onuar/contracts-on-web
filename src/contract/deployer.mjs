import ContractClient from '../contract/contract-client';
import Web3 from 'web3';

const prepareResources = (abi) => {
    let result = []
    let length = Object.keys(abi).length;
    for (var i = 0; i < length; i++) {
        var element = abi[i];
        if (element.type === "constructor") {
            continue;
        }
        var resource = element.name;
        let inputLength = Object.keys(element.inputs).length;
        let inputs = "(";
        if (inputLength > 0) {
            for (var k = 0; k < inputLength; k++) {
                var input = element.inputs[k];
                inputs += `${input.type}  ${input.name}, `;
            }
            inputs = inputs.substring(0, inputs.length - 2);
            inputs += ")";
            resource = `${resource} ${inputs}`;
        }

        result.push(
            {
                id: i,
                api: resource
            }
        );
    }
    return result;
};

export default class Deployer {
    constructor() {
    }

    prepare(context) {
        let artifact = context.req.body.artifact;
        let version = context.req.headers["api-version"];

        if (!artifact) {
            context.res.status(403).json({ message: "Artifact is required." });
        }
        if (!version) {
            context.res.status(403).json({ message: "You must add a version on headers." });
        }

        var resources = prepareResources(artifact.abi);
        context.res.status(200).json({ "resources": resources });
    }

    deploy(context) {
        let options = context.req.body.options;
        let contractOptions = context.req.body.contractOptions;
        let artifact = context.req.body.artifact;

        let account = context.req.headers["from-account"];
        let password = context.req.headers["password"];

        if (!options) {
            context.res.status(403).json({ message: "Options is required." });
        }
        if (!contractOptions) {
            context.res.status(403).json({ message: "Contract options in body" });
        }


        let gas = contractOptions.gas;
        let gasPrice = contractOptions.gasPrice;
        let args = contractOptions.args;

        let client = new ContractClient({ account, password });

        client
            .deployContract({
                artifact: artifact,
                gas: gas,
                gasPrice: gasPrice,
                args: args
            })
            .then(newContractInstance => {
                console.log(`Done!!! Address: ${newContractInstance.options.address}`);
                context.res.status(200).json({ address: newContractInstance.options.address });
            });

    }
}