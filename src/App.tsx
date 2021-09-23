/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import '../shim'
import 'react-native-get-random-values'
import React, {Component} from "react"
import {StyleSheet, Text, Vibration,} from "react-native"
import GimlyIDQRCodeScanner, {QRContent} from "gimlyid-qr-code-scanner"
import axios from "axios"
import {OP} from "@sphereon/did-auth-siop/dist/main/OP"
import {
  AuthenticationResponseOpts,
  AuthenticationResponseWithJWT,
  PassBy,
  ResponseMode,
  VerificationMode,
  VerifyAuthenticationRequestOpts
} from "@sphereon/did-auth-siop/dist/main/types/SIOP.types"

const EXAMPLE_REFERENCE_URL = "https://rp.acme.com/siop/jwts" // FIXME to env
const HEX_KEY = "c848751f600a9b8b91e3db840d75be2304b0ec4b9b15fe77d87d3eed9a007d1a";
const DID = "did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489";


export type AppState = {
  showQRScanner?: boolean,
  message?: string
}

class App extends Component<AppState> {

  state: AppState = {
    message: "Processing"
  }


  constructor(props: AppState, context: any) {
    super(props, context);
  }

  componentDidMount() {
    this.setState({showQRScanner: true})
  }


  render() {
    const showQRScanner = this.state.showQRScanner as Boolean;
    if (showQRScanner) {
      return (
          <GimlyIDQRCodeScanner style={{flex: 1, width: '100%'}} onRead={(qrContent: QRContent) => {
            this.startAuthenticationFlow(qrContent)
          }
          }/>
      );
    } else {
      return (<Text>{this.state.message}</Text>)
    }
  }

  private startAuthenticationFlow(qrContent: QRContent) {
    this.setState({showQRScanner: false})
    Vibration.vibrate(500)
    this.getAuthenticationRequestFromRP(qrContent);
  }


  private getAuthenticationRequestFromRP(qrContent: QRContent) {
    const getRequestUrl = qrContent.redirectUrl + "?stateId=" + qrContent.state;
    console.log("getRequestUrl", getRequestUrl);
    axios.get(getRequestUrl)
        .then(response => {
          console.log("response.status", response.status);
          if (response.status == 200) {
            const uriDecoded = decodeURIComponent(response.data as string);
            const requestURI = this.objectFromURI(uriDecoded)
            this.verifyAuthenticationRequestURI(requestURI)
          } else {
            this.setState({message: "Error: " + response.statusText})
          }
        })
        .catch(error => {
          let message = "Error: " + error;
          if (error.response) {
            message += " - " + error.response.data
          }
          this.setState({message: message})
        })
        .finally(() => {
              this.timeout(5000).then(() => this.setState({showQRScanner: true}))
            }
        )
  }

  private verifyAuthenticationRequestURI(requestURI: any) {
    try {
      const responseOpts: AuthenticationResponseOpts = {
        signatureType: {
          hexPrivateKey: HEX_KEY,
          did: DID
        },
        registration: {
          registrationBy: {
            type: PassBy.VALUE,
          },
        },
        responseMode: ResponseMode.POST,
        did: DID,
        expiresIn: 2000
      };

      const verifyOpts: VerifyAuthenticationRequestOpts = {
        verification: {
          mode: VerificationMode.INTERNAL,
          resolveOpts: {
            didMethods: ["ethr"]
          }
        },
        nonce: requestURI.nonce
      }

      const op = OP.fromOpts(responseOpts, verifyOpts);
      const jwt = requestURI.request;
      op.verifyAuthenticationRequest(jwt, {audience: DID})
          .then((verifiedRequest) => {
            console.log("signer did:", verifiedRequest.signer.id)
            this.sendAuthResponse(op, jwt, requestURI);
          })
          .catch(reason => {
            console.error("verifyRequest failed", reason)
            this.setState({message: "Error: " + reason})
          })
    } catch (e) {
      console.error("verifiedRequest failed", e.message)
      this.setState({message: "Error: " + e.message})
    }
  }

  private sendAuthResponse(op: OP, requestJwt: string, requestURI: any) {
    op.createAuthenticationResponse(requestJwt)
        .then((authResponse: AuthenticationResponseWithJWT) => {
          axios.post(requestURI.redirect_uri, authResponse)
              .then(response => {
                if (response.status == 200) {
                  this.setState({message: "Login successful!"})
                } else {
                  console.error(`Error ${response.status}: ${response.statusText}`)
                  this.setState({message: `Error posting to ${requestURI.redirect_uri}: ${response.statusText}`})
                }
              })
              .catch(reason => {
                console.error("verifyRequest failed", reason)
                this.setState({message: "Error: " + reason})
              })
        })
        .catch(reason => {
          console.error("verifyRequest failed", reason)
          this.setState({message: "Error: " + reason})
        })
  }

  private timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private objectFromURI(uriDecoded: string) {
    return JSON.parse('{"' + uriDecoded.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
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
});


export default App;


