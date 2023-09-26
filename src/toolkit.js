const xrpl = require("xrpl")

class ToolKit {
    constructor(server) {
        this.client = new xrpl.Client(server)
    }
    getNewAccount() {
        const wallet = xrpl.Wallet.generate()
        return wallet
    }

    getAccountFromSeed(seed) {
        const wallet = xrpl.Wallet.fromSeed(seed)
        return wallet
    }

    async fundNewWalletOnTestnet() {
        await this.client.connect()
        const fund_result = await this.client.fundWallet()
        // console.log(fund_result)
        await this.client.disconnect()
        return fund_result
    }

    async getBalance(address) {
        await this.client.connect()
        const balance = await this.client.getXrpBalance(address)
        await this.client.disconnect()
        return parseFloat(balance)
    }


    async mintNft(seed, tokenUri) {
        await this.client.connect()

        const wallet = xrpl.Wallet.fromSeed(seed)
        const transactionJson = {
            "TransactionType": 'NFTokenMint',
            "Account": wallet.classicAddress,
            "URI": xrpl.convertStringToHex(tokenUri),
            "Flags": 8, //If you want the NFT to be transferable to third parties, set the Flags field to 8.
            "TransferFee": 0, // The Transfer Fee is a value 0 to 50000, used to set a royalty of 0.000% to 50.000% in increments of 0.001.
            "NFTokenTaxon": 0 //Required, but if you have no use for it, set to zero.
        }

        const tx = await this.client.submitAndWait(transactionJson, { wallet: wallet })
        await this.client.disconnect()
        return tx
    }

    async getNftsByAccount(address, limit = 100) {
        await this.client.connect()

        const requestBlob = {
            method: "account_nfts",
            account: address,
            limit: limit
        }
        const resp = await this.client.request(requestBlob)

        await this.client.disconnect()
        return resp.result.account_nfts
    }

    async burnNft(seed, tokenId) {
        await this.client.connect()

        const wallet = xrpl.Wallet.fromSeed(seed)
        const transactionBlob = {
            "TransactionType": "NFTokenBurn",
            "Account": wallet.classicAddress,
            "NFTokenID": tokenId,
        }

        const tx = await this.client.submitAndWait(transactionBlob, { wallet: wallet })

        // console.log(tx)
        await this.client.disconnect()

        return tx
    }


    async createSellOffer(seed, tokenId, amount, destination) {
        await this.client.connect()
        const wallet = xrpl.Wallet.fromSeed(seed)
        let transactionBlob = {
            "TransactionType": "NFTokenCreateOffer",
            "Account": wallet.classicAddress,
            "NFTokenID": tokenId,
            "Amount": amount,
            "Flags": 1 // 1 = SELL 
        }
        if (destination !== '') {
            transactionBlob.Destination = destination
        }
        const tx = await this.client.submitAndWait(transactionBlob, { wallet: wallet })
        await this.client.disconnect()
        return tx
    }

    async createBuyOffer(seed, tokenId, owner, amount) {
        await this.client.connect()
        const wallet = xrpl.Wallet.fromSeed(seed)
        const transactionBlob = {
            "TransactionType": "NFTokenCreateOffer",
            "Account": wallet.classicAddress,
            "Owner": owner,
            "NFTokenID": tokenId,
            "Amount": amount,
            "Flags": null
        }
        const tx = await this.client.submitAndWait(transactionBlob, { wallet: wallet })
        await this.client.disconnect()
        return tx
    }

    async getNftOffers(tokenId, type = 'buy') {
        await this.client.connect()
        try {
            const method = type.toLowerCase() === 'buy' ? 'nft_buy_offers' : 'nft_sell_offers'
            const resp = await this.client.request({
                method: method,
                nft_id: tokenId
            })
            await this.client.disconnect()

            const offers = resp.result.offers
            return offers
        } catch (err) {
            await this.client.disconnect()
            return []
        }


    }

    async cancelOffer(seed, tokenOfferIds) {
        await this.client.connect()
        const wallet = xrpl.Wallet.fromSeed(seed)

        const transactionBlob = {
            "TransactionType": "NFTokenCancelOffer",
            "Account": wallet.classicAddress,
            "NFTokenOffers": tokenOfferIds.split(',')
        }

        const tx = await this.client.submitAndWait(transactionBlob, { wallet })

        await this.client.disconnect()
        return tx
    }

    async acceptOffer(seed, tokenOfferId, type = 'sell') {
        await this.client.connect()
        const wallet = xrpl.Wallet.fromSeed(seed)

        const transactionBlob = {
            "TransactionType": "NFTokenAcceptOffer",
            "Account": wallet.classicAddress,
        }
        if (type.toLocaleLowerCase() === 'sell') {
            transactionBlob.NFTokenSellOffer = tokenOfferId
        } else {
            transactionBlob.NFTokenBuyOffer = tokenOfferId
        }

        const tx = await this.client.submitAndWait(transactionBlob, { wallet })

        await this.client.disconnect()
        return tx
    }
}

module.exports = ToolKit