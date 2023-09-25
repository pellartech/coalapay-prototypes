import { Client, convertStringToHex, isoTimeToRippleTime, Wallet } from 'xrpl';

export class Toolkit {
    public client: Client
    constructor(server: string) {
        this.client = new Client(server)
    }

    getNewAccount() {
        const wallet = Wallet.generate()
        return wallet
    }

    getAccountFromSeed(seed: string) {
        const wallet = Wallet.fromSeed(seed)
        return wallet
    }

    async fundNewWalletOnTestnet() {
        await this.client.connect()
        const fund_result = await this.client.fundWallet()
        // console.log(fund_result)
        await this.client.disconnect()
        return fund_result
    }

    async getBalance(address: string) {
        await this.client.connect()
        const balance = await this.client.getXrpBalance(address)
        await this.client.disconnect()
        // console.log('balance', balance)
        return Number(balance)
    }

    async mintNft(seed: string, tokenUri: string) {
        await this.client.connect()

        const wallet = Wallet.fromSeed(seed)
        const transactionJson = {
            "TransactionType": 'NFTokenMint',
            "Account": wallet.classicAddress,
            "URI": convertStringToHex(tokenUri),
            "Flags": 8, //If you want the NFT to be transferable to third parties, set the Flags field to 8.
            "TransferFee": 0, // The Transfer Fee is a value 0 to 50000, used to set a royalty of 0.000% to 50.000% in increments of 0.001.
            "NFTokenTaxon": 0 //Required, but if you have no use for it, set to zero.
        }

        console.log('transactionJson', transactionJson)
        const tx = await this.client.submitAndWait(JSON.stringify(transactionJson), { wallet: wallet })
        await this.client.disconnect()
        console.log('tx', tx)
        return tx
    }

    async getNftsByAccount(seed: string) {
        await this.client.connect()

        const wallet = Wallet.fromSeed(seed)
        const nfts = await this.client.request({
            command: 'account_channels',
            method: "account_nfts",
            account: wallet.classicAddress
        })

        await this.client.disconnect()

        return nfts
    }

    async burnNft(seed: string, tokenId: string) {
        await this.client.connect()

        const wallet = Wallet.fromSeed(seed)
        const transactionBlob = {
            "TransactionType": "NFTokenBurn",
            "Account": wallet.classicAddress,
            "NFTokenID": tokenId,
            "Amount": 1
        }

        const tx = await this.client.submitAndWait(JSON.stringify(transactionBlob), { wallet: wallet })
        await this.client.disconnect()

        return tx
    }

    async createSellOffer(seed: string, tokenId: string, amount: string) {

        const days = 1
        let d = new Date()
        d.setDate(d.getDate() + days)
        const expirationDate = isoTimeToRippleTime(d)

        await this.client.connect()
        const wallet = Wallet.fromSeed(seed)
        let transactionBlob = {
            "TransactionType": "NFTokenCreateOffer",
            "Account": wallet.classicAddress,
            "NFTokenID": tokenId,
            "Amount": amount,
            "Flags": 8,
            "Expiration": expirationDate
        }
        const tx = await this.client.submitAndWait(JSON.stringify(transactionBlob), { wallet: wallet })
        await this.client.disconnect()
        return tx
    }

    async createBuyOffer(seed: string, tokenId: string, amount: string) {
        await this.client.connect()
        const wallet = Wallet.fromSeed(seed)
        const transactionBlob = {
            "TransactionType": "NFTokenCreateOffer",
            "Account": wallet.classicAddress,
            "Owner": '',
            "NFTokenID": tokenId,
            "Amount": amount,
            "Flags": null
        }
        const tx = await this.client.submitAndWait(JSON.stringify(transactionBlob), { wallet: wallet })
        await this.client.disconnect()
        return tx
    }

    async getNftOffers(tokenId: string, type: string) {
        await this.client.connect()
        const method = type.toLowerCase() === 'buy' ? 'nft_buy_offers' : 'nft_sell_offers'
        const offers = await this.client.request({
            command: 'account_channels',
            method: method,
            nft_id: tokenId
        })

        await this.client.disconnect()
        return offers
    }

    async cancelOffer(seed: string, tokenOfferIds: string) {
        await this.client.connect()
        const wallet = Wallet.fromSeed(seed)

        const transactionBlob = {
            "TransactionType": "NFTokenCancelOffer",
            "Account": wallet.classicAddress,
            "NFTokenOffers": tokenOfferIds
        }

        const tx = await this.client.submitAndWait(JSON.stringify(transactionBlob), { wallet })

        await this.client.disconnect()
        return tx
    }

    async acceptSellOffer(seed: string, tokenOfferId: string) {
        await this.client.connect()
        const wallet = Wallet.fromSeed(seed)

        const transactionBlob = {
            "TransactionType": "NFTokenAcceptOffer",
            "Account": wallet.classicAddress,
            "NFTokenSellOffer": tokenOfferId,
        }

        const tx = await this.client.submitAndWait(JSON.stringify(transactionBlob), { wallet })

        await this.client.disconnect()
        return tx
    }

    async acceptBuyOffer(seed: string, tokenOfferId: string) {
        await this.client.connect()
        const wallet = Wallet.fromSeed(seed)

        const transactionBlob = {
            "TransactionType": "NFTokenAcceptOffer",
            "Account": wallet.classicAddress,
            "NFTokenBuyOffer": tokenOfferId,
        }

        const tx = await this.client.submitAndWait(JSON.stringify(transactionBlob), { wallet })

        await this.client.disconnect()
        return tx
    }
}