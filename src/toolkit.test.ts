import { expect } from 'chai'
import { Wallet } from 'xrpl'
import { Toolkit } from './toolkit'

describe('ToolKit', () => {
    let toolKit: Toolkit
    let account1: Wallet;
    let account2: Wallet;

    beforeEach(() => {
        toolKit = new Toolkit('wss://s.altnet.rippletest.net:51233')
    })

    afterEach(() => { })

    it('should create a new ToolKit instance', () => {
        expect(toolKit).to.be.an.instanceOf(Toolkit)
    })

    it('should generate a new account', () => {
        const wallet = toolKit.getNewAccount()
        expect(wallet).to.have.property('address')
    })

    it('should get an account from a seed', () => {
        const seed = 'sn3nxiW7v8KXzPzAqzyHXbSSKNuN9'
        const wallet = toolKit.getAccountFromSeed(seed)
        account1 = wallet
        expect(wallet).to.have.property('address')
        expect(wallet.seed).to.equal(seed)
    })

    it('should create a wallet and fund it with the Testnet faucet', async () => {
        const result = await toolKit.fundNewWalletOnTestnet()

        account2 = result.wallet
        expect(result).to.have.property('wallet')
        expect(result.wallet).to.have.property('address')
        expect(result.balance).to.equal(10000)
    })

    it('should get an account\'s balance', async () => {
        const balance = await toolKit.getBalance(account2.address)
        expect(balance).to.equal(10000)
    })

    it('should mint a NFT on testnet', async () => {
        const tx = await toolKit.mintNft('sEd7t57DCdnFbxTK3UviDJt84Kwda8g', 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf4dfuylqabf3oclgtqy55fbzdi')
        // expect(balance).to.equal(10000)
    })
})