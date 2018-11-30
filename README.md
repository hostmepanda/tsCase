# testCase task

Dependences:
- koa2
- koa-bodyparser
- koa-router
- koa-mount
- mysql
- koa-convert

Provide MySQL database connect settings in file name "config.js" located in root directory subfolder ./.conf
connect section:
  connect:{
    host:"dataBaseHost",
    user:"dataBaseUser",
    password:"dataBasePassword",
    database:"dataBaseName",
  },

There are three controllers: add, get, update.

===
Syntax for GET request.
===
JSON object provided in request has following structure:
 {
  fileds:['id','title','date','author','description'],
  sortOrder:["asc"||"desc",...],
  sortFileds:['title','date','author','description'],
  groupFields:['title','date','author'],
  limit:{start:Number, count:Number}
 }
 
 All fields are optional and by default query performed will be next:
 SELECT `id`,`title`,`date`,`author`,`description` FROM books ORDER BY `id` ASC LIMIT 100 OFFSET 0
 
 ===
 Syntax for ADD request.
 ===
 {"title":"Title","date":"dd.mm.yyyy","author":"Author Name","description":"Description text","image":"BASE64 ASCII IMAGE CONTENT"}
 
 If IMAGE field is not provided, then default image "no photo" is written to DB.
 Other fields are mandatory.
 
 ===
 Syntax for UPDATE request.
 ===
 JSON object is to be provided in request and has following strusture:
 {
 update:{
  "field":"field Value"
  ....
  },
  where:{
    "id":"2"
  }
 }
 
 Only one WHERE key is proccessed.
