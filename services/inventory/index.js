const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const products = require('./products.json');
const fs = require('fs');
const path = require('path');

const packageDefinition = protoLoader.loadSync('proto/inventory.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const inventoryProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(inventoryProto.InventoryService.service, {
    searchAllProducts: (_, callback) => {
        callback(null, {
            products: products,
        });
    },
    SearchProductByID: (payload, callback) => {
        callback(
            null,
            products.find((product) => product.id == payload.request.id)
        );
    },
    Comprar: (Produto, callback) => {
        const produtos = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'products.json')));
        const index = produtos.findIndex(productJson => productJson.id == Produto.request.id);
        produtos[index].quantity -= Produto.request.quantity;
        fs.writeFileSync(path.resolve(__dirname, 'products.json'), JSON.stringify(produtos, null, 2));
        return callback(null, produtos);
    },
    Adicionar: (Produto, callback) => {
        const produtos = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'products.json')));
        const index = produtos.findIndex(productJson => productJson.id == Produto.request.id);
        produtos[index].quantity += Produto.request.quantity;
        fs.writeFileSync(path.resolve(__dirname, 'products.json'), JSON.stringify(produtos, null, 2));
        return callback(null, produtos);
    },
});

server.bindAsync('127.0.0.1:3002', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Inventory Service running at http://127.0.0.1:3002');
    server.start();
});