var express = require('express');
var router = express.Router();

router
.get('/', (req,res) => {
    res.send({ greeting:"welcome to waylab CTF" });
})

module.exports = router;