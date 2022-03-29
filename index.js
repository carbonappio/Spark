const express = require('express')
const rateLimit = require("express-rate-limit");
const helmet = require('helmet')
const app = express()

const Axios = require("axios").default;

const axios = Axios.create({
    headers: {
        post: {
            Via: "CarbonSpark/1.0"
        },
        get: {
            Via: "CarbonSpark/1.0"
        },
        patch: {
            Via: "CarbonSpark/1.0"
        },
        delete: {
            Via: "CarbonSpark/1.0"
        }
    }
})

app.set('trust proxy', 1)
app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 75, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
    handler:(req, res) => {
        res.status(429).send({
            success: false,
            message: 'Too Many Requests'
        })
    }
})

app.get('/', (req, res) => {
    res.status(200).send({
        success: true,
        documentation: ''
    })
})

app.get("/api/webhooks/:id/:token", (req, res) => {
    let Id = req.params['id']
    let Token = req.params['token']

    axios.get(`https://discordapp.com/api/webhooks/${Id}/${Token}`).then(data => { 
        res.status(data.status).send(data.data)
    }).catch(err => {
        res.status(err.response.status).send(err.response.data)
    })
})

app.post("/api/webhooks/:id/:token", limiter, (req, res) => {
    console.log(req.body);
    axios.post(`https://discord.com/api/webhooks/${req.params.id}/${req.params.token}`, req.body).then(result => {
        res.send(result.data);
    }).catch(err => {
        res.status(err.response.status).send(err.response.data);
    })
})

app.patch("/api/webhooks/:id/:token/messages/:messageId", limiter, (req, res) => {
    axios.patch(`https://discord.com/api/webhooks/${req.params.id}/${req.params.token}/messages/${req.params.messageId}`, req.body).then(result => {
        res.send(result.data);
    }).catch(err => {
        res.status(err.response.status).send(err.response.data);
    })
})

app.delete("/api/webhooks/:id/:token/messages/:messageId", limiter, (req, res) => {
    axios.delete(`https://discord.com/api/webhooks/${req.params.id}/${req.params.token}/messages/${req.params.messageId}`).then(result => {
        res.send(result.data);
    }).catch(err => {
        res.status(err.response.status).send(err.response.data);
    })
})

app.listen(4000, () => {
    console.log('Available')
})