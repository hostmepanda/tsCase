let dbConfig={
  connect:{
    host:"localhost",
    user:"***",
    password:"****",
    database:"****",
  },
  sortFieldsAllowed:{"title":1,"date":1,"author":1,"description":1},
  groupFieldsAllowed:{"date":1,"author":1},
  selectFieldsAllowed:{"id":1,"title":1,"date":1,"author":1,"description":1},
  updateFieldsAllowed:{"title":1,"date":1,"author":1,"description":1},
  whereFieldsAllowed:{"id":1,"title":1,"author":1,"description":1},

};

module.exports = dbConfig;
