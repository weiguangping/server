"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var ws_1 = require("ws");
var app = express();
app.use('/', express.static(path.join(__dirname, '../', 'client')));
var Product = /** @class */ (function () {
    function Product(id, title, price, rating, desc, categories, src) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categories = categories;
        this.src = src;
    }
    return Product;
}());
exports.Product = Product;
var products = [
    new Product(1, "第1个商品", 11.99, 3.5, "这是第1个商品,是我学习的时候使用的", "分类1", "http://placehold.it/800x300"),
    new Product(2, "第2个商品", 12.99, 3.5, "这是第2个商品,是我学习的时候使用的", "分类2", "http://placehold.it/800x300"),
    new Product(3, "第3个商品", 51.99, 3.5, "这是第3个商品,是我学习的时候使用的", "分类3", "http://placehold.it/800x300"),
    new Product(4, "第4个商品", 31.99, 3.5, "这是第4个商品,是我学习的时候使用的", "分类4", "http://placehold.it/800x300"),
    new Product(5, "第5个商品", 101.99, 3.5, "这是第5个商品,是我学习的时候使用的", "分类5", "http://placehold.it/800x300"),
    new Product(6, "第6个商品", 21.99, 3.5, "这是第6个商品,是我学习的时候使用的", "分类6", "http://placehold.it/800x300"),
];
var Comment = /** @class */ (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var comments = [
    new Comment(1, 1, "2017-02-02 22:22:22", "张三", 3, "东西不错"),
    new Comment(2, 2, "2017-02-02 22:22:22", "李四", 4, "东西不错"),
    new Comment(3, 3, "2017-09-02 22:22:22", "王五", 2, "东西不错"),
    new Comment(4, 4, "2017-04-02 22:22:22", "赵六", 1, "东西不错"),
    new Comment(5, 5, "2017-05-02 22:22:22", "马七", 5, "东西不错"),
];
// app.get('/',(req,res)=>{
//     res.send("Hello Express");
// });
app.get('/api/products', function (req, res) {
    var result = products;
    var params = req.query;
    console.log(params);
    if (params.title) {
        result = result.filter(function (p) { return p.title.indexOf(params.title) !== -1; });
    }
    if (params.price && result.length > 0) {
        result = result.filter(function (p) { return p.price <= parseInt(params.price); });
    }
    if (params.category && params.category !== "-1" && result.length > 0) {
        result = result.filter(function (p) { return p.categories.indexOf(params.category) !== -1; });
    }
    res.json(result);
});
app.get('/api/products/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == req.params.id; }));
});
app.get('/api/products/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == req.params.id; }));
});
var server = app.listen(8000, "localhost", function () {
    console.log("服务启动，地址是：http://localhost:8000");
});
var subscriptions = new Map();
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on("connection", function (websocket) {
    websocket.send("websocket");
    websocket.on("message", function (message) {
        // console.log("接受到消息："+message);
        var messageObj = JSON.parse(message);
        var productIds = subscriptions.get(websocket) || [];
        subscriptions.set(websocket, productIds.concat([messageObj.productId]));
    });
});
var currentBids = new Map();
setInterval(function () {
    // if (wsServer.clients) {
    //     wsServer.clients.forEach(client => {
    //         client.send("这是定时推送");
    //     })
    // }
    products.forEach(function (p) {
        var currentBid = currentBids.get(p.id) || p.price;
        var newBid = currentBid + Math.random() * 5;
        currentBids.set(p.id, newBid);
    });
    subscriptions.forEach(function (productIds, ws) {
        if (ws.readyState === 1) {
            var newBid = productIds.map(function (pid) { return ({
                productId: pid,
                bid: currentBids.get(pid)
            }); });
            ws.send(JSON.stringify(newBid));
        }
        else {
            subscriptions.delete(ws);
        }
    });
}, 2000);
