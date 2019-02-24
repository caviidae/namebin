var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/process', function(req, res, next) {
  console.log(req);
  res.end();
});

module.exports = router;
