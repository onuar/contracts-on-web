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
        const artifact = context.req.body.artifact;
        if (!artifact) {
            context.res.status(403).json({ message: "Artifact is required." });
        }

        var resources = prepareResources(artifact.abi);
        context.res.status(200).json({ "resources": resources });
    }
}