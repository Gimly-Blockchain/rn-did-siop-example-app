<h1 align="center">
  <br>
  <a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="400"></a>
  <br>A demo DID SIOP autenticator mobile app    
  <br>
</h1>

####This is a demo app written using React Native to test and showcase the the ["Sphereon Self Issued OpenID Provider v2 (SIOP)" library](https://github.com/Sphereon-Opensource/did-auth-siop)


### To build
- yarn install
- yarn nodeify

### To load to your mobile
- Make sure you have the Android platform SDK installed on your computer, your mobile is plugged in and in debug mode.
- Execute adb devices and confirm your device is listed
- yarn android


#### Usage
This app was created for use with the [onto-web-demo site](https://github.com/Sphereon-OpenSource/onto-web-demo)
Once the demo app has loaded, you will land in camera mode. Now you can scan a QR code from the screen,
after which you are prompted for approval by biometrics like the fingerprint scanner or face recognition.

When approved the demo website will grant you access to the protected sections.
