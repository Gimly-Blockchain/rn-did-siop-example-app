// This one goes to node_modules\@sphereon\did-auth-siop\dist\main\functions\Keys.js

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = exports.toSignatureObject = exports.getThumbprint = exports.getThumbprintFromJwk = exports.verifyJWTSignatureFromVerificationMethod = exports.getVerificationMethod = exports.getPublicJWKFromHexPrivateKey = exports.getPublicED25519JWKFromHexPrivateKey = exports.getBase58PrivateKeyFromHexPrivateKey = exports.getPublicJWKFromDIDHexPublicKey = exports.getPublicJWKFromHexPublicHex = exports.getHexPrivateKey = exports.isEd25519JWK = exports.isEd25519DidKeyMethod = void 0;
const did_key_ed25519_1 = require("@transmute/did-key-ed25519");
const bs58 = __importStar(require("bs58"));
const did_jwt_1 = require("did-jwt");
const elliptic_1 = require("elliptic");
const eth_crypto_1 = __importDefault(require("eth-crypto"));
const parse_1 = __importDefault(require("jose/dist/browser/jwk/parse"));
const verify_1 = __importDefault(require("jose/dist/browser/jwt/verify"));
const js_base64_1 = __importDefault(require("js-base64"));
const sha_js_1 = __importDefault(require("sha.js"));
const types_1 = require("../types");
const Errors_1 = __importDefault(require("../types/Errors"));
const Encodings_1 = require("./Encodings");
const ED25519_DID_KEY = 'did:key:z6Mk';
function isEd25519DidKeyMethod(did) {
    return did && did.includes(ED25519_DID_KEY);
}
exports.isEd25519DidKeyMethod = isEd25519DidKeyMethod;
function isEd25519JWK(jwk) {
    return jwk && jwk.crv && jwk.crv === types_1.SIOP.KeyCurve.ED25519;
}
exports.isEd25519JWK = isEd25519JWK;
function getHexPrivateKey(key) {
    const privateKeyHex = Buffer.from(key.d, 'base64').toString('hex');
    return `0x${privateKeyHex}`;
}
exports.getHexPrivateKey = getHexPrivateKey;
function getPublicJWKFromHexPublicHex(hexPublicKey, kid, method) {
    if (isEd25519DidKeyMethod(method)) {
        return getPublicJWKFromDIDHexPublicKey(hexPublicKey);
    }
    const ec = new elliptic_1.ec('secp256k1');
    const key = ec.keyFromPublic(hexPublicKey.replace('0x', ''), 'hex');
    const pubPoint = key.getPublic();
    return {
        kid,
        kty: types_1.SIOP.KeyType.EC,
        crv: types_1.SIOP.KeyCurve.SECP256k1,
        x: js_base64_1.default.fromUint8Array(pubPoint.getX().toArrayLike(Buffer), true),
        y: js_base64_1.default.fromUint8Array(pubPoint.getY().toArrayLike(Buffer), true),
    };
}
exports.getPublicJWKFromHexPublicHex = getPublicJWKFromHexPublicHex;
function getPublicJWKFromDIDHexPublicKey(hexPublicKey) {
    // Convert the key to base58 in order to get the jwk with another method from library Keys
    const publicKeyBase58 = did_key_ed25519_1.keyUtils.publicKeyBase58FromPublicKeyHex(hexPublicKey);
    return did_key_ed25519_1.keyUtils.publicKeyJwkFromPublicKeyBase58(publicKeyBase58);
}
exports.getPublicJWKFromDIDHexPublicKey = getPublicJWKFromDIDHexPublicKey;
function getBase58PrivateKeyFromHexPrivateKey(hexPrivateKey) {
    return did_key_ed25519_1.keyUtils.privateKeyBase58FromPrivateKeyHex(hexPrivateKey);
}
exports.getBase58PrivateKeyFromHexPrivateKey = getBase58PrivateKeyFromHexPrivateKey;
function getPublicED25519JWKFromHexPrivateKey(hexPrivateKey, kid) {
    const ec = new elliptic_1.ec('ed25519');
    const privKey = ec.keyFromPrivate(hexPrivateKey);
    const pubPoint = privKey.getPublic();
    return toJWK(kid, types_1.SIOP.KeyCurve.ED25519, pubPoint);
}
exports.getPublicED25519JWKFromHexPrivateKey = getPublicED25519JWKFromHexPrivateKey;
function getPublicSECP256k1JWKFromHexPrivateKey(hexPrivateKey, kid) {
    const ec = new elliptic_1.ec('secp256k1');
    const privKey = ec.keyFromPrivate(hexPrivateKey.replace('0x', ''), 'hex');
    const pubPoint = privKey.getPublic();
    return toJWK(kid, types_1.SIOP.KeyCurve.SECP256k1, pubPoint);
}
function getPublicJWKFromHexPrivateKey(hexPrivateKey, kid, did) {
    if (isEd25519DidKeyMethod(did)) {
        return getPublicED25519JWKFromHexPrivateKey(hexPrivateKey, kid);
    }
    return getPublicSECP256k1JWKFromHexPrivateKey(hexPrivateKey, kid);
}
exports.getPublicJWKFromHexPrivateKey = getPublicJWKFromHexPrivateKey;
function compareKidWithId(kid, elem) {
    // kid can be "kid": "H7j7N4Phx2U1JQZ2SBjczz2omRjnMgT8c2gjDBv2Bf0="
    // or "did:ethr:0x0106a2e985b1E1De9B5ddb4aF6dC9e928F4e99D0#keys-1
    if (kid.includes('did:') || kid.startsWith('#')) {
        return elem.id === kid;
    }
    return elem.id.split('#')[1] === kid;
}
function getVerificationMethod(kid, didDoc) {
    if (!didDoc || !didDoc.verificationMethod || didDoc.verificationMethod.length < 1) {
        throw new Error(Errors_1.default.ERROR_RETRIEVING_VERIFICATION_METHOD);
    }
    const { verificationMethod } = didDoc;
    // Get the kid from the publicKeyJwk, if it does not exist (verifyDidAuthRequest) compare with the id
    return verificationMethod.find((elem) => elem.publicKeyJwk ? elem.publicKeyJwk.kid === kid : compareKidWithId(kid, elem));
}
exports.getVerificationMethod = getVerificationMethod;
function verifyJWTSignatureFromVerificationMethod(jwt, verificationMethods) {
    const { header } = (0, did_jwt_1.decodeJWT)(jwt);
    let verificationMethod;
    if (header.alg === types_1.SIOP.KeyAlgo.EDDSA || header.alg === types_1.SIOP.KeyAlgo.EDDSA) {
        verificationMethod = verifyEDDSA(jwt, verificationMethods);
    }
    else if (header.alg === types_1.SIOP.KeyAlgo.ES256K) {
        verificationMethod = verifyES256K(jwt, verificationMethods) != null;
    }
    else {
        console.error(`Key algorithm not supported: ${header.alg}`);
    }
    return verificationMethod;
}
exports.verifyJWTSignatureFromVerificationMethod = verifyJWTSignatureFromVerificationMethod;
function toJWK(kid, crv, pubPoint) {
    return {
        kid,
        kty: types_1.SIOP.KeyType.EC,
        crv: crv,
        x: js_base64_1.default.fromUint8Array(pubPoint.getX().toArrayLike(Buffer), true),
        y: js_base64_1.default.fromUint8Array(pubPoint.getY().toArrayLike(Buffer), true),
    };
}
function getThumbprintFromJwkImpl(jwk) {
    const fields = {
        crv: jwk.crv,
        kty: jwk.kty,
        x: jwk.x,
        y: jwk.y,
    };
    const buff = (0, sha_js_1.default)('sha256').update(JSON.stringify(fields)).digest();
    return (0, Encodings_1.base64urlEncodeBuffer)(buff);
}
// from fingerprintFromPublicKey function in @transmute/Ed25519KeyPair
function getThumbprintFromJwkDIDKeyImpl(jwk) {
    // ed25519 cryptonyms are multicodec encoded values, specifically:
    // (multicodec ed25519-pub 0xed01 + key bytes)
    const pubkeyBytes = bs58.decode(did_key_ed25519_1.keyUtils.publicKeyBase58FromPublicKeyJwk(jwk));
    const buffer = new Uint8Array(2 + pubkeyBytes.length);
    buffer[0] = 0xed;
    buffer[1] = 0x01;
    buffer.set(pubkeyBytes, 2);
    // prefix with `z` to indicate multi-base encodingFormat
    return `z${bs58.encode(buffer)}`;
}
function getThumbprintFromJwk(jwk, did) {
    if (isEd25519DidKeyMethod(did)) {
        return getThumbprintFromJwkDIDKeyImpl(jwk);
    }
    else {
        return getThumbprintFromJwkImpl(jwk);
    }
}
exports.getThumbprintFromJwk = getThumbprintFromJwk;
function getThumbprint(hexPrivateKey, did) {
    return getThumbprintFromJwk(isEd25519DidKeyMethod(did)
        ? getPublicED25519JWKFromHexPrivateKey(hexPrivateKey)
        : getPublicJWKFromHexPrivateKey(hexPrivateKey), did);
}
exports.getThumbprint = getThumbprint;
function extractPublicKeyBytes(vm) {
    if (vm.publicKeyBase58) {
        return bs58.decode(vm.publicKeyBase58).toString('hex');
    }
    if (vm.publicKeyJwk) {
        return {
            x: (0, Encodings_1.isHexString)(vm.publicKeyJwk.x) ? vm.publicKeyJwk.x : (0, Encodings_1.base64ToHexString)(vm.publicKeyJwk.x),
            y: (0, Encodings_1.isHexString)(vm.publicKeyJwk.x) ? vm.publicKeyJwk.y : (0, Encodings_1.base64ToHexString)(vm.publicKeyJwk.y),
        };
    }
    throw new Error('No public key found!');
}
// converts a JOSE signature to it's components
function toSignatureObject(signature, recoverable = false) {
    const rawSig = (0, Encodings_1.base64ToBytes)(signature);
    if (rawSig.length !== (recoverable ? 65 : 64)) {
        throw new Error('wrong signature length');
    }
    const r = (0, Encodings_1.bytesToHexString)(rawSig.slice(0, 32));
    const s = (0, Encodings_1.bytesToHexString)(rawSig.slice(32, 64));
    const sigObj = { r, s };
    if (recoverable) {
        sigObj.recoveryParam = rawSig[64];
    }
    return sigObj;
}
exports.toSignatureObject = toSignatureObject;
function verifyES256K(jwt, verificationMethod) {
    const publicKey = extractPublicKeyBytes(verificationMethod);
    const secp256k1 = new elliptic_1.ec('secp256k1');
    const { data, signature } = (0, did_jwt_1.decodeJWT)(jwt);
    const hash = (0, sha_js_1.default)('sha256').update(data).digest();
    const sigObj = toSignatureObject(signature);
    return secp256k1.keyFromPublic(publicKey, 'hex').verify(hash, sigObj);
}
function verifyEDDSA(jwt, verificationMethod) {
    return __awaiter(this, void 0, void 0, function* () {
        let publicKey;
        if (verificationMethod.publicKeyBase58)
            publicKey = did_key_ed25519_1.keyUtils.publicKeyJwkFromPublicKeyBase58(verificationMethod.publicKeyBase58);
        if (verificationMethod.publicKeyJwk)
            publicKey = verificationMethod.publicKeyJwk;
        const result = yield (0, verify_1.default)(jwt, yield (0, parse_1.default)(publicKey, types_1.SIOP.KeyAlgo.EDDSA));
        if (!result || !result.payload)
            throw Error(Errors_1.default.ERROR_VERIFYING_SIGNATURE);
        return true;
    });
}
function encrypt(payload, publicKeyHex) {
    return __awaiter(this, void 0, void 0, function* () {
        const encrypted = yield eth_crypto_1.default.encryptWithPublicKey(publicKeyHex, JSON.stringify(payload));
        return eth_crypto_1.default.cipher.stringify(encrypted);
    });
}
exports.encrypt = encrypt;
function decrypt(privateKey, encrypted) {
    return __awaiter(this, void 0, void 0, function* () {
        const encryptedObject = eth_crypto_1.default.cipher.parse(encrypted);
        return eth_crypto_1.default.decryptWithPrivateKey(privateKey, encryptedObject);
    });
}
exports.decrypt = decrypt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiS2V5cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mdW5jdGlvbnMvS2V5cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZ0VBQXlFO0FBQ3pFLDJDQUE2QjtBQUM3QixxQ0FBb0M7QUFHcEMsdUNBQW9DO0FBQ3BDLDREQUFvQztBQUNwQywyREFBc0M7QUFDdEMsNkRBQXdDO0FBRXhDLDBEQUErQjtBQUMvQixvREFBeUI7QUFFekIsb0NBQWdDO0FBQ2hDLDZEQUF5QztBQUd6QywyQ0FBcUg7QUFFckgsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDO0FBRXZDLFNBQWdCLHFCQUFxQixDQUFDLEdBQVk7SUFDaEQsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBRkQsc0RBRUM7QUFFRCxTQUFnQixZQUFZLENBQUMsR0FBUTtJQUNuQyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEtBQUssWUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7QUFDN0QsQ0FBQztBQUZELG9DQUVDO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsR0FBUTtJQUN2QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25FLE9BQU8sS0FBSyxhQUFhLEVBQUUsQ0FBQztBQUM5QixDQUFDO0FBSEQsNENBR0M7QUFFRCxTQUFnQiw0QkFBNEIsQ0FBQyxZQUFvQixFQUFFLEdBQVksRUFBRSxNQUFlO0lBQzlGLElBQUkscUJBQXFCLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDakMsT0FBTywrQkFBK0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUN0RDtJQUNELE1B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