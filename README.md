# OpenTok Vonage Campus

This application shows how to connect to an OpenTok session, publish a stream, subscribe to **multiple streams**, archive the session, and use OpenTok SIP Interconnect with [Nexmo](https://nexmo.com/) SIP Connect and Voice API to create an audio conference with PSTN users.

## Prerequisites:

* Node.js
* NPM

## Installation

1. Clone this repo

2. In your terminal, run `npm install`


## Set up

1. Create a file called `config.js`. You can copy the `config.example.js` template that's provided in this repo.
2. Add the OpenTok & Nexmo credentials to your `config.js` file. The file should look something like this:

```js
module.exports = {
    apiKey: '', // OpenTok API Key
    apiSecret: '', // OpenTok API Secret
    nexmo: {
        apiKey: '', // Nexmo API Key
        apiSecret: '', // Nexmo API Secret
        phoneNumber: '', // Nexmo Phone Number
    },
    serverUrl: '', // Your server URL
};
```

## Running the application

1. In your terminal, run: `node index.js`