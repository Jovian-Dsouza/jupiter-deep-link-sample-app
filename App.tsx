import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;
global.TextEncoder = require("text-encoding").TextEncoder;
global.structuredClone = (val) => {
  return JSON.parse(JSON.stringify(val));
};
// if (typeof BigInt === "undefined") {
  global.BigInt = require("big-integer");
// }
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import nacl from "tweetnacl";
import bs58 from "bs58";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import axios from "axios";
import { Jupiter } from "./Jupiter";

import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}
const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();
(() => {
  if (typeof crypto === "undefined") {
    Object.defineProperty(window, "crypto", {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    });
  }
})();

const cluster = "mainnet-beta";
// const cluster = "devnet"
const NETWORK = clusterApiUrl(cluster);
// const NETWORK = clusterApiUrl("devnet");

const onConnectRedirectLink = Linking.createURL("onConnect");
const onDisconnectRedirectLink = Linking.createURL("onDisconnect");
const onSignAndSendTransactionRedirectLink = Linking.createURL("onSignAndSendTransaction");
const onSignAllTransactionsRedirectLink = Linking.createURL("onSignAllTransactions");
const onSignTransactionRedirectLink = Linking.createURL("onSignTransaction");
const onSignMessageRedirectLink = Linking.createURL("onSignMessage");

//const buildUrl = (path: string, params: URLSearchParams) =>
//  `https://solflare.com/ul/${path}?${params.toString()}`;

const buildUrl = (path: string, params: URLSearchParams) =>
  `solflare://ul/${path}?${params.toString()}`;

const decryptPayload = (data: string, nonce: string, sharedSecret?: Uint8Array) => {
  if (!sharedSecret) throw new Error("missing shared secret");

  const decryptedData = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), sharedSecret);
  if (!decryptedData) {
    throw new Error("Unable to decrypt data");
  }
  return JSON.parse(Buffer.from(decryptedData).toString("utf8"));
};

const encryptPayload = (payload: any, sharedSecret?: Uint8Array) => {
  if (!sharedSecret) throw new Error("missing shared secret");

  const nonce = nacl.randomBytes(24);

  const encryptedPayload = nacl.box.after(
    Buffer.from(JSON.stringify(payload)),
    nonce,
    sharedSecret
  );

  return [nonce, encryptedPayload];
};

