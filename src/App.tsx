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
import OPAuthenticator from "@sphereon/rn-did-siop-auth-lib/dist"
import React, {Component} from "react"
import {StyleSheet, Text, Vibration,} from "react-native"
import "react-native-get-random-values"

export type AppState = {
  showQRScanner?: boolean,
  message?: string
}

class App extends Component<AppState> {

  state: AppState = {
    message: "Processing"
  }
  private opAuthenticator: OPAuthenticator


  constructor(props: AppState, context: any) {
    super(props, context)
    this.opAuthenticator = new OPAuthenticator()
  }

  componentDidMount() {
    this.setState({showQRScanner: true})
  }

  render() {
    const showQRScanner = this.state.showQRScanner as boolean
    if (showQRScanner) {
      return (
          <GimlyIDQRCodeScanner style={{flex: 1, width: '100%'}} onRead={(qrContent: QRContent) => {
            this.processBarcode(qrContent);
          }
          }/>
      )
    } else {
      return (<Text>{this.state.message}</Text>)
    }
  }

  private async processBarcode(qrContent: QRContent) {
    this.setState({showQRScanner: false})
    Vibration.vibrate(500)
    try {
      await this.opAuthenticator.executeLoginFlowFromQR(qrContent.redirectUrl as string, qrContent.state)
      this.setState({message: "Login successful!"})
    } catch (e) {
      console.error("verifyRequest failed", e.message)
      this.setState({message: "Error: " + e.message})
    } finally {
      this.timeout(5000).then(() => this.setState({showQRScanner: true}))
    }
  }

  private timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const
    styles = StyleSheet.create({
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
    })


export default App


