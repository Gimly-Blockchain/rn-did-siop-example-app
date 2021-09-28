/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import GimlyIDQRCodeScanner, {QRContent} from "@sphereon/gimlyid-qr-code-scanner"
import OPAuthenticator, {ParsedAuthenticationRequestURI} from "@sphereon/rn-did-auth-op-authenticator";
import React, {Component} from "react"
import {StyleSheet, Text, Vibration, View,} from "react-native"
import "react-native-get-random-values"
import BiometricPopup from "./BiometricPopup";


export type AppState = {
  showQRScanner?: boolean,
  showBiometricPopup?: boolean,
  message?: string
  biometricPopupDescription?: string
}

// TODO move hardcoding
const OP_PRIVATE_KEY = "c848751f600a9b8b91e3db840d75be2304b0ec4b9b15fe77d87d3eed9a007d1a";
const OP_DID = "did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489";

class App extends Component<AppState> {

  state: AppState = {
    message: "Scan the QR code"
  }
  private opAuthenticator: OPAuthenticator
  private authRequestURI?: ParsedAuthenticationRequestURI


  constructor(props: AppState, context: any) {
    super(props, context)
    this.opAuthenticator = new OPAuthenticator(OP_DID, OP_PRIVATE_KEY)
  }

  componentDidMount() {
    this.setState({showQRScanner: true})
  }

  render() {
    const showQRScanner = this.state.showQRScanner as boolean
    const showBiometricPopup = this.state.showBiometricPopup as boolean
    if (showQRScanner) {
      return (
          <GimlyIDQRCodeScanner style={{flex: 1, width: '100%'}} onRead={(qrContent: QRContent) => {
            this.processBarcode(qrContent)
          }
          }/>
      )
    } else {
      return (
          <View
              style={styles.fingerprint}
          >
            {showBiometricPopup && (
                <BiometricPopup description={this.state.biometricPopupDescription as string}
                                onAuthenticate={() => this.sendAuthResponse()}
                                onCancel={(reason: any) => this.biometricPopupCancelled(reason)}/>
            )}
            <Text>{this.state.message}</Text>
          </View>
      )
    }
  }

  private async processBarcode(qrContent: QRContent) {
    this.setState({showQRScanner: false, message: "Barcode read, waiting for biometric approval."})
    Vibration.vibrate(500)
    try {
      this.authRequestURI = await this.opAuthenticator.getRequestUrl(qrContent.redirectUrl as string, qrContent.state)
      const rpPresentation = await this.opAuthenticator.verifyAuthenticationRequestURI(this.authRequestURI)
      this.setState({
        showBiometricPopup: true,
        biometricPopupDescription: `Received authentication request from ${rpPresentation.did}`
      })
    } catch (e) {
      console.error("verifyRequest failed", e.message)
      this.setState({message: "Error: " + e.message})
      this.timeout(5000).then(() => this.setState({showQRScanner: true}))
    }
  }


  private sendAuthResponse() {
    try {

      this.setState({
        showBiometricPopup: false,
        message: `Biometric approval received, sending response.`
      })

      this.opAuthenticator.sendAuthResponse(this.authRequestURI as ParsedAuthenticationRequestURI).then(() => {
        this.setState({message: "Login successful"})
      })
    } catch (e) {
      console.error("sendAuthResponse failed", e.message)
      this.setState({message: "Error: " + e.message})
    } finally {
      this.timeout(5000).then(() => this.setState({showQRScanner: true}))
    }
  }

  private timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private biometricPopupCancelled(reason: any) {
    this.setState({
      showBiometricPopup: false,
      message: reason.message
    })
    this.timeout(5000).then(() => this.setState({showQRScanner: true}))
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  fingerprint: {
    padding: 20,
    marginVertical: 30,
  },
})


export default App


