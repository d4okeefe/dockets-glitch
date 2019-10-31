var express = require("express");
var router = express.Router();
const Docket = require("../models/docket");
const utilities = require("../utils/utils");

// // INITALIZE VARIBLES
const axios = require("axios");
const cheerio = require("cheerio");

// SET ROUTES
router.get("/", (req, res) => {
  Docket.find(
    //{},
    { docket_year: { $eq: 18 }, docket_number_short: { $lte: 100 } },

    null,
    { sort: { docket_year: 1, docket_number_short: 1 } },
    function(error, rows) {
      //console.log(rows);
      //res.send(JSON.stringify(rows));
      res.render("index", { docket_list: rows });
    }
  );
});
router.get("/get_dockets", (req, res) => {
  res.render("get_dockets");
});
router.get("/dockets", (req, res) => {
  Docket.find(
    {},
    null,
    { sort: { docket_year: 1, docket_number_short: 1 } },
    function(error, rows) {
      //console.log(JSON.stringify(rows));
      res.send(JSON.stringify(rows));
    }
  );
});
router.post("/get_dockets", function(req, res) {
  console.log("app.post running");
  var docket_user = req.body.docket;
  var docket_split = docket_user.split("-");
  var docket_yr = docket_split[0];
  var docket_nm = docket_split[1];
  var url = `https://www.supremecourt.gov/docket/docketfiles/html/public/${docket_user}.html`;

  // INITIALIZE LOCAL VARIABLES
  var tempyr = docket_yr + "-";
  var myUrl = "";
  //var allUrls = [];
  var allWebpages = [];
  var promises = [];

  // get range of docket numbers
  for (
    var i = parseInt(docket_nm, 3);
    //i <= parseInt(docket_nm, 10) + 49;
    i <= parseInt(docket_nm, 10) + 2;
    i++
  ) {
    var dkt = tempyr + i.toString(10);
    //console.log(dkt + " " + typeof(dkt));
    //console.log(i + ":" + docket_nm);
    promises.push(
      axios.get(
        `https://www.supremecourt.gov/docket/docketfiles/html/public/${dkt}.html`
      )
    );
  }

  axios
      .all(promises)
      .then(results => {
        results.forEach(response => {
          //console.log(response); // THIS WILL PRINT THE WEBPAGE
          var update = utilities.parseResponseData(response);
          if (update !== null) {
            var query = { case_name: update.case_name };
            var options = {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
              overwrite: true
            };

            Docket.findOneAndUpdate(query, update, options, (error, result) => {
              if (error) console.log("ERROR: " + error);
            });
          }
        });
      })
      .catch(error => {
        console.log(error);
      });
  
  
  // ALTERNATIVE AXIOS
//   const promisesResolved = promises.map(promise =>
//     promise.catch(error => ({ error }))
//   );

//   function checkFailed(then) {
//     return function(responses) {
//       const someFailed = responses.some(response => response.error);

//       if (someFailed) {
//         throw responses;
//       }

//       return then(responses);
//     };
//   }

//   axios
//     .all(promisesResolved)
//     .then(
//       checkFailed(([]) => {
//         console.log("SUCCESS");
//       })
//     )
//     .catch(err => {
//       console.log("FAIL", err);
//     });

  Docket.find(
    {},
    //{ docket_year: { $eq: 19 }, docket_number_short: { $lte: 100 } },

    null,
    { sort: { docket_year: 1, docket_number_short: 1 } },
    function(error, rows) {
      //console.log(rows);
      res.render("index", { docket_list: rows });
    }
  );
});

module.exports = router;
