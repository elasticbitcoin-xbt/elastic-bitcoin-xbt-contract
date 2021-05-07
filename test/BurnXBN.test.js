const { contract, web3 } = require("@openzeppelin/test-environment");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const moment = require("moment");
const { getETHBalance, formatReadableValue } = require("../util/helpers");

const _require = require("app-root-path").require;
const BlockchainCaller = _require("/util/blockchain_caller");
const chain = new BlockchainCaller(web3);
const MockERC20 = contract.fromArtifact("MockERC20");
const XBNv2 = contract.fromArtifact("XBNV2");

let token,
  otherToken,
  happyDealer,
  owner,
  anotherAccount,
  foundationWallet,
  buyer,
  anotherBuyer,
  anotherAccount3,
  anotherAccount2,
  xbnV2;

describe("TransferCoin", function() {
  beforeEach("Setup contract for burning testing", async function() {
    const accounts = await chain.getUserAccounts();
    owner = web3.utils.toChecksumAddress(accounts[0]);
    buyer = web3.utils.toChecksumAddress(accounts[4]);
    anotherBuyer = web3.utils.toChecksumAddress(accounts[6]);
    anotherBuyer2 = web3.utils.toChecksumAddress(accounts[5]);
    burnAddress = web3.utils.toChecksumAddress(accounts[7]);
    token = await MockERC20.new(4000);
    otherToken = await MockERC20.new(2000);

    xbnV2 = await XBNv2.new(owner);
    xbnV2.setBurnAddress(burnAddress);
    xbnV2.setBurnRate("2");
  });

  describe("Burning flow", async function() {
    it("owner is the first account", async function() {
      const _owner = await xbnV2.owner();
      console.log({
        _owner,
        owner,
      });
      expect(_owner).to.equal(owner);
    });
    it("should: sent some coin to burn address", async function() {
      console.log("Total supply: ", await xbnV2.totalSupply());
      await xbnV2.transfer(anotherBuyer, 2000000);
      const tokenBalance = xbnV2.balanceOf(anotherBuyer);
      const burnBalance = xbnV2.balanceOf(burnAddress);
      // Because burn rate is 2%
      // In case of, transfer to anotherBuyer 2000000 XBN
      // Another buyer will receive 0.98 * 2000000 = 1960000 XBN
      // Burn address will receive 40000 XBN
      expect(tokenBalance).to.be.bignumber.equal(1960000);
      expect(burnBalance).to.be.bignumber.equal(40000);
    });
  });
});
