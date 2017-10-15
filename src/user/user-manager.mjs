import Web3 from 'web3';
import konfig from "konfig";
import DbClient from 'graphql-client';

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
            context.res.status(403).json("Password mismatched");
            return;
        }

        this.web3.eth.personal.newAccount(password)
            .then(body => {
                var dbClient = new DbClient({
                    url: 'https://api.graph.cool/simple/v1/cj8n3encg0p6b01328jqnb6d4',
                    headers: {
                        Authorization: 'Bearer ' + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1MDgwMDMyOTcsImNsaWVudElkIjoiY2o4bXk5b2NrMGt0NzAxMTB0NjN1cThtbyIsInByb2plY3RJZCI6ImNqOG4zZW5jZzBwNmIwMTMyOGpxbmI2ZDQiLCJwZXJtYW5lbnRBdXRoVG9rZW5JZCI6ImNqOHJtODczcDByZHAwMTUxY3c2amJnZW8ifQ.2tcqPjzhJTYFGInBI_J32NsmoQk5A9QdjMPOs2yk7AI"
                    }
                });
                const query = `mutation {
                    createUser(
                      address:"${body}",
                      password:"${password}"
                    )
                  {
                    id
                  }}`;

                dbClient.query(
                        query, {},
                        (req, res) => {
                            if (res.status === 401) {
                                throw new Error('Not authorized');
                            }
                        }
                    ).then(function (body) {
                        console.log(body)
                    })
                    .catch(function (err) {
                        console.log(err.message)
                        context.res.status(500).json({
                            message: "New user is created on Ethereum network but it could not save to database which is not good."
                        });
                    });

                context.res.status(200).json({
                    address: body
                });
            });
    }
}