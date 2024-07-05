import React from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { SparklesIcon as SparklesIconOutline, ArrowsUpDownIcon } from "react-native-heroicons/outline";

export const Jupiter = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jupiter</Text>
      <View style={styles.currencyContainer}>
        <View style={styles.tokenContainer}>
          <Image source={require("./assets/tokens/usdc.jpeg")} style={styles.tokenIcon} />
          <Text style={styles.label}>USDC</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={styles.switchButton}>
        <ArrowsUpDownIcon color="white" fill="white" />
      </TouchableOpacity>
      <View style={styles.currencyContainer}>
        <View style={styles.tokenContainer}>
          <Image source={require("./assets/tokens/jup.png")} style={styles.tokenIcon} />
          <Text style={styles.label}>JUP</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter desired amount"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={styles.connectButton}>
        <Text style={styles.connectText}>Connect Wallet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282830",
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
