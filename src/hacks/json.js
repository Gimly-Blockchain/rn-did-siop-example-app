// This one goes to node_modules/multiformats/cjs/src/codecs/json.js

'use strict';
import * as encoding from 'text-encoding';
Object.defineProperty(exports, '__esModule', { value: true });

const textEncoder = new encoding.TextEncoder();
const textDecoder = new encoding.TextDecoder();
const name = 'json';
const code = 512;
const encode = node => textEncoder.encode(JSON.stringify(node));
const decode = data => JSON.parse(textDecoder.decode(data));

exports.code = code;
exports.decode = decode;
exports.encode = encode;
exports.name = name;
