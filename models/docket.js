// File: ./models/docket.js

//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;
// NOTES ON TABLE 1:
// TABLE ID: #docketinfo
// 11 ROWS (some rows marked: style="display:none")
// ROW 1 (1r, 1c): NO CLASS (//*[@id="docketinfo"]/tbody/tr[1]) (document.querySelector("#docketinfo > tbody > tr:nth-child(1)"))
//   -- TD CLASS: .InfoTitle, followed by SPAN CLASS: .DocketInfoTitle
// ROW 2 (1r, 2c): class="title"

//<tr><td class="InfoTitle" colspan="2"><span class="DocketInfoTitle">No. 18-1  <br></span><span class="DocketInfoTitle"></span></td></tr>

// ROW 11 example with data
// <tr><td colspan="2"><span><a href="../qp/18-00525qp.pdf">Questions Presented</a></span></td></tr>
// "../qp/18-00525qp.pdf" is shortened form of "https://www.supremecourt.gov/docket/docketfiles/html/qp/18-00525qp.pdf"

var DocketSchema = new Schema({
  // THESE ARE MY PROPERTIES
  // REQUIRED
  web_address: { type: String, required: true },
  docket_number: { type: String, required: true },

  // TABLE 1 DATA
  date_retrieved: { type: Date, default: Date.now },
  docket_info_title: [String], // EXTRA INFO: eg., CAPITAL CASE, VIDED CASE(S)
  case_name: { type: String },
  date_docketed_string: { type: String },
  lower_court: { type: String },
  lower_court_case_number: { type: String },
  lower_court_case_decision_date_string: { type: String },
  lower_court_case_rehearing_denied_date_string: { type: String },
  lower_court_discretionary_court_decision__date_string: { type: String },

  // TABLE 1 DERIVED PROPERTIES
  docket_year: { type: Number },
  docket_number_short: { type: Number },
  date_docketed: { type: Date },
  lower_court_case_decision_date: { type: Date },
  lower_court_case_rehearing_denied_date: { type: Date },
  lower_court_discretionary_court_decision__date: { type: Date },

  // FOREIGN MODELS
  //author: { type: Schema.ObjectId, ref: 'Author', required: true },
  //genre: [{ type: Schema.ObjectId, ref: 'Genre' }]
  proceeding: [
    {
      itm_num: { type: Number },
      date_string: { type: String, required: true },
      date: { type: Date, required: true },
      text: { type: String, required: true },
      links: [
        {
          title: { type: String },
          url: { type: String }
        }
      ]
    }
  ],

  contact: [
    {
      party_header: { type: String },
      party_description: { type: String },
      name_block: { type: String },
      attorney_full_name: { type: String },
      attorney_surname: { type: String },
      is_counsel_of_record: { type: Boolean },
      address_block: { type: String },
      attorney_email: { type: String },
      attorney_city_state_zip: { type: String },
      is_city_state_zip_valid: { type: Boolean },
      attorney_city: { type: String },
      attorney_state: { type: String },
      attorney_zip: { type: String },
      attorney_office: { type: String },
      attorney_street_address: { type: String },
      phone_number: { type: String },
      phone_number_ten_digit: { type: String },
      party_footer: { type: String },
      party_name: { type: String }
    }
  ]
});

//Export function to create "SomeModel" model class
module.exports = mongoose.model("Docket", DocketSchema);
