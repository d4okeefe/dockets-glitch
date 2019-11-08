var express = require("express");
var router = express.Router();
const Docket = require("../models/docket");
const utilities = require("../utils/utils");

// // INITALIZE VARIBLES
const axios = require("axios");
const cheerio = require("cheerio");

//save to redis ???

router.get("/", (req, res) => {
  res.redirect("/active_cases");
});

router.get("/active_cases", (req, res) => {
  Docket.find(
    {
      "proceeding.text": {
        $nin: /((Petition (DENIED|Dismissed))|(JUD?GMENT ISSUED)|(petition for a writ of certiorari is dismissed)|(petition for a writ of mandamus is dismissed)|(Judgment VACATED)|(Case removed from Docket))/i
      }
    },
    null,
    { sort: { docket_year: 1, docket_number_short: 1 } },
    function(error, rows) {
      //console.log(rows);
      //res.send(JSON.stringify(rows));
      res.render("index", {
        docket_list: rows,
        search_type: "ACTIVE CASES"
      });
    }
  );
});

router.get("/amicus_curiae", (req, res) => {
  Docket.find(
    {
      "proceeding.text": {
        $regex: /amic(i|us) curiae/i
      }
    },
    null,
    { sort: { docket_year: 1, docket_number_short: 1 } },
    function(error, rows) {
      res.render("index", {
        docket_list: rows,
        search_type: "AMICUS CURIAE CASES (cases where >= 1 amicus has filed)"
      });
    }
  );
});

router.get("/year/:yr", (req, res) => {
  //console.log("PARAMS: " + req.params.yr);
  let yr = parseInt(req.params.yr, 10);
  //console.log("after_parseInt" + yr);

  Docket.find(
    { docket_year: yr },
    null,
    { sort: { docket_year: 1, docket_number_short: 1 } },
    (err, rows) => {
      //console.log(rows);
      res.render("index", {
        docket_list: rows,
        search_type: "CASES FROM DOCKET YEAR " + yr
      });
    }
  );
});

router.get("/petitions_denied", (req, res) => {
  Docket.find(
    {
      "proceeding.text": {
        $regex: /Petition DENIED/i
      }
    },
    null,
    { sort: { docket_year: 1, docket_number_short: 1 } },
    function(error, rows) {
      res.render("index", {
        docket_list: rows,
        search_type: "CASES DENIED CERT"
      });
    }
  );
});

router.get("/petitions_granted", (req, res) => {
  Docket.find(
    {
      "proceeding.text": {
        $regex: /Petition GRANTED/i
      }
    },
    null,
    { sort: { docket_year: 1, docket_number_short: 1 } },
    function(error, rows) {
      res.render("index", {
        docket_list: rows,
        search_type: "CASES GRANTED CERT"
      });
    }
  );
});

router.get("/all_cases", (req, res) => {
  Docket.find(
    {},
    //{ docket_year: { $eq: 19 }, docket_number_short: { $lte: 100 } },
    null,
    { sort: { docket_year: 1, docket_number_short: 1 } },
    function(error, rows) {
      //console.log(rows);
      //res.send(JSON.stringify(rows));
      res.render("index", {
        docket_list: rows,
        search_type: "ALL CASES COLLECTED"
      });
    }
  );
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

const delay = require("delay");

async function axios_request(get) {
  try {
    console.log(get.docket + ": " + get.url);
    var temp_dkt = get.docket;

    const response = await axios.get(get.url);
    console.log("SUCCESS!!!   " + temp_dkt);

    var update = utilities.parseResponseData(response);
    //console.log("UPDATE: " + update);
    if (update !== null) {
      var query = { case_name: update.case_name };
      var options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        overwrite: true
      };

      Docket.findOneAndUpdate(query, update, options, (error, result) => {
        if (error) console.log("MONGODB ERROR: " + error);
      });
    }

    //return response;
  } catch (error) {
    // Error
    if (error.response) {
      /*
       * The request was made and the server responded with a
       * status code that falls out of the range of 2xx
       */
      //console.log(error.response.data);
      console.log("ERROR STATUS: " + error.response.status);
      //console.log(error.response.headers)
      //console.log("ERROR: " + temp_dkt + " ERROR: RESPONSE STATUS OUTSIDE OF 2XX!!!");
    } else if (error.request) {
      /*
       * The request was made but no response was received, `error.request`
       * is an instance of XMLHttpRequest in the browser and an instance
       * of http.ClientRequest in Node.js
       */
      //console.log(error.request);
      //console.log("ERROR: " + temp_dkt + " ERROR: NO RESPONSE RECEIVED!!!");
      console.log("ERROR ON " + get.dkt + "--RETRYING!!!");
      // try to loop back through ???
      axios_request(get);
    } else {
      // Something happened in setting up the request and triggered an Error
      //console.log("Error", error.message);
      console.log("ERROR: " + temp_dkt + " ERROR: REQUEST SETUP ERROR!!!");
    }
    //console.log(error);
    return "ERROR";
  }
}
router.get("/get_dockets", (req, res) => {
  res.render("get_dockets");
});
router.post("/get_dockets", (req, res, next) => {
  console.log("app.post running");
  var dkt_form = req.body.docket;
  var splt = dkt_form.split("-");
  var docket_yr = splt[0];
  var docket_nm = splt[1];

  // INITIALIZE LOCAL VARIABLES
  // INITIALIZE LOCAL VARIABLES
  var tempyr = docket_yr + "-";
  var gets = [];

  // get range of docket numbers
  var i = 0;
  for (i = parseInt(docket_nm, 10); i <= parseInt(docket_nm, 10) + 49; i++) {
    //for (i = parseInt(docket_nm, 10); i <= parseInt(docket_nm, 10) + 1; i++) {
    var dkt = tempyr + i.toString(10);
    console.log(dkt);

    gets.push({
      docket: dkt,
      url: `https://www.supremecourt.gov/docket/docketfiles/html/public/${dkt}.html`
    });
  }
  for (i = 0; i < gets.length; i++) {
    // IS THIS LIKE A HANDOFF OF THREADS ???
    axios_request(gets[i]);
  }

  res.redirect("/");
});

module.exports = router;
