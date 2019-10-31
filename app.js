// server.js
// where your node app starts

// init project
var express = require("express");
var routes = require("./routes");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "pug");
app.use(express.static("public"));

// INITALIZE VARIBLES
const axios = require("axios");
//const $ = require("jquery");
const cheerio = require("cheerio");
const Docket = require("./models/docket");

// MONGOOSE DB
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
var mongoDB =
  "mongodb+srv://d4okeefe:gmgxbStJd7t0BAXu@cluster0-jdy6d.gcp.mongodb.net/dockets?retryWrites=true&w=majority";
//var mongoDB = "mongodb+srv://"+process.env.MONGO_USERNAME+":"+process.env.MONGO_USERNAME+"@cluster0-jdy6d.gcp.mongodb.net/dockets?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db2 = mongoose.connection;
db2.on("error", console.error.bind(console, "MongoDB connection error:"));

// SET ROUTES
app.get("/", (req, res) => {
  Docket.find(
    //{},
    { docket_year: { $eq: 19 }, docket_number_short: { $lte: 100 } },

    null,
    { sort: { docket_year: 1, docket_number_short: 1 } },
    function(error, rows) {
      //console.log(rows);
      //res.send(JSON.stringify(rows));
      res.render("index", { docket_list: rows });
    }
  );
});

app.get("/get_dockets", (req, res) => {
  Docket.find(
    {},
    null,
    { sort: { docket_year: 1, docket_number: 1 } },
    function(error, rows) {
      //console.log(rows);
      res.render("get_dockets", { docket_list: rows });
    }
  );
});

