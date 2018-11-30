const koa = require('koa');
const router = require('koa-router')();
const mount = require('koa-mount');

const app = new koa();


app.use(mount(require('./router/get.js')));
app.use(mount(require('./router/add.js')));
app.use(mount(require('./router/update.js')));
app.use(router.routes()); // route middleware

console.log(`Server is strated on 3000 port`);
app.listen(3000);
