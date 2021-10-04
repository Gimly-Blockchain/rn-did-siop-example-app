import React, {Component} from 'react'
import {Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import FingerprintScanner, {Biometrics} from 'react-native-fingerprint-scanner'

export type BiometricPopupProps = {
  description?: string
  onAuthenticate: () => void
  onCancel: (reason: any) => void
}

export type BiometricPopupState = {
  errorMessageLegacy?: string
  biometricLegacy?: Biometrics
}

class BiometricPopup extends Component<BiometricPopupProps, BiometricPopupState> {

  state: BiometricPopupState = {}
  private descriptionText?: Text;

  constructor(props: BiometricPopupProps) {
    super(props);
  }

  componentDidMount() {
    if (this.requiresLegacyAuthentication()) {
      this.authLegacy();
    } else {
      this.auth23Plus();
    }
  }

  componentWillUnmount = () => {
    FingerprintScanner.release();
  }

  auth23Plus() {
    FingerprintScanner
        .authenticate({description: this.props.description || 'Log in with Biometrics'})
        .then(() => {
          this.props.onAuthenticate()
        }).catch(reason => {
      this.props.onCancel(reason)
    });
  }


  authLegacy() {
    FingerprintScanner
        .authenticate({onAttempt: this.handleAuthenticationAttemptedLegacy})
        .then(() => {
          this.props.onAuthenticate();
        })
        .catch((error) => {
          this.setState({errorMessageLegacy: error.message, biometricLegacy: error.biometric});
        });
  }


  private handleAuthenticationAttemptedLegacy = (error: Error) => {
    this.setState({errorMessageLegacy: error.message});
  };

  renderLegacy() {
    const {errorMessageLegacy, biometricLegacy} = this.state;
    const {onCancel} = this.props;

    return (
        <View style={styles.container}>
          <View style={[styles.contentContainer, styles.popup]}>

            <Image
                style={styles.logo}
                source={require('./assets/finger_print.png')}
            />

            <Text style={styles.heading}>
              Biometric{'\n'}Authentication
            </Text>
            <Text
                ref={(instance) => {
                  this.descriptionText = instance as Text;
                }}>
              {errorMessageLegacy || `Scan your ${biometricLegacy} on the\ndevice scanner to continue`}
            </Text>

            <TouchableOpacity
                style={styles.buttonContainer}
                onPress={onCancel}
            >
              <Text style={styles.buttonText}>
                CANCEL
              </Text>
            </TouchableOpacity>

          </View>
        </View>
    );
  }

  render = () => {
    if (this.requiresLegacyAuthentication()) {
      return this.renderLegacy();
    }
    return null;
  }


  requiresLegacyAuthentication() {
    return Platform.Version < 23;
  }
}

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 164, 222, 0.9)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    marginVertical: 45,
  },
  heading: {
    textAlign: 'center',
    color: '#00a4de',
    fontSize: 21,
  },
  buttonContainer: {
    padding: 20,
  },
  buttonText: {
    color: '#8fbc5a',
    fontSize: 15,
    fontWeight: 'bold',
  },
  popup: {
    width: width * 0.8,
  }
})

export default BiometricPopup;