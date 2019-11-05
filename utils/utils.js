const express = require("express");
const cheerio = require("cheerio");
const htt = require("html-to-text");

exports.parseResponseData = response => {
  //console.log("INITIATING PARSE");

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
  //docket_data.date_docketed_string = $("td:contains(Docketed:)")
  docket_data.date_docketed_string = $(
    "#docketinfo tr:nth-child(3) td:nth-child(2)"
  )
    .text()
    .trim();
  docket_data.date_docketed =
    docket_data.date_docketed_string === "" ||
    docket_data.date_docketed_string === null
      ? null
      : new Date(docket_data.date_docketed_string);
  //docket_data.lower_court = $("td:contains(Lower Ct:)")
  docket_data.lower_court = $(
    "#docketinfo tr:nth-child(5) td:nth-child(2)"
  )
    .text()
    .trim();
  //docket_data.lower_court_case_number = $("td:contains(Case Numbers:)")
  docket_data.lower_court_case_number = $(
    "#docketinfo tr:nth-child(6) td:nth-child(2)"
  )
    .text()
    .trim();
  //docket_data.lower_court_case_decision_date_string = $("td:contains(Decision Date:)")
  docket_data.lower_court_case_decision_date_string = $(
    "#docketinfo tr:nth-child(7) td:nth-child(2)"
  )
    .text()
    .trim();
  docket_data.lower_court_case_decision_date =
    docket_data.lower_court_case_decision_date_string === "" ||
    docket_data.lower_court_case_decision_date_string === null
      ? null
      : new Date(docket_data.lower_court_case_decision_date_string);
  //docket_data.lower_court_case_rehearing_denied_date_string = $("td:contains(Rehearing Denied:)")
  docket_data.lower_court_case_rehearing_denied_date_string = $(
    "#docketinfo tr:nth-child(8) td:nth-child(2)"
  )
    .text()
    .trim();
  docket_data.lower_court_case_rehearing_denied_date =
    docket_data.lower_court_case_rehearing_denied_date_string === "" ||
    docket_data.lower_court_case_rehearing_denied_date_string === null
      ? null
      : new Date(docket_data.lower_court_case_rehearing_denied_date_string);
  //docket_data.lower_court_discretionary_court_decision__date_string = $("td:contains(Discretionary Court Decision Date:)")
   docket_data.lower_court_discretionary_court_decision__date_string = $("#docketinfo > tbody > tr:nth-child(9) > td:nth-child(2)")
  

    .text()
    .trim();
  docket_data.lower_court_discretionary_court_decision__date =
    docket_data.lower_court_discretionary_court_decision__date_string === "" ||
    docket_data.lower_court_discretionary_court_decision__date_string === null
      ? null
      : new Date(docket_data.lower_court_discretionary_court_decision__date);

  docket_data = getProceedings($, docket_data);

  docket_data = getContacts($, docket_data);

  return docket_data;
};
let getProceedings = ($, docket_data) => {
  var temp_proceeding = {};
  var proceeding_number = 0;
  //var proceeding_list = [];

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
                //console.log("Error: third column found!");
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
  return docket_data;
};
let getContacts = ($, docket_data) => {
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
  //console.log("COLLECTING CONTACT");
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
      //console.log(temp_contact.name_block);

      re = /(.+)Counsel of Record/i;
      if (re.test(temp_contact.name_block)) {
        temp_contact.is_counsel_of_record = true;
        //console.log(temp_contact.is_counsel_of_record);
        temp_contact.attorney_full_name = temp_contact.name_block.match(re)[1];
        temp_contact.attorney_full_name = htt
          .fromString(temp_contact.attorney_full_name)
          .trim();
        //console.log(temp_contact.attorney_full_name);
      } else {
        temp_contact.is_counsel_of_record = false;
        //console.log(temp_contact.is_counsel_of_record);
        temp_contact.attorney_full_name = htt
          .fromString(temp_contact.name_block)
          .trim();
        //console.log(temp_contact.attorney_full_name);
      }
      // get surname
      temp_contact.attorney_surname = temp_contact.attorney_full_name
        .split(" ")
        .reverse()[0];
      //console.log("temp_contact.attorney_surname"+temp_contact.attorney_surname);

      var cnext = $(c).next();
      temp_contact.address_block = $(cnext).text();
      var cnext_split = $(cnext)
        .html()
        .split("<br>");
      //console.log("cnext_split: " + cnext_split);
      //console.log("cnext_split.length: " + cnext_split.length);
      var cnext2 = [];
      for (var i = 0; i < cnext_split.length; i++) {
        var cnext_itm_temp = htt.fromString(cnext_split[i]).trim();
        //console.log("cnext_itm_temp: " + cnext_itm_temp);
        if (cnext_itm_temp != "") {
          cnext2.push(cnext_itm_temp);
        }
      }
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

      var hasEmail = false;
      re = /[@]/;
      var lastElement = cnext2.slice(-1);
      if (re.test(lastElement)) {
        hasEmail = true;
        temp_contact.attorney_email = lastElement;
      } else {
        temp_contact.attorney_email = "";
      }
      //console.log("temp_contact.attorney_email " + temp_contact.attorney_email);

      var city_state_zip = "";
      if (hasEmail) {
        // console.log(cnext2[0]);
        // console.log(cnext2[1]);
        // console.log(cnext2[2]);
        // console.log(cnext2[3]);

        city_state_zip = cnext2.slice(-2, -1);
        temp_contact.attorney_city_state_zip = String(city_state_zip);
      } else {
        city_state_zip = cnext2.slice(-1);
        temp_contact.attorney_city_state_zip = String(city_state_zip);
      }
      // console.log(
      //   "temp_contact.attorney_city_state_zip " +
      //     temp_contact.attorney_city_state_zip
      // );
      // console.log(typeof temp_contact.attorney_city_state_zip);

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
      // console.log("cnext2: " + cnext2);
      // console.log("cnext2: " + cnext2.join("\n"));

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

  return docket_data;
};
