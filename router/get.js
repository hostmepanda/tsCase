const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const mysql = require("mysql");
const convert = require('koa-convert');
const dbConfig= require('../.conf/config.js');

const app = new koa();

koaBody = convert(bodyParser());

router.post('/get', koaBody, async (ctx, next) => {

    ctx.body =  await getFromDB(ctx.request.body).then(r=>{
      return JSON.stringify({code:200, "result":r});
    }).catch(err=>{
      return JSON.stringify({code:500, "err":err});
    });

    await next();

});

getFromDB = function(params){
  params = params || false;

  return new Promise(function(resolve, reject){
    let sortOrder="ASC", // sort order by default
        limitCount=100, // limit result by 100 rows, default behaviour
        offset=0, //offset by default 0
        orderByID="id"; //default sort field

    let sqlSortByTextPart=[], sqlGroupByTextPart=[], sqlGroupByEndPart=[], selectFileds=[];

    if(Object.keys(params).length){ // we have some filtering params set in query
      // select fields provided in query
      if(typeof(params.fields)!=="undefined" &&  params.fields.length<5 ){
        params.fields.forEach((el, index)=>{
          if(!dbConfig.selectFieldsAllowed[el]) return;
          selectFileds.push("`"+el+"`");

        });
      }
      // sort fields provided in query
      if(typeof(params.sortFields)!=="undefined" && typeof(params.sortFields)==="object" && Object.keys(params.sortFields).length<4 && Object.keys(params.sortFields).length){
        params.sortFields.forEach((el, index)=>{
          if(!dbConfig.sortFieldsAllowed[el]) return;
            sqlSortByTextPart.push("`"+el+"` "+( typeof(params.sortOrder[index]!=="undefined")? (""+params.sortOrder[index]).toUpperCase(): sortOrder ));
        });
      }
      // limit and offset values are provided in query
      if(typeof(params.limit)!=="undefined" && typeof(params.limit)==="object"){ // we have limits (LIMIT, OFFSET VALUES) in request
        if(Object.keys(params.limit).length<3 && Object.keys(params.limit).length){
          if(typeof(params.limit.start)!=="undefined" && !isNaN(params.limit.start)){
              offset=Math.abs(parseInt(params.limit.start)); // set OFFSET value from request
          }
          if(typeof(params.limit.count)!=="undefined" && !isNaN(params.limit.count)){
              limitCount=Math.abs(parseInt(params.limit.count)); // set LIMIT value from request
          }
        }

      }
      // gorup fields are provided in query
      if(typeof(params.groupFields)!=="undefined" && params.groupFields.length<3 && params.groupFields.length){
        params.groupFields.forEach(function(el, index){
          if(!dbConfig.groupFieldsAllowed[el]) return;
          if( typeof(params.groupFields[index])!=="undefined" ){
            sqlGroupByTextPart.push(" COUNT(`"+el+"`) AS 'COUNT "+(""+el).toUpperCase()+"' ");
            sqlGroupByEndPart.push(" `"+el+"` ");
          }
        });
      }
    }

    connection = mysql.createConnection(dbConfig.connect);
    console.log("SELECT QUERY TO BE EXECUTED:");
    // print sql query to console
    console.log(
      "SELECT "+
      (selectFileds.length?selectFileds.join(", "):"`id`, `title`, `date`, `author`, `description`, `image` ")+
      (sqlGroupByEndPart.length?", "+sqlGroupByTextPart.join(", "):"")+
      " FROM books "+
      (sqlGroupByEndPart.length?" GROUP BY "+sqlGroupByEndPart.join(", "):"")+
      " ORDER BY "+(sqlSortByTextPart.length?sqlSortByTextPart.join(", "):"`id` ASC" )+
      " LIMIT "+limitCount+" OFFSET "+offset+" ");
    // end print sql query to console

    connection.connect();
    connection.query(
      "SELECT "+
      (selectFileds.length?selectFileds.join(", "):"`id`, `title`, `date`, `author`, `description`, `image` ")+
      (sqlGroupByEndPart.length?", "+sqlGroupByTextPart.join(", "):"")+
      " FROM books "+
      (sqlGroupByEndPart.length?" GROUP BY "+sqlGroupByEndPart.join(", "):"")+
      " ORDER BY "+(sqlSortByTextPart.length?sqlSortByTextPart.join(", "):"`id` ASC" )+
      " LIMIT ? OFFSET ? ",
      [limitCount,offset],
      function(err, result){
        if(parseInt(result.affectedRows) == 0){
          connection.end();
          reject("no rows were found");
        }else{

          connection.end();

          if(!Object.keys(params).length && typeof(params.fields)==="undefined"){

              let resObjKeys=Object.keys(result);
              for (let i = 0; i < resObjKeys.length; i++) { // converting image from db in buffer -> base64 ascii string
                let buffer = new Buffer.from(result[resObjKeys[i]].image,'base64');
                result[resObjKeys[i]].image=buffer.toString('ascii');
              }

          }

          resolve(result);
        }
    });

  });
}


app.use(router.routes());
module.exports = app;
