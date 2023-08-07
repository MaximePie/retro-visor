/**
 * This file is not supposed to be pushed nor deployed
 * It is just a draft of the backend to paste in the AWS Lambda function editor
 */

const AWS = require('aws-sdk')

const api = new AWS.ApiGatewayManagementApi({
    endpoint: '579crp1edg.execute-api.us-east-1.amazonaws.com/production'
})

const dynamo = new AWS.DynamoDB.DocumentClient()

/**
 *
 * @type {{
 *    connectionId: string,
 *    username?: string
 * }[]}
 */
let connectedUsers = [];

exports.handler = async (event) => {
    const route = event.requestContext.routeKey
    const connectionId = event.requestContext.connectionId

    switch (route) {
        case '$connect':
            await saveConnectionId(connectionId)
            connectedUsers.push({connectionId});
            break
        case '$disconnect':
            // Delete connectionId from DynamoDB
            await onDisconnect(connectionId)
            connectedUsers = connectedUsers.filter(({connectionId: id}) => id !== connectionId);
            break
        case 'onConnect':
            await broadcastConnectedUsersList();
            break
        case 'message':
            console.log('Received message:', event.body)
            const body = JSON.parse(event.body)
            console.log(body.payload, body.payload?.type)
            switch (body.payload?.type) {
                case 'usernameChanged':
                    // Update username for current user
                    await updateUser({
                        connectionId: connectionId,
                        username: body.payload.username
                    })
                    await broadcastConnectedUsersList();
                    break;
                case 'rouletteStart':
                    console.log('Found Roulette start event')
                    await onRouletteStart(connectionId);
                    break;
                case 'sendComment': // Add a comment to the base
                    console.log('Send comment');
                    await sendComment(connectionId, body.payload.comment);
                    break;

            }

            break
        case 'createChannel':
            console.log('Received message:', event.requestContext.body)
            await createChannel(event.requestContext.body);
            break
        default:
            console.log('Received unknown route:', route)
            break;
    }

    return {
        statusCode: 200
    }
}

/**
 * Save a comment in DynamoDB
 * Broadcast the comment to all connected users
 * @param connectionId
 * @param comment: string
 * @return {Promise<void>}
 */
async function sendComment(connectionId, comment) {
    const params = {
        TableName: 'retrovisor',
        Item: {
            PK: 'Comment',
            SK: 'Author#'+connectionId,
            comment: comment,
            savedAt: new Date().toISOString()
        }
    }

    await dynamo.put(params).promise();

    const message = {
        messages: {
            comment: comment,
            authorName: connectedUsers.find(({connectionId: id}) => id === connectionId).username
        },
        type: 'commentSent',
    }

    await broadcastMessage(message);
}

async function broadcastConnectedUsersList() {
    await broadcastMessage({
        messages: {
            connectedUsers: connectedUsers.map(({ connectionId, username }) => ({
                connectionId,
                username
            })),
            message: 'New user connected'
        },
        type: 'afterConnect'
    })
}

/**
 * Get username from connectionId
 * Get duration form payload
 * Broadcast message to all connected users
 * @param userId User ID
 * @return {Promise<void>}
 */
async function onRouletteStart(userId) {
    console.log('onRouletteStart', userId);
    const user = await getUserById(userId);
    const duration =  Math.floor(Math.random() * 4000) + 1000;
    const message = {
        messages: {
            initiator: user.username,
            duration: duration
        },
        type: 'rouletteStarted'
    }
    await broadcastMessage(message);
}

async function getUserById(userId) {
    const params = {
        TableName: 'retrovisor',
        KeyConditionExpression: 'PK = :pk and SK = :sk',
        ExpressionAttributeValues: {
            ':pk': 'connectionId',
            ':sk': 'connectionId#'+userId
        }
    }

    const result = await dynamo.query(params).promise();
    return result.Items[0];
}

/**
 * Update username for current user
 * @param connectionId
 * @param username
 * @return {Promise<void>}
 */
async function updateUser({ connectionId, username }) {
    const sk = 'connectionId#'+connectionId;
    const params = {
        TableName: 'retrovisor',
        Key: {
            PK: 'connectionId',
            SK: 'connectionId#'+connectionId,
        },
        UpdateExpression: 'set username = :username',
        ExpressionAttributeValues: {
            ':username': username
        },
        ReturnValues: 'UPDATED_NEW'
    }

    await dynamo.update(params).promise()
    connectedUsers = connectedUsers.map(user => {
        if (user.connectionId === connectionId) {
            user.username = username;
        }
        return user;
    });
}

async function saveConnectionId(connectionId) {
    const params = {
        TableName: 'retrovisor',
        Item: {
            PK: 'connectionId',
            SK: 'connectionId#'+connectionId,
            connectionId: connectionId,
        },
    }

    await dynamo.put(params).promise()
}

/**
 * Broadcast message to all connected users
 * @param message {
 *     messages: any,
 *     type: string
 * } Message to broadcast
 * @return {Promise<void>}
 */
async function broadcastMessage(message) {
    // const connections = await getConnectedUsers()
    console.log('Broadcasting message', JSON.stringify(message))
    const postCalls = connectedUsers.map(async ({ connectionId }) => {
        try {
            return await postToConnection(message, connectionId)
        }
        catch (e) {
            if (e.statusCode === 410) {
                console.log(`Found stale connection, deleting ${connectionId}`)
                await onDisconnect(connectionId)
            }
            else {
                throw e
            }
        }
    })

    await Promise.all(postCalls)
}

/**
 * Delete connectionId from DynamoDB
 * @param connectionId Connection ID
 * @return {Promise<void>}
 */
async function onDisconnect(connectionId) {
    const params = {
        TableName: 'retrovisor',
        Key: {
            PK: 'connectionId',
            SK: 'connectionId#'+connectionId,
        },
    }

    await dynamo.delete(params).promise()
}

/**
 * Create a channel
 * @return {Promise<void>}
 */
async function createChannel(){

}

async function postToConnection(message, connectionId) {
    console.log('Posting', JSON.stringify(message), 'to', connectionId);
    const params = {
        ConnectionId: connectionId,
        Data: JSON.stringify(message),
    }

    return api.postToConnection(params).promise()
}



/**
 * Connexion ?
 * - Renvoyer la liste des salons
 *
 * Changer de nom ?
 * - Stocker le nom de l'utilisateur
 *
 * Choix d'un channel ?
 * - Stocker le nom du channel
 *
 * Créer un channel ?
 * - Stocker le nom du channel (PK=Channel, name)
 *
 * Récupérer tous les users dans un channel
 * GSI sur currentChannel
 *
 * Récupérer le channel d'un user
 * Channel GSI sur ownerConnectionId
 */