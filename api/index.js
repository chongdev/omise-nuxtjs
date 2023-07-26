const express = require('express');
const cors = require('cors');

const app = express();
const router = express.Router();
const omise = require('omise')({
    secretKey: process.env.OMISE_SECRET_KEY,
});

const omiseCreateCharge = async (payload) => {
    return await omise.charges.create(payload);
}

app.use(cors());
app.use(express.json());

router.get('/hello', (req, res) => {
    const { name } = req.query;
    res.json({ message: 'Hello! ' + name });
});

router.post('/omise/checkout', async (req, res) => {
    // res.set({ 'Content-Type': 'text/json' });
    const payload = req.body;

    // payload.return_uri=https://example.com/callback

    const charge = await omiseCreateCharge(payload);
    res.json({ message: 'Checkout', data: charge });
});

app.use(router);

module.exports = {
    path: '/api',
    handler: app
};