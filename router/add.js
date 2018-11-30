const koa = require('koa');
const router = require('koa-router')();
const mount = require('koa-mount');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');
const mysql = require("mysql");
const dbConfig= require('../.conf/config.js');

const app = new koa();
// const app = new Koa();

koaBody = convert(bodyParser());

router.post('/add', koaBody, async (ctx, next) => {


    ctx.body =  await addToDB(ctx.request.body).then(r=>{
      return JSON.stringify({code:200});
    }).catch(err=>{
      return JSON.stringify({code:500, "err":err});
    });

    await next();

});

addToDB = function (record){
  return new Promise( function(resolve, reject){
    let sqlNewRecordArr=[],connection,postParamDate;

    if(Object.keys(record).length<5){
      reject("Nahh! Give me more params");
    }

    if(typeof(record.title)==="undefined" || record.title==null || (""+record.title).trim()==''){
      reject("Ooops! No title is provided in request");
    }
    if(typeof(record.date)==="undefined" || record.date==null || (""+record.date).trim()==''){
      reject("Ooops! No date is provided in request");
    }
    if(typeof(record.author)==="undefined" || record.author==null || (""+record.author).trim()==''){
      reject("Ooops! No author is provided in request");
    }
    if(typeof(record.description)==="undefined" || record.description==null || (""+record.description).trim()==''){
      reject("Ooops! No description is provided in request");
    }
    if(typeof(record.image)==="undefined" || record.image==null || (""+record.image).trim()=='' ){
      // reject("Ooops! No image is provided in request");
      record.image='data:image/jpeg;base64,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';
    }

    postParamDate=new Date(record.date.replace(/'/g,'&#8218;').replace(/"/g,'&quot;'));

    sqlNewRecordArr=[
      record.title.replace(/'/g,'&#8218;').replace(/"/g,'&quot;'),
      ""+postParamDate.getFullYear()+"-"+(postParamDate.getMonth()+1)+"-"+postParamDate.getDate(),
      record.author.replace(/'/g,'&#8218;').replace(/"/g,'&quot;'),
      record.description.replace(/'/g,'&#8218;').replace(/"/g,'&quot;'),
      record.image.replace(/'/g,'&#8218;').replace(/"/g,'&quot;')
    ];
    // console.log(sqlNewRecordArr);

    connection = mysql.createConnection(dbConfig.connect);
    connection.connect();
    connection.query(
      "INSERT INTO books (`title`, `date`, `author`, `description`, `image`) VALUES (?)",
      [sqlNewRecordArr],
      function(err, result){

            if(parseInt(result.affectedRows) == 0){
              connection.end();
              reject("no rows were inserted");
            }else{
              connection.end();
              resolve({"affectedRows":result.affectedRows,"insertedID":result.insertId});
            }
      }
    );


  });

}

app.use(router.routes());
module.exports = app;