function parseResponseData(response) {
  console.log("INITIATING PARSE");

  var docket_data = {};
  docket_data.proceeding = [];
  const $ = cheerio.load(response.data, { decodeEntities: true });

  //console.log(response);

  docket_data.web_address = response.config.url;
  //console.log("docket_data.web_address: " + docket_data.web_address);
  docket_data.docket_number = docket_data.web_address.match(
    /https:\/\/www\.supremecourt\.gov\/docket\/docketfiles\/html\/public\/(\d{2}\-\d{1,4}).html/
  )[1];
  // make sure values exist
  if (docket_data.web_address === "" || docket_data.docket_number === "") {
    return null;
  }
  docket_data.docket_year = docket_data.docket_number.split("-")[0];
  docket_data.docket_number_short = docket_data.docket_number.split("-")[1];

  var $docketInfoTitles = $(".DocketInfoTitle");
  docket_data.docket_info_title = [];
  for (var i = 0; i < $docketInfoTitles.length; i++) {
    // console.log("ITEM #: " + i);
    //console.log($docketInfoTitles[i]
    // console.log($($docketInfoTitles[i]).text());
    var temp_info = $($docketInfoTitles[i])
      .text()
      .trim();
    if (temp_info !== "") {
      docket_data.docket_info_title.push(temp_info);
    }
  }

  docket_data.case_name = $(".title")
    .text()
    .trim();
  docket_data.date_docketed_string = $("td:contains(Docketed:)")
    .next()
    .text()
    .trim();
  docket_data.date_docketed =
    docket_data.date_docketed_string === "" ||
    docket_data.date_docketed_string === null
      ? null
      : new Date(docket_data.date_docketed_string);
  docket_data.lower_court = $("td:contains(Lower Ct:)")
    .next()
    .text()
    .trim();
  docket_data.lower_court_case_number = $("td:contains(Case Numbers:)")
    .next()
    .text()
    .trim();
  docket_data.date_rehearing_denied_string = $("td:contains(Rehearing Denied:)")
    .next()
    .text()
    .trim();
  docket_data.date_rehearing_denied =
    docket_data.date_rehearing_denied_string === "" ||
    docket_data.date_rehearing_denied_string === null
      ? null
      : new Date(docket_data.date_rehearing_denied_string);
  docket_data.date_discretionary_court_decision_string = $(
    "td:contains(Discretionary Court Decision Date:)"
  )
    .next()
    .text()
    .trim();

  docket_data.date_discretionary_court_decision =
    docket_data.date_discretionary_court_decision_string === "" ||
    docket_data.date_discretionary_court_decision_string === null
      ? null
      : new Date(docket_data.date_discretionary_court_decision_string);
  docket_data.decision_date_string = $(
    "td:contains(Discretionary Court Decision Date:)"
  )
    .next()
    .text()
    .trim();

  docket_data.decision_date =
    docket_data.decision_date_string === "" ||
    docket_data.decision_date_string === null
      ? null
      : new Date(docket_data.decision_date_string);

  var proceeding_number = 0;
  var proceeding_list = [];
  var temp_proceeding = {};
  console.log("COLLECTING PROCEEDING");
  //console.log("ROWS COLLECTED"+ $("#proceedings").find("tr").text());
  //$("#proceedings > tbody > tr").each((i, row) => {
  $("#proceedings")
    .find("tr")
    .each((i, row) => {
      //console.log("row: " + i);
      $(row)
        .find("td")
        .each((j, col) => {
          //console.log("row: " + i + " col: " + j);

          if (i !== 0) {
            /*SKIP FIRST ROW: HEADER*/

            if (i % 2 === 1) {
              // odd numbered rows: DATE & TEXT
              if (j === 0) {
                // reset values
                temp_proceeding = {};
                proceeding_number++;

                // load itm_num and date
                temp_proceeding.itm_num = proceeding_number;
                temp_proceeding.date_string = $(col)
                  .text()
                  .trim();
                temp_proceeding.date = new Date(temp_proceeding.date_string);
                //console.log(temp_proceeding);
              } else if (j === 1) {
                // load proceeding text
                temp_proceeding.text = $(col)
                  .text()
                  .trim();
              } else {
                console.log("Error: third column found!");
              }
            } /*(i % 2 !== 1)*/ else {
              // & make sure correct class name !!!
              if ($(col).hasClass("borderbttm")) {
                // even numbered rwos have LINKS
                temp_proceeding.links = [];
                $(col)
                  .find("a")
                  .each((k, lnks) => {
                    // LOAD LINK INFO AND LINKS
                    //console.log(lnks);
                    var link_text = $(lnks)
                      .text()
                      .trim();
                    //console.log("link_text: " + link_text);
                    //var link_url = lnks["href"];
                    var link_url = $(lnks).attr("href");
                    //console.log("link_url: " + link_url);
                    temp_proceeding.links.push({
                      title: link_text,
                      url: link_url
                    });
                  });
              }
            }
          }
        });
      if (i !== 0 && i % 2 === 0) {
        docket_data.proceeding.push(temp_proceeding);
        //console.log(docket_data.proceedings);
      }
    }); // end collect proceedings

  // CONTACT OVERVIEW -- classes of td
  // ROW 1
  // 1. td ContactSubHeader --"Attorneys for ..." (but doesn't top every name!!!)
  // ROW 2
  // 2. td ContactData2 -- name & counsel of record
  // 3. td after -- address block
  // 4. td ContactData == phone number
  // ROW 3
  // 5. ContactParty spacer -- "Party name: ..."

  var contact_number = 0;
  var contact_list = [];
  var temp_contact = {};
  console.log("COLLECTING CONTACT");
  var $cells = $("#Contacts").find("td");
  var curr_atty_group = "";
  var re = "";
  $cells.each((j, c) => {
    // set "Attorneys for" -- curr_atty_group
    if ($(c).attr("class") === "ContactSubHeader") {
      curr_atty_group = $(c).text();
      //console.log(curr_atty_group);
    }

    // set Name & Address blocks
    if ($(c).attr("class") === "ContactData2") {
      // reset temp_contact
      temp_contact = {};
      if (curr_atty_group != null) {
        // populate curr_atty_group
        temp_contact.party_header = curr_atty_group;
        //console.log(temp_contact.party_header);
        re = /Attorneys? for (.+)/;

        if (null != curr_atty_group.match(re)) {
          temp_contact.party_description = curr_atty_group.match(re)[1];
        }
      }
      //console.log(temp_contact.party_description);

      // get name info
      temp_contact.name_block = $(c).text();

      re = /(.+)Counsel of Record/i;
      if (re.test(temp_contact.name_block)) {
        temp_contact.is_counsel_of_record = true;
        //console.log(temp_contact.is_counsel_of_record);
        temp_contact.attorney_full_name = temp_contact.name_block
          .match(re)[1]
          .trim();
        //console.log(temp_contact.attorney_full_name);
      } else {
        temp_contact.is_counsel_of_record = false;
        //console.log(temp_contact.is_counsel_of_record);
        temp_contact.attorney_full_name = temp_contact.name_block.trim();
        //console.log(temp_contact.attorney_full_name);
      }
      // get surname
      temp_contact.attorney_surname = temp_contact.attorney_full_name
        .split(" ")
        .reverse()[0];
      //console.log("temp_contact.attorney_surname"+temp_contact.attorney_surname);

      var cnext = $(c).next();
      temp_contact.address_block = $(cnext).text();
      //$(cnext).css("white-space: pre");
      var cnext_split = $(cnext)
        .html()
        .split("<br>");
      // remove empty elements
      var cnext2 = cnext_split.filter(element => {
        return element != null && element != "";
      });
      console.log(cnext2);

      var hasCompany = true;
      var firstElement = cnext2[0];
      re = /[0-9]/;
      if (!re.test(firstElement)) {
        hasCompany = false;
      }
      if (hasCompany) {
        temp_contact.attorney_office = firstElement;
      } else {
        temp_contact.attorney_office = "";
      }
      console.log(
        "temp_contact.attorney_office " + temp_contact.attorney_office
      );

      var hasEmail = false;
      re = /[@]/;
      var lastElement = cnext2.slice(-1);
      if (re.test(lastElement)) {
        hasEmail = true;
        temp_contact.attorney_email = lastElement;
      } else {
        temp_contact.attorney_email = "";
      }
      console.log("temp_contact.attorney_email " + temp_contact.attorney_email);

      var city_state_zip = "";
      if (hasEmail) {
        console.log(cnext2[0]);
        console.log(cnext2[1]);
        console.log(cnext2[2]);
        console.log(cnext2[3]);

        city_state_zip = cnext2.slice(-2, -1);
        temp_contact.attorney_city_state_zip = String(city_state_zip);
      } else {
        city_state_zip = cnext2.slice(-1);
        temp_contact.attorney_city_state_zip = String(city_state_zip);
      }
      console.log(
        "temp_contact.attorney_city_state_zip " +
          temp_contact.attorney_city_state_zip
      );
      console.log(typeof temp_contact.attorney_city_state_zip);

      re = /^(([A-Z][a-z.]+\s?)+),\s([A-Z]{2})\s(\d{5}-?(\d{4})?)$/;
      if (re.test(temp_contact.attorney_city_state_zip)) {
        temp_contact.is_city_state_zip_valid = true;
        temp_contact.attorney_city = temp_contact.attorney_city_state_zip.match(
          re
        )[0];
        temp_contact.attorney_state = temp_contact.attorney_city_state_zip.match(
          re
        )[2];
        temp_contact.attorney_zip = temp_contact.attorney_city_state_zip.match(
          re
        )[3];
      } else {
        temp_contact.is_city_state_zip_valid = false;
        temp_contact.attorney_city = "";
        temp_contact.attorney_state = "";
        temp_contact.attorney_zip = "";
      }

      // STREET ADDRESS !?!?!?!
      console.log("cnext2: " + cnext2);
      console.log("cnext2: " + cnext2.join("\n"));

      switch (true) {
        case hasCompany && hasEmail:
          temp_contact.attorney_street_address = cnext2
            .slice(1, cnext2.length - 2)
            .join("\n");
          break;
        case hasCompany && !hasEmail:
          temp_contact.attorney_street_address = cnext2
            .slice(1, cnext2.length - 1)
            .join("\n");
          break;
        case !hasCompany && hasEmail:
          temp_contact.attorney_street_address = cnext2
            .slice(0, cnext2.length - 2)
            .join("\n");
          break;
        case !hasCompany && !hasEmail:
          temp_contact.attorney_street_address = cnext2
            .slice(0, cnext2.length - 1)
            .join("\n");
          break;
      }
    }
    /// PHONE NUMBER ?!?!??!?!
    if ($(c).attr("class") === "ContactData2") {
      temp_contact.phone_number = $(c).text();
      var temp_phone = "";
      re = /[0-9]/;
      for (var i = 0; i < temp_contact.phone_number.length - 1; i++) {
        if (re.test(temp_contact.phone_number.charAt(i))) {
          temp_phone += temp_contact.phone_number.charAt(i);
        }
      }
      if (10 == temp_phone.length) {
        temp_contact.phone_number_ten_digit = temp_phone;
      }

      contact_list.push(temp_contact);
    }

    /// PARTY FOOTER !?!??!?!

    /// party_header: { type: String },
    /// party_description: { type: String },
    /// name_block: { type: String },
    /// attorney_full_name: { type: String },
    /// attorney_surname: { type: String },
    /// is_counsel_of_record: { type: String },
    /// address_block: { type: String },
    /// attorney_email: { type: String },
    /// attorney_city_state_zip: { type: String },
    /// is_city_state_zip_valid: { type: String },
    /// attorney_city: { type: String },
    /// attorney_state: { type: String },
    /// attorney_zip: { type: String },
    /// attorney_office: { type: String },
    // attorney_street_address: { type: String },
    // phone_number: { type: String },
    // phone_number_ten_digit: { type: Number },
    // party_footer: { type: String },
    // party_name: { type: String }

    //console.log($(c).attr('class'));
  });
  docket_data.contact = contact_list;

  // end collect contacts

  return docket_data;
}

app.get("/dockets", (req, res) => {
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

app.post("/get_dockets", function(req, res) {
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
    var i = parseInt(docket_nm, 10);
    i <= parseInt(docket_nm, 10) + 49;
    //i <= parseInt(docket_nm, 10) + 2;
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

  // ORIGINAL AXIOS

    axios
      .all(promises)
      .then(results => {
        results.forEach(response => {
          //console.log(response); // THIS WILL PRINT THE WEBPAGE
          var update = parseResponseData(response);
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

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
