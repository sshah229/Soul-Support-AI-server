var express = require("express");
var router = express.Router();
var textToSpeech = require("../../helpers/tts");

/* GET home page. */
router.post("", function (req, res, next) {
  console.log(req.body.text);
  textToSpeech(req.body.text, req.body.voice)
    .then((result) => {
      // console.log(result, "result");
      res.json(result);
    })
    .catch((err) => {
      res.json({});
    });
});

module.exports = router;
