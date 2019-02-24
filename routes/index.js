var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

function asciiSum(fn, ln) {
  var name = fn + ' ' + ln;
  var sum = 0;
  for (var i=0; i<name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return sum;
}

function maxConsecutive(haystack, needle) {
  if (typeof needle === 'number') {
    needle = needle.toString();
  }
  console.log(haystack);
  var max = 0;
  var current = 0;
  for (var i=0; i<haystack.length; i++) {
    var char = haystack.charAt(i);
    if (char === needle) {
      current++;
    } else {
      if (current) {
        if (current > max) {
          max = current;
        }
        current = 0;
      }
    }
  }
  return max;
}

router.post('/process', function(req, res, next) {
  if (!req.body.firstname || !req.body.lastname) {
    return res.json({success: false, error: 'First or last name missing'});
  }
  var sum = asciiSum(req.body.firstname, req.body.lastname);
  var bin = sum.toString(2); // Binary value
  var consecutive_zeros = maxConsecutive(bin, 0);
  return res.json({success: true, value: consecutive_zeros});
});

module.exports = router;