export default function App() {
  const [deepLink, setDeepLink] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const connection = new Connection(NETWORK);
  const scrollViewRef = useRef<any>(null);

  const [dappKeyPair] = useState(() => nacl.box.keyPair());
  const [sharedSecret, setSharedSecret] = useState<Uint8Array>();
  const [session, setSession] = useState<string>();
  const [walletPublicKey, setWalletPublicKey] = useState<PublicKey>();

  useEffect(() => {
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        setDeepLink(initialUrl);
      }
    })();
    Linking.addEventListener("url", handleDeepLink);
    return () => {
      Linking.removeEventListener("url", handleDeepLink);
    };
  }, []);

  const handleDeepLink = ({ url }: Linking.EventType) => {
    setDeepLink(url);
  };

  // handle inbounds links
  useEffect(() => {
    if (!deepLink) return;

    const url = new URL(deepLink);
    const params = url.searchParams;

    if (params.get("errorCode")) {
      console.log(JSON.stringify(Object.fromEntries([...params]), null, 2));
      return;
    }

    if (/onConnect/.test(url.pathname)) {
      const sharedSecretDapp = nacl.box.before(
        bs58.decode(params.get("solflare_encryption_public_key")!),
        dappKeyPair.secretKey
      );

      const connectData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecretDapp
      );

      setSharedSecret(sharedSecretDapp);
      setSession(connectData.session);
      setWalletPublicKey(new PublicKey(connectData.public_key));

      console.log(JSON.stringify(connectData, null, 2));
    } else if (/onDisconnect/.test(url.pathname)) {
      console.log("Disconnected!");
    } else if (/onSignAndSendTransaction/.test(url.pathname)) {
      const signAndSendTransactionData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );

      console.log(JSON.stringify(signAndSendTransactionData, null, 2));
    } else if (/onSignAllTransactions/.test(url.pathname)) {
      const signAllTransactionsData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );

      const decodedTransactions = signAllTransactionsData.transactions.map((t: string) =>
        Transaction.from(bs58.decode(t))
      );

      console.log(JSON.stringify(decodedTransactions, null, 2));
    } else if (/onSignTransaction/.test(url.pathname)) {
      const signTransactionData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );

      const decodedTransaction = Transaction.from(bs58.decode(signTransactionData.transaction));

      console.log(JSON.stringify(decodedTransaction, null, 2));
    } else if (/onSignMessage/.test(url.pathname)) {
      const signMessageData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );

      console.log(JSON.stringify(signMessageData, null, 2));
    }
  }, [deepLink]);
  
  


  const createTransferTransaction = async () => {
    console.log("Creating transactoin");
    if (!walletPublicKey) throw new Error("missing public key from user");
    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: walletPublicKey,
        lamports: 100,
      })
    );
    
    transaction.feePayer = walletPublicKey;
    console.log("Getting recent blockhash");
    const anyTransaction: any = transaction;
    anyTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    return transaction;
  };

  const connect = async () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: cluster,
      app_url: "https://solflare.com",
      redirect_link: onConnectRedirectLink,
    });

    const url = buildUrl("v1/connect", params);
    Linking.openURL(url);
  };

  const disconnect = async () => {
    const payload = {
      session,
    };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onDisconnectRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    const url = buildUrl("v1/disconnect", params);
    Linking.openURL(url);
  };

  const signAndSendTransaction = async (transaction: any) => {
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });

    const payload = {
      session,
      transaction: bs58.encode(serializedTransaction),
    };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignAndSendTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    const url = buildUrl("v1/signAndSendTransaction", params);
    Linking.openURL(url);
  };

  const signAllTransactions = async () => {
    const transactions = await Promise.all([
      createTransferTransaction(),
      createTransferTransaction(),
    ]);

    const serializedTransactions = transactions.map((t) =>
      bs58.encode(
        t.serialize({
          requireAllSignatures: false,
        })
      )
    );

    const payload = {
      session,
      transactions: serializedTransactions,
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignAllTransactionsRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    console.log("Signing transactions...");
    const url = buildUrl("v1/signAllTransactions", params);
    Linking.openURL(url);
  };

  const signTransaction = async () => {
    const transaction = await createTransferTransaction();

    const serializedTransaction = bs58.encode(
      transaction.serialize({
        requireAllSignatures: false,
      })
    );

    const payload = {
      session,
      transaction: serializedTransaction,
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    console.log("Signing transaction...");
    const url = buildUrl("v1/signTransaction", params);
    Linking.openURL(url);
  };

  const signMessage = async () => {
    const message = "To avoid digital dognappers, sign below to authenticate with CryptoCorgis.";

    const payload = {
      session,
      message: bs58.encode(Buffer.from(message)),
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignMessageRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    console.log("Signing message...");
    const url = buildUrl("v1/signMessage", params);
    Linking.openURL(url);
  };

  const browseDapp = async () => {
    const params = new URLSearchParams({
      ref: "https://solflare.com"
    });
    const url = buildUrl(`v1/browse/${encodeURIComponent("https://solrise.finance")}`, params);
    Linking.openURL(url);
  };

  useEffect(() => {
    if (walletPublicKey) {
      console.log(walletPublicKey.toString());
    }
  }, [walletPublicKey]);

  return (
    <View style={{ flex: 1, backgroundColor: "#282830" }}>
      <StatusBar style="light" />
      <Jupiter session={session} connect={connect} walletPublicKey={walletPublicKey} signAndSendTransaction={signAndSendTransaction} />
    </View>
  );
}

const StyledButton = (props: TouchableHighlightProps & { title: string }) => {
  return (
    <TouchableHighlight
      {...props}
      style={{ margin: 5, backgroundColor: "#FF842D", padding: 10, borderRadius: 8 }}>
      <Text style={{ color: "#000000", fontWeight: "600", textAlign: "center" }}>
        {props.title}
      </Text>
    </TouchableHighlight>
  );
};
