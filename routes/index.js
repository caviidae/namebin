var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

router.post('/process', function(req, res, next) {
  if (!req.body.firstname || !req.body.lastname) {
    return res.json({success: false, error: 'First or last name missing'});
  }
  var fn = req.body.firstname;
  var ln = req.body.lastname;
  console.log(fn);
  console.log(ln);
  return res.json({success: true, message: "Processed"});
});

module.exports = router;
