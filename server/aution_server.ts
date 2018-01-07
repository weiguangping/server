import * as express from 'express';
import * as path from 'path';
import {Server} from 'ws';
const app=express();
app.use('/',express.static(path.join(__dirname,'../','client')));
export class Product {
    constructor(
        public id: number,
        public title: string,
        public price: number,
        public rating: number,
        public desc: string,
        public categories: string,
        public src: string
    ) {

    }
}
const products: Product[] = [
    new Product(1, "第1个商品", 11.99, 3.5, "这是第1个商品,是我学习的时候使用的", "分类1", "http://placehold.it/800x300"),
    new Product(2, "第2个商品", 12.99, 3.5, "这是第2个商品,是我学习的时候使用的", "分类2", "http://placehold.it/800x300"),
    new Product(3, "第3个商品", 51.99, 3.5, "这是第3个商品,是我学习的时候使用的", "分类3", "http://placehold.it/800x300"),
    new Product(4, "第4个商品", 31.99, 3.5, "这是第4个商品,是我学习的时候使用的", "分类4", "http://placehold.it/800x300"),
    new Product(5, "第5个商品", 101.99, 3.5, "这是第5个商品,是我学习的时候使用的", "分类5", "http://placehold.it/800x300"),
    new Product(6, "第6个商品", 21.99, 3.5, "这是第6个商品,是我学习的时候使用的", "分类6", "http://placehold.it/800x300"),
];
export class Comment {
    constructor(
        public id: number,
        public productId: number,
        public timestamp: string,
        public user: string,
        public rating: number,
        public content: string
    ) { }
}
const comments: Comment[] = [
    new Comment(1, 1, "2017-02-02 22:22:22", "张三", 3, "东西不错"),
    new Comment(2, 2, "2017-02-02 22:22:22", "李四", 4, "东西不错"),
    new Comment(3, 3, "2017-09-02 22:22:22", "王五", 2, "东西不错"),
    new Comment(4, 4, "2017-04-02 22:22:22", "赵六", 1, "东西不错"),
    new Comment(5, 5, "2017-05-02 22:22:22", "马七", 5, "东西不错"),
];
// app.get('/',(req,res)=>{
//     res.send("Hello Express");
// });
app.get('/api/products',(req,res)=>{
    let result=products;
    let params=req.query;
    console.log(params)
    if (params.title){
        result=result.filter((p)=>p.title.indexOf(params.title)!==-1);
    }
    if (params.price&&result.length>0) {
        result = result.filter((p) => p.price<=parseInt(params.price));
    }
    if (params.category&&params.category!=="-1" && result.length > 0) {
        result = result.filter((p) => p.categories.indexOf(params.category) !== -1);
    }
    res.json(result);
});
app.get('/api/products/:id', (req, res) => {
    res.json(products.find((product)=>product.id==req.params.id));
});
app.get('/api/products/:id/comments', (req, res) => {
    res.json(comments.filter((comment: Comment) => comment.productId == req.params.id));
});
const server=app.listen(8000,"localhost",()=>{
    console.log("服务启动，地址是：http://localhost:8000");
});
const subscriptions=new Map<any,number[]>();
const wsServer=new Server({port:8085});
wsServer.on("connection",websocket=>{
    websocket.send("websocket");
    websocket.on("message",message=>{
        // console.log("接受到消息："+message);
        let messageObj=JSON.parse(message);
        let productIds = subscriptions.get(websocket)||[];
        subscriptions.set(websocket,[...productIds,messageObj.productId])
    })
})
const currentBids=new Map<number,number>();

setInterval(() => {
    // if (wsServer.clients) {
    //     wsServer.clients.forEach(client => {
    //         client.send("这是定时推送");
    //     })
    // }
    products.forEach(p=>{
        let currentBid=currentBids.get(p.id)||p.price;
        let newBid=currentBid+Math.random()*5;
        currentBids.set(p.id,newBid);
    })
    subscriptions.forEach((productIds:number[],ws) => {
        if(ws.readyState===1){
            let newBid = productIds.map(pid => ({
                productId: pid,
                bid: currentBids.get(pid)
            }))
            ws.send(JSON.stringify(newBid)); 
        }else{
            subscriptions.delete(ws);
        }
        
    });
}, 2000);