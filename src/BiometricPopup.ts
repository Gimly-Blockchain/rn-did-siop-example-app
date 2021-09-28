import {Component} from 'react';

import FingerprintScanner, {Biometrics} from 'react-native-fingerprint-scanner';


export type BiometricPopupProps = {
  description?: string
  onAuthenticate: () => void
}

class BiometricPopup extends Component<BiometricPopupProps> {

  constructor(props: BiometricPopupProps) {
    super(props);
    this.state = {
      errorMessageLegacy: undefined,
      biometricLegacy: undefined
    };
  }

  componentDidMount() {
    this.auth();
  }

  componentWillUnmount = () => {
    FingerprintScanner.release();
  }

  auth() {
    FingerprintScanner
        .authenticate({description: this.props.description || 'Log in with Biometrics'})
        .then(() => {
          this.props.onAuthenticate()
        });
  }

  render = () => {
    return null;
  }
}

export default BiometricPopup;