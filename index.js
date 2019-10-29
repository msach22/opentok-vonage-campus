const express = require('express');
const opentok = require('opentok');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express();

const { apiKey, apiSecret } = config;
const OT = new opentok(apiKey, apiSecret);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
    if (app.get('session')) {
        const sessionId = app.get('session');
        const token = OT.generateToken(sessionId, {
            data: 'cooler user',
        });
        res.render('index.ejs', {
            apiKey,
            sessionId,
            token,
        });
    } else {
        OT.createSession({
            mediaMode: 'routed',
        }, (err, session) => {
            if (err) {
                res.status(500).send('Error creating session');
            } else {
                const { sessionId } = session;
                app.set('session', sessionId);
                const token = OT.generateToken(sessionId, {
                    data: 'cool user',
                });
                res.render('index.ejs', {
                    apiKey,
                    sessionId,
                    token,
                });
            }
        });
    }
});

app.post('/startArchive', (req, res) => {
    if (app.get('session')) {
        const sessionId = app.get('session');
        OT.startArchive(sessionId, (err, archive) => {
            if (err) {
                res.status(500).send('Error starting session');
            } else {
                const archiveId = archive.id;
                app.set('archiveId', archiveId);
                res.json({
                    archiveId,
                });
            }
        });
    } else {
        res.status(400).send('No active session found');
    }
});

app.post('/stopArchive', (req, res) => {
    const stopArchive = (archiveId) => {
        OT.stopArchive(archiveId, (err, archive) => {
            if (err) {
                res.status(500).send('Error stopping archive');
            } else {
                res.status(200).send('OK');
            }
        });
    };
    let { archiveId } = req.body;
    if (archiveId) {
        stopArchive(archiveId);
    } else if (app.get('archiveId')) {
        archiveId = app.get('archiveId');
        stopArchive(archiveId);
    } else {
        res.status(400).send('No archiveId provided');
    }
});

app.post('/dial', (req, res) => {
    if (app.get('session')) {
        const sessionId = app.get('session');
        const sipToken = OT.generateToken(sessionId, {
            data: 'sipclient',
        });
        const sipUri = `sip:${config.nexmo.phoneNumber}@sip.nexmo.com`;
        const sipOptions = {
            auth: {
                username: config.nexmo.apiKey,
                password: config.nexmo.apiSecret,
            },
            headers: {
                'X-OPENTOK-SESSION-ID': sessionId,
            }
        };
        OT.dial(sessionId, sipToken, sipUri, sipOptions, (err, sipCall) => {
            if (err) {
                res.status(500).send('Error dialing out');
            } else {
                app.set('connectionId', sipCall.connectionId);
                res.status(200).send('OK');
            }
        });
    } else {
        res.status(400).send('No active session found');
    }
});

app.get('/event', (req, res) => {
    console.log('event', req.query);
    res.status(200).send('OK');
});

app.get('/answer', (req, res) => {
    console.log('answer', req.query);
    const ncco = [];
    if (app.get('session')) {
        const sessionId = app.get('session');
        if (req.query['SipHeader_X-OPENTOK-SESSION-ID'] === sessionId) {
            ncco.push({
                action: 'conversation',
                name: sessionId,
              });
        } else {
            ncco.push({
                  action: 'talk',
                  text: 'Please enter a a pin code to join the session'
                },
                {
                  action: 'input',
                  eventUrl: [`${config.serverUrl}/dtmf`]
            });
        }
    }
    res.json(ncco);
});

app.post('/dtmf', (req, res) => {
    const { dtmf } = req.body;
    let sessionId;
    if (dtmf === '1234' && app.get('session')) {
        sessionId = app.get('session');
    }
    const ncco = [
    {
      action: 'conversation',
      name: sessionId,
    }];
    res.json(ncco);
});

app.post('/hangup', (req, res) => {
    if (app.get('connectionId') && app.get('session')) {
        const connectionId = app.get('connectionId');
        const sessionId = app.get('session');
        OT.forceDisconnect(sessionId, connectionId, (err) => {
            if (err) {
                res.status(500).send('Error hanging up');
            } else {
                res.status(200).send('OK');
            }
        });
    } else {
        res.status(400).send('No active sip user found');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`listening to server at http://localhost:${PORT}`);
});
