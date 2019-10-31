// var express = require("express");
// var router = express.Router();
// const Docket = require("../models/docket");

// exports.index = (req, res) => {
//   Docket.find(
//     {},
//     //{ docket_year: { $eq: 19 }, docket_number_short: { $lte: 100 } },

//     null,
//     { sort: { docket_year: 1, docket_number_short: 1 } },
//     function(error, rows) {
//       //console.log(rows);
//       res.render("index", { docket_list: rows });
//     }
//   );
// };

// module.exports = router;