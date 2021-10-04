/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import {OP_DID, OP_KID, OP_PRIVATE_KEY} from "@env"
import GimlyIDQRCodeScanner, {QRContent} from "@sphereon/gimlyid-qr-code-scanner"
import OPAuthenticator, {ParsedAuthenticationRequestURI, VerifiedAuthenticationRequestWithJWT} from "@spostma/rn-did-auth-op-authenticator";
import {QRCodeValues} from "@spostma/rn-did-auth-op-authenticator/dist/types/types";
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


class App extends Component<AppState> {

  state: AppState = {
    message: "Scan the QR code"
  }
  private opAuthenticator: OPAuthenticator
  private authRequestURI?: ParsedAuthenticationRequestURI
  private verifiedAuthenticationRequest?: VerifiedAuthenticationRequestWithJWT


  constructor(props: AppState, context: any) {
    super(props, context)
    this.opAuthenticator = OPAuthenticator.newInstance({
      opPrivateKey: OP_PRIVATE_KEY,
      opDID: OP_DID,
      opKID: OP_KID
    })
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
      const redirectUrl = qrContent.redirectUrl as string
      console.log("Getting request URL from", redirectUrl)
      this.authRequestURI = await this.opAuthenticator.getAuthenticationRequestFromRP(qrContent as QRCodeValues)
      console.log("Get redirect_uri", this.authRequestURI.requestPayload.redirect_uri)
      this.verifiedAuthenticationRequest = await this.opAuthenticator.verifyAuthenticationRequestURI(this.authRequestURI)
      const rpDid = this.opAuthenticator.rpDidFromAuthenticationRequest(this.verifiedAuthenticationRequest)
      this.setState({
        showBiometricPopup: true,
        biometricPopupDescription: `Received authentication request from ${rpDid.id} ${rpDid.alsoKnownAs}`
      })
    } catch (e) {
      console.error("verifyRequest failed", e)
      this.setState({message: "Error: " + e.message})
      this.timeout(5000).then(() => this.setState({showQRScanner: true}))
    }
  }


  private async sendAuthResponse() {
    try {

      this.setState({
        showBiometricPopup: false,
        message: `Biometric approval received, sending response.`
      })

      await this.opAuthenticator.sendAuthResponse(this.verifiedAuthenticationRequest as VerifiedAuthenticationRequestWithJWT)
      this.setState({message: "Login successful"})
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


