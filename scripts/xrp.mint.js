const xrpl = require("xrpl");

const privateKey = "sEd77cnhv6q3PNZTNPFgecJBThqGeDC";

const main = async () => {
  console.log("Connecting to Testnet...");
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  console.log("Connected to Testnet");

  console.log("Getting account info...");
  const wallet = xrpl.Wallet.fromSeed(privateKey);
  console.log('Wallet: ', wallet);

  const balance = await client.getXrpBalance(wallet.address);
  console.log(balance);
  console.log(`Balance: ${balance} XRP`);

  const transactionJson = {
    TransactionType: "NFTokenMint",
    Account: wallet.classicAddress,
    URI: xrpl.convertStringToHex(`ipfs://abc`),
    Flags: 8, // more info: https://xrpl.org/nftokenmint.html#nftokenmint-flags
    TransferFee: 10000, // 10%
    NFTokenTaxon: 0, //Required, but if you have no use for it, set to zero.
  };

  console.log("Submitting transaction...");
  const tx = await client.submitAndWait(transactionJson, { wallet: wallet} )
  console.log(`Transaction successful: `, tx);
  const { result: nfts } = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress
  })
  console.log(JSON.stringify(nfts, null, 2));

  const nft0 = nfts.account_nfts[0];
  const uriDecoded = xrpl.convertHexToString(nft0.URI);
  console.log(`URI: ${uriDecoded}`);


  await client.disconnect();
};

main();
