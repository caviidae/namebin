var express = require('express');
var router = express.Router();

var ObjectId = require('mongodb').ObjectID;
var mongo = require('mongodb').MongoClient;
var mongoString = "mongodb://localhost:27017/";

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

router.post('/getNames', function(req, res, next) {
  var result;
  mongo.connect(mongoString, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("namedb");
    dbo.collection("names").find({}).toArray(function(err, result) {
      if (err) throw err;
      return res.json({success: true, names: result});
      db.close();
    });
  });
});

router.post('/delete', function(req, res, next) {
  if (!req.body.id) {
    return res.json({success: false, error: 'ID missing'});
  }

  mongo.connect(mongoString, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("namedb");
    dbo.collection("names").deleteOne({'_id': ObjectId(req.body.id)}, function(err, result) {
      if (err) throw err;
      console.log('Document deleted');
      return res.json({success: true});
      db.close();
    });
  });
});

router.post('/process', function(req, res, next) {
  if (!req.body.firstname || !req.body.lastname) {
    return res.json({success: false, error: 'First or last name missing'});
  }

  if (req.body.save === undefined || req.body.save === true) {
    mongo.connect(mongoString, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db('namedb');
      dbo.collection('names').insertOne({
        firstname: req.body.firstname,
        lastname: req.body.lastname
      }, function(err, obj) {
        if (err) throw err;
        console.log("Name inserted");
        db.close();
        var sum = asciiSum(req.body.firstname, req.body.lastname);

        var bin = sum.toString(2); // Binary value
      
        var consecutive_zeros = maxConsecutive(bin, 0);
      
        return res.json({success: true, value: consecutive_zeros, id: obj.insertedId});
      });
    });
  } else {
    var sum = asciiSum(req.body.firstname, req.body.lastname);

    var bin = sum.toString(2); // Binary value
  
    var consecutive_zeros = maxConsecutive(bin, 0);
  
    return res.json({success: true, value: consecutive_zeros});
  }

});

module.exports = router;
