const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the proto file
const PROTO_PATH = path.join(__dirname, 'protos', 'main.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

// Load the package definition
const grpcPackage = grpc.loadPackageDefinition(packageDefinition).vtpl_grpc_server;

// Get gRPC server addresses from environment variables
const grpc_port = process.env.grpc_port || 'localhost:50051';

// Create the gRPC client for ChannelService
const channelServiceClient = new grpcPackage.ChannelService(
    grpc_port, 
    grpc.credentials.createInsecure() // Use insecure credentials for local testing
);

// Create the gRPC client for AdjustService
const adjustServiceClient = new grpcPackage.AdjustService(
    grpc_port,  
    grpc.credentials.createInsecure() // Use insecure credentials for local testing
);

// Create the gRPC client for ExtractService
const ExtractServiceClient = new grpcPackage.ExtractService(
    grpc_port,  
    grpc.credentials.createInsecure() // Use insecure credentials for local testing
);

// Export the clients
module.exports = {
    channelServiceClient,
    adjustServiceClient,
    ExtractServiceClient
};
