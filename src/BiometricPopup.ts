import {Component} from 'react';

import FingerprintScanner from 'react-native-fingerprint-scanner';


export type BiometricPopupProps = {
  description?: string
  onAuthenticate: () => void
  onCancel: (reason: any) => void
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
        }).catch(reason => {
      this.props.onCancel(reason)
    });
  }

  render = () => {
    return null;
  }
}

export default BiometricPopup;