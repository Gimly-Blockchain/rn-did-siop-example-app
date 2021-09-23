/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import '../shim';
import 'react-native-get-random-values';
import {OP} from '@sphereon/did-auth-siop/dist/main/OP';
import {
  AuthenticationRequestPayload,
  AuthenticationResponseOpts,
  AuthenticationResponseWithJWT,
  PassBy,
  ResponseMode,
  VerificationMode,
  VerifyAuthenticationRequestOpts,
} from '@sphereon/did-auth-siop/dist/main/types/SIOP.types';
import axios from 'axios';
import GimlyIDQRCodeScanner, {QRContent} from 'gimlyid-qr-code-scanner';
import React, {Component} from 'react';
import {Text, Vibration} from 'react-native';

import { objectFromURI, timeout } from "./functions";
import {AppState} from './types';

const HEX_KEY =
  'c848751f600a9b8b91e3db840d75be2304b0ec4b9b15fe77d87d3eed9a007d1a';
const DID = 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489';

class App extends Component {
  state: AppState = {
    message: 'Processing',
  };

  componentDidMount() {
    this.setState({showQRScanner: true});
  }

  render() {
    const showQRScanner = this.state.showQRScanner as boolean;
    if (showQRScanner) {
      return (
        <GimlyIDQRCodeScanner
          style={{flex: 1, width: '100%'}}
          onRead={(qrContent: QRContent) => {
            this.startAuthenticationFlow(qrContent);
          }}
        />
      );
    } else {
      return <Text>{this.state.message}</Text>;
    }
  }

  private startAuthenticationFlow(qrContent: QRContent) {
    this.setState({showQRScanner: false});
    Vibration.vibrate(500);
    this.getAuthenticationRequestFromRP(qrContent);
  }

  private getAuthenticationRequestFromRP(qrContent: QRContent) {
    const getRequestUrl: string = qrContent.redirectUrl + '?stateId=' + qrContent.state;
    axios
      .get(getRequestUrl)
      .then((response) => {
        if (response.status == 200) {
          const uriDecoded = decodeURIComponent(response.data as string);
          const requestURI = objectFromURI(uriDecoded);
          this.verifyAuthenticationRequestURI(requestURI);
        } else {
          this.setState({message: `Error: ${response.statusText}`});
        }
      })
      .catch((error) => {
        let message = `Error: ${error}`;
        if (error.response) {
          message += ` - ${error.response.data}`;
        }
        this.setState({message});
      })
      .finally(() => {
        timeout(5000).then(() => this.setState({showQRScanner: true}));
      });
  }

  private verifyAuthenticationRequestURI(requestURI: any) {
    try {
      const {responseOpts, verifyOpts} = this.getOpts(requestURI);
      const op = OP.fromOpts(responseOpts, verifyOpts);
      const jwt = requestURI.request;
      op.verifyAuthenticationRequest(jwt, {audience: DID})
        .then(() => {
          this.sendAuthResponse(op, jwt, requestURI);
        })
        .catch((reason) => {
          this.setState({message: `Error: ${reason}`});
        });
    } catch (e) {
      this.setState({message: `Error: ${e.message}`});
    }
  }

  private getOpts(requestURI: AuthenticationRequestPayload) {
    const responseOpts: AuthenticationResponseOpts = {
      signatureType: {
        hexPrivateKey: HEX_KEY,
        did: DID,
      },
      registration: {
        registrationBy: {
          type: PassBy.VALUE,
        },
      },
      responseMode: ResponseMode.POST,
      did: DID,
      expiresIn: 2000,
    };

    const verifyOpts: VerifyAuthenticationRequestOpts = {
      verification: {
        mode: VerificationMode.INTERNAL,
        resolveOpts: {
          didMethods: ['ethr'],
        },
      },
      nonce: requestURI.nonce,
    };
    return {responseOpts, verifyOpts};
  }

  private sendAuthResponse(op: OP, requestJwt: string, requestURI: AuthenticationRequestPayload) {
    op.createAuthenticationResponse(requestJwt)
      .then((authResponse: AuthenticationResponseWithJWT) => {
        axios
          .post(requestURI.redirect_uri, authResponse)
          .then((response: any) => {
            if (response.status == 200) {
              this.setState({message: 'Login successful!'});
            } else {
              this.setState({
                message: `Error posting to ${requestURI.redirect_uri}: ${response.statusText}`,
              });
            }
          })
          .catch((reason) => {
            this.setState({message: `Error: ${reason}`});
          });
      })
      .catch((reason) => {
        this.setState({message: `Error: ${reason}`});
      });
  }
}

export default App;
