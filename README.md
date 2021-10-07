<h1 align="center">
     <center><a href="https://www.gimly.io/"><img src="https://avatars.githubusercontent.com/u/64525639?s=200&v=4" alt="Gimly" width="120" style="vertical-align: middle"></a> &nbsp;and &nbsp; <a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="320" style="vertical-align: middle" ></a></center>
  <br>A demo DID SIOP V2 Authenticator mobile app    
  <br>
</h1>

####This is a demo app written using React Native to test and showcase the the ["Self Issued OpenID Provider v2 (SIOP)" library](https://github.com/Sphereon-Opensource/did-auth-siop)

Please note that this is not meant as a product or production use case. It is making assumptions for demoing the components involved.


### To build
- yarn install
- yarn nodeify

### To load to your mobile
- Make sure you have the Android platform SDK installed on your computer, your mobile is plugged in and in debug mode.
- Execute adb devices and confirm your device is listed
- yarn android


#### Usage
This app was created for use with the [did-siop-auth-web-demo](https://github.com/Sphereon-Opensource/did-siop-auth-web-demo)
Once the demo app has loaded, you will land in camera mode. Now you can scan a QR code from the screen,
after which you are prompted for approval by biometrics like the fingerprint scanner or face recognition.

When approved the demo website will grant you access to the protected sections.
