const net = require('net');
const iso8583 = require('./iso8583');

let client = null;

// Function to connect to the server or return existing connection
const connectToIswServer = () => {
  if (!client) {
    // Define server details
    const serverHost = process.env.INTERSWITCH_SERVER_HOST;
    const serverPort = process.env.INTERSWITCH_SERVER_PORT;

    // Create a TCP client
    client = new net.Socket();

    client.connect(serverPort, serverHost, function () {
      console.log('Connected to Interswitch server');
    });

    client.on('data', function (data) {
      console.log({ data });
      // console.log('Received response from server:', data.toString());
      // Further processing of the data
      // If the response is an ISO 8583 message, you'll need to unpack it
      const responseMessage = new iso8583().getIsoJSON(data);
      console.log('Received response from ISW server :', JSON.stringify(responseMessage));
      // Process the unpacked message

      // To signal the server that no more data will be sent by the client
      client.end();

      // To fully close the socket
      client.destroy();
    });

    client.on('close', function () {
      console.log('Interswitch connection closed');
    });
  }

  return client;
};

module.exports = connectToIswServer;
