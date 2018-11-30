const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const mysql = require("mysql");
const convert = require('koa-convert');
const dbConfig= require('../.conf/config.js');

const app = new koa();

koaBody = convert(bodyParser());


router.post('/update', koaBody, async (ctx, next) => {

    ctx.body =  await updateRow(ctx.request.body).then(r=>{
      return JSON.stringify({code:200, "result":r});
    }).catch(err=>{
      return JSON.stringify({code:500, "err":err});
    });

    await next();

});

updateRow = function(params){
  params = params || false;

  return new Promise(function(reject, resolve){

    let updateFiledsAarr=[], whereFiled=null, whereFiledValue=null;

    if(Object.keys(params).length){ // we have some filtering params set in query
      //check whether we have where field condition
      if(typeof(params.where)==="undefined" || typeof(params.update)==="undefined"){
        reject("Err: Bad syntax in request");
      }

      if(!Object.keys(params.where).length){
        reject("Uhhohhh! No where filed is provided");
      }else{
        whereFiled=Object.keys(params.where)[0];
        if( !dbConfig.whereFieldsAllowed[whereFiled]){
          reject("Err: Field "+whereFiled+" is not allowed to use in where condition");
        }
        whereFiledValue=params.where[whereFiled];
      }

      // update params in query
      if(Object.keys(params.update).length && Object.keys(params.update).length<5){
        let updateFiledNameArr=Object.keys(params.update);

        for (let i = 0; i < updateFiledNameArr.length; i++) {
          updateFiledNameArr.forEach(function(el, index){
            if(!dbConfig.updateFieldsAllowed[el]) return;
            updateFiledsAarr.push("`"+el+"`='"+params.update[updateFiledNameArr[index]]+"' ");
          });
        }
      }
      console.log("SQL UPDATE QUERY TO PERFORME:");
      //print to console SQL QUERY REAUEST
      console.log(
        "UPDATE books SET "+
        updateFiledsAarr.join(", ")+
        "WHERE "+"`"+whereFiled+"`= "+whereFiledValue
      );
      //END print to console SQL QUERY REAUEST
      if(whereFiled===null || whereFiledValue===null ){
        reject("Ooops! No where params are provided");
      }

      connection = mysql.createConnection(dbConfig.connect);

      connection.connect();

      connection.query(
        "UPDATE books SET "+
        updateFiledsAarr.join(", ")+
        "WHERE "+
        "`"+whereFiled+"`= ?",
        [whereFiledValue],
      function(err,res){

        if(parseInt(res.affectedRows) == 0){
          connection.end();
          reject("no rows were updated");
        }else{
          connection.end();
          resolve({"affectedRows":res.affectedRows,"changedRows":res.changedRows});
        }
      });
    }else{
      reject("Ooops! No update params are provided");
    }

  });
}

app.use(router.routes());
module.exports = app;
