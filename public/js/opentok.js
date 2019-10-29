let archiveId;
const handleError = error => console.log(error);

const session = OT.initSession(apiKey, sessionId);

session.on({
    connectionCreated: event => {
        console.log('connection created', event);
    },
    connectionDestroyed: event => {
        console.log('connection destroyed', event);
    },
    streamCreated: event => {
        console.log('stream created', event);
        session.subscribe(event.stream, 'subscriber');
    },
    streamDestroyed: event => {
        console.log('stream destroyed', event);
    },
});

const publisher = OT.initPublisher('publisher', handleError);

session.connect(token, (err) => {
    if (!err) {
        session.publish(publisher);
    }
});

const handleStartArchive = async () => {
    console.log('starting archive');
    try {
        const response = await fetch('/startArchive', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const responseJson = await response.json();
        archiveId = responseJson.archiveId;
    } catch(error) {
        handleError(error);
    }
};

const handleStopArchive = async () => {
    console.log('stopping archive');
    try {
        const response = await fetch('/stopArchive', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                archiveId,
            }),
        });
        await response.text();
    } catch(error) {
        handleError(error);
    }
};

const handleDial = async () => {
    try {
        const response = await fetch('/dial', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        await response.text();
    } catch(error) {
        handleError(error);
    }
};

const handleHangup = async () => {
    try {
        const response = await fetch('/hangup', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        await response.text();
    } catch(error) {
        handleError(error);
    }
};

window.onload = () => {
    document.getElementById('startArchive').addEventListener('click', handleStartArchive);
    document.getElementById('stopArchive').addEventListener('click', handleStopArchive);
    document.getElementById('dial').addEventListener('click', handleDial);
    document.getElementById('hangup').addEventListener('click', handleHangup);
};