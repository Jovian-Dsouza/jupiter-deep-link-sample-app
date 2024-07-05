import React from "react";
import { Modal, View, Text, TouchableHighlight, StyleSheet, Image } from "react-native";

const WalletModal = ({
  modalVisible,
  setModalVisible,
  connect,
}: {
  modalVisible: boolean;
  setModalVisible: any;
  connect: any;
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Connect Wallet</Text>
          <TouchableHighlight
            style={{ ...styles.openButton, backgroundColor: "#282830" }}
            onPress={() => connect("solflare")}
          >
            <View style={styles.walletContainer}>
              <Image source={require("./assets/wallets/solflare.png")} style={styles.walletIcon} />
              <Text style={styles.textStyle}>Solflare</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={{ ...styles.openButton, backgroundColor: "#282830" }}
            onPress={() => connect("phantom")}
          >
            <View style={styles.walletContainer}>
              <Image source={require("./assets/wallets/phantom.png")} style={styles.walletIcon} />
              <Text style={styles.textStyle}>Phantom</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  walletIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderRadius: 100,
  },
  walletContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  openButton: {
    width: "100%",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default WalletModal;
