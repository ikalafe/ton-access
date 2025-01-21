import { getHttpEndpoint } from "@orbs-network/ton-access";
import {
  fromNano,
  internal,
  toNano,
  TonClient,
  WalletContractV4,
} from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";

async function main() {
  const mnemonic =
    "royal hole ride bean chimney foil oval shield engage apple process green jazz marble blush snow delay minor way clean sad castle obey crisp";

  const key = await mnemonicToWalletKey(mnemonic.split(" "));

  const wallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  });

  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint: endpoint });

  if (!(await client.isContractDeployed(wallet.address))) {
    return console.warn("wallet is not deployed ❌");
  }

  console.log("Wallet is deployed ✅ -", wallet.address);

  const balance = await client.getBalance(wallet.address);
  console.log("Balance 💎 =>", fromNano(balance));

  // 0QBCh-caGLbWWz74p1Q6NW-WqLmIOIOROAyHWgREnCgnYwaz
  // EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e

  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();

  await walletContract.sendTransfer({
    seqno: seqno,
    secretKey: key.secretKey,
    messages: [
      internal({
        to: "0QBCh-caGLbWWz74p1Q6NW-WqLmIOIOROAyHWgREnCgnYwaz",
        value: "0.06",
        body: "Send by Daiyal",
        bounce: false,
      }),
    ],
  });

  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.warn("Wating for transaction to confirm...⬆");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }

  console.log("Transactions confirmed ✅");
}

main();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
