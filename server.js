const express = require('express');
const app = express();
const crypto = require('crypto');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World')
});

app.get('/about', (req, res) => {
  res.send('About route 🎉 ')
});

app.post('/api/getdecryptedkey', (request, response) => {
    console.log("Request Body", request.body);
    const privateKey1 = crypto.createPrivateKey({
        key: Buffer.from(request.body.enc_priv_key, 'base64'),
        format: 'der',
        type: 'pkcs8',
    });

    const publicKey2 = crypto.createPublicKey({
        key: Buffer.from(request.body.ondc_pub_key, 'base64'),
        format: 'der',
        type: 'spki',
    });
    
    const sharedKey12 = crypto.diffieHellman({
        privateKey: privateKey1,
        publicKey: publicKey2,
    });
    
    const iv = Buffer.alloc(0); // ECB doesn't use IV
    const decipher = crypto.createDecipheriv('aes-256-ecb', sharedKey12, iv);

    let decrypted = decipher.update(request.body.challenge, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    console.log('Decrypted crypto key:', decrypted);
    response.json({ decrypted_key: decrypted });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
