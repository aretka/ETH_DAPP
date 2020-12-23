const MyContract = artifacts.require("MyContract");

module.exports = function(deployer) {
  deployer.deploy(MyContract, "0xd7817F4763A61c02De98901B4d764bb3Be01A206", "0xdD70D242599576F89F48658d5D99dCeABe6f62D2");
};
