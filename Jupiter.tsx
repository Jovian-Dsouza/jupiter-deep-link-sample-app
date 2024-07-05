import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { ArrowsUpDownIcon } from "react-native-heroicons/outline";
import { getAssetByName } from "./solanaAssests";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

export const Jupiter = ({
  session,
  walletPublicKey,
  connect,
  signAndSendTransaction,
}: {
  session: string | undefined;
  walletPublicKey: PublicKey | undefined;
  connect: any;
  signAndSendTransaction: any;
}) => {
  const fromAsset = getAssetByName("USDC");
  const toAsset = getAssetByName("BONK");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [quoteResponse, setQuoteResponse] = useState(null);

  async function getQuote(currentAmount: number) {
    console.log("Get quote called");
    if (isNaN(currentAmount) || currentAmount <= 0) {
      console.error("Invalid fromAmount value:", currentAmount);
      return;
    }

    const quote = await (
      await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${fromAsset.mint}&outputMint=${
          toAsset.mint
        }&amount=${currentAmount * Math.pow(10, fromAsset.decimals)}&slippageBps=1`
      )
    ).json();

    if (quote && quote.outAmount) {
      const outAmountNumber = Number(quote.outAmount) / Math.pow(10, toAsset.decimals);
      setToAmount(outAmountNumber.toString());
      console.log(
        `Got quote for swap ${currentAmount} ${fromAsset.name} -> ${toAsset.name}: ${outAmountNumber}`
      );
    }

    setQuoteResponse(quote);
  }

  useEffect(() => {
    if (fromAmount !== "") {
      getQuote(parseFloat(fromAmount));
    }
    const interval = setInterval(() => {
      if (fromAmount !== "") {
        getQuote(parseFloat(fromAmount));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fromAmount, fromAsset, toAsset]);

  const swap = async () => {
    console.log("Swap called");
    if (!walletPublicKey) throw new Error("missing public key from user");

    const { swapTransaction } = await (
      await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: walletPublicKey.toString(),
          wrapAndUnwrapSol: true,
        }),
      })
    ).json();

    try {
      const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      console.log("transaction created");
      await signAndSendTransaction(transaction);
    } catch (error) {
      console.error("Error signing or sending the transaction:", error);
    }
  };

  const handlePress = () => {
    if (session) {
      swap();
    } else {
      connect();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Jupiter</Text>
        <View style={styles.currencyContainer}>
          <View style={styles.tokenContainer}>
            <Image source={fromAsset.img} style={styles.tokenIcon} />
            <Text style={styles.label}>{fromAsset.name}</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={fromAmount}
            onChangeText={(text) => setFromAmount(text)}
          />
        </View>
        <TouchableOpacity style={styles.switchButton}>
          <ArrowsUpDownIcon color="white" fill="white" />
        </TouchableOpacity>
        <View style={styles.currencyContainer}>
          <View style={styles.tokenContainer}>
            <Image source={toAsset.img} style={styles.tokenIcon} />
            <Text style={styles.label}>{toAsset.name}</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter desired amount"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={toAmount}
            editable={false}
          />
        </View>
        <TouchableOpacity style={styles.connectButton} onPress={handlePress}>
          <Text style={styles.connectText}>{session ? "Swap" : "Connect Wallet"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282830",
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  tokenContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 24,
    marginBottom: 20,
  },
  currencyContainer: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    color: "#fff",
    fontSize: 18,
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
  },
  switchButton: {
    marginVertical: 10,
  },
  switchText: {
    color: "#fff",
    fontSize: 18,
  },
  connectButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  connectText: {
    color: "#fff",
    fontSize: 18,
  },
  tokenIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderRadius: 100,
  },
});
