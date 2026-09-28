const crypto = require('crypto');

const KEY = 'PRIVATE_KEY_ENCRYPTION_SECRET';

function getKeyBytes() {
    return Buffer.from(process.env[KEY].trim(), 'hex');
}

function encryptCompanyPrivateKey(privateKeyHex) {
    const key = getKeyBytes();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([
        cipher.update(privateKeyHex, 'utf8'),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return JSON.stringify({
        v: 1,
        iv: iv.toString('base64'),
        ciphertext: ciphertext.toString('base64'),
        tag: tag.toString('base64'),
    });
}

function decryptCompanyPrivateKey(storedJson) {
    const key = getKeyBytes();
    const payload = JSON.parse(storedJson);
    const iv = Buffer.from(payload.iv, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
    return (
        decipher.update(payload.ciphertext, 'base64', 'utf8') + decipher.final('utf8')
    );
}

module.exports = {
    encryptCompanyPrivateKey,
    decryptCompanyPrivateKey
};
