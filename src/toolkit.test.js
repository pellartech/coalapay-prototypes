const { expect } = require('chai')
const Toolkit = require('./toolkit')

describe('ToolKit', () => {
    let toolKit
    let account;
    let burnNftId;
    let offerNftId;
    let sellOfferIndex;
    let account2;
    let buyOfferIndex;


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
        expect(wallet).to.have.property('address')
        expect(wallet.seed).to.equal(seed)
    })

    it('should create a wallet and fund it with the Testnet faucet', async () => {
        const result = await toolKit.fundNewWalletOnTestnet()

        account = result.wallet
        expect(result).to.have.property('wallet')
        expect(result.wallet).to.have.property('address')
        expect(result.balance).to.equal(10000)
    })

    it('should get an account\'s balance', async () => {
        const balance = await toolKit.getBalance(account.address)
        expect(balance).to.equal(10000)
    })

    it('should mint a NFT on testnet', async () => {
        const tx = await toolKit.mintNft(account.seed, 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf4dfuylqabf3oclgtqy55fbzdi')
        expect(tx).to.have.property('id')
        expect(tx.result).to.have.property('hash')
    })

    it('should list nfts by account', async () => {
        const nfts = await toolKit.getNftsByAccount(account.address)
        expect(nfts.length).to.equal(1)
        // console.log(nfts)
        burnNftId = nfts[0].NFTokenID
    })

    it('should burn a nft', async () => {
        const resp = await toolKit.burnNft(account.seed, burnNftId)
        expect(resp).to.have.property('id')
        expect(resp.result).to.have.property('hash')

        const nfts = await toolKit.getNftsByAccount(account.address)
        expect(nfts.length).to.equal(0)
    })

    it('should create a sell offer', async () => {
        // mint a new nft
        const tx = await toolKit.mintNft(account.seed, 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf4dfuylqabf3oclgtqy55fbzdi')
        const nfts = await toolKit.getNftsByAccount(account.address)
        const tokenId = nfts[0].NFTokenID

        offerNftId = tokenId

        const sellOfferResp = await toolKit.createSellOffer(account.seed, tokenId, "1")

        expect(sellOfferResp).to.have.property('id')
        expect(sellOfferResp.result).to.have.property('hash')

        // console.log('sellOfferResp', sellOfferResp)
        const offers = await toolKit.getNftOffers(tokenId, 'sell')
        // console.log('offers', offers)
        sellOfferIndex = offers[0].nft_offer_index
        expect(offers.length).to.equal(1)
    })

    it('should create a buy offer', async () => {
        const result = await toolKit.fundNewWalletOnTestnet()
        account2 = result.wallet

        const buyOfferResp = await toolKit.createBuyOffer(account2.seed, offerNftId, account.address, "1")

        expect(buyOfferResp).to.have.property('id')
        expect(buyOfferResp.result).to.have.property('hash')

        // console.log('buyOfferResp', sellOfferResp)
        const offers = await toolKit.getNftOffers(offerNftId, 'buy')
        // console.log('offers', offers)
        buyOfferIndex = offers[0].nft_offer_index
        expect(offers.length).to.equal(1)
    })


    it('should cancel a buy offer', async () => {
        const tx = await toolKit.cancelOffer(account2.seed, buyOfferIndex)

        console.log('tx', tx)
        expect(tx).to.have.property('id')
        expect(tx.result).to.have.property('hash')

        const offers = await toolKit.getNftOffers(offerNftId, 'buy')
        console.log('offers', offers)
        expect(offers.length).to.equal(0)
    })

    it('should accept a sell offer', async () => {
        const tx = await toolKit.acceptOffer(account2.seed, sellOfferIndex, 'sell')

        console.log('tx', tx)
        expect(tx).to.have.property('id')
        expect(tx.result).to.have.property('hash')

        const offers = await toolKit.getNftOffers(offerNftId, 'sell')
        console.log('offers', offers)
        expect(offers.length).to.equal(0)
    })


})