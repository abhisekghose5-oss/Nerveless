const { generateKeyPairSync } = require("crypto");
const fs = require("fs");
const path = require("path");

// output directory for generated keys
const outDir = path.join(__dirname, "..", "secrets");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log("Generating RSA 2048 keypair for JWT (RS256)...");
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const privPath = path.join(outDir, "jwt_private.pem");
const pubPath = path.join(outDir, "jwt_public.pem");
fs.writeFileSync(privPath, privateKey, { mode: 0o600 });
fs.writeFileSync(pubPath, publicKey, { mode: 0o644 });

console.log("Saved private key to", privPath);
console.log("Saved public key to", pubPath);
console.log(
  "Add the private key to your production secret manager or set JWT_PRIVATE_KEY_PATH to this file."
);
