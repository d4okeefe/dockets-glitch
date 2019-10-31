"use strict";

function compare(idx) {
  return function(a, b) {
    var A = tableCell(a, idx),
      B = tableCell(b, idx);
    return $.isNumeric(A) && $.isNumeric(B)
      ? A - B
      : A.toString().localeCompare(B);
  };
}

function tableCell(tr, index) {
  return $(tr)
    .children("td")
    .eq(index)
    .text();
}

$(document).ready(function() {
  // filter results
  $("#search-table").on("keyup", function() {
    var value = $(this)
      .val()
      .toLowerCase();
    $("#docket-table #docket-rows").filter(function() {
      $(this).toggle(
        $(this)
          .text()
          .toLowerCase()
          .indexOf(value) > -1
      );
    });
    $("#num_rows_in_tbl").text(
      "Number of rows:  " + $("#docket-table tr:visible").length + "  rows"
    );
  });

  $("#num_rows_in_tbl").text(
    "Number of rows:  " + $("#docket-table tr:visible").length + "  rows"
  );
  
  //toggle_date_docketed
  $("#toggle_date_docketed").on("click", function() {
    let $date_docketed_header = $(".date_docketed_header");
    let $date_docketed = $(".date_docketed");
    if (
      $date_docketed_header.css("display") === "none" &&
      $date_docketed.css("display") === "none"
    ) {
      $date_docketed_header.css("display", "table-cell");
      $date_docketed.css("display", "table-cell");
      $("#toggle_date_docketed").css("color", "black");
    } else {
      $date_docketed_header.css("display", "none");
      $date_docketed.css("display", "none");
      $("#toggle_date_docketed").css("color", "lightgray");
    }
  });
  
  //toggle_latest_proceeding
  $("#toggle_latest_proceeding").on("click", function() {
    let $latest_proceeding_header = $(".latest_proceeding_header");
    let $latest_proceeding = $(".latest_proceeding");
    if (
      $latest_proceeding_header.css("display") === "none" &&
      $latest_proceeding.css("display") === "none"
    ) {
      $latest_proceeding_header.css("display", "table-cell");
      $latest_proceeding.css("display", "table-cell");
      $("#toggle_latest_proceeding").css("color", "black");
    } else {
      $latest_proceeding_header.css("display", "none");
      $latest_proceeding.css("display", "none");
      $("#toggle_latest_proceeding").css("color", "lightgray");
    }
  });
  
  //toggle_lwr_ct
  $("#toggle_lwr_ct").on("click", function() {
    let $lower_court_header = $(".lower_court_header");
    let $lower_court = $(".lower_court");
    if (
      $lower_court_header.css("display") === "none" &&
      $lower_court.css("display") === "none"
    ) {
      $lower_court_header.css("display", "table-cell");
      $lower_court.css("display", "table-cell");
      $("#toggle_lwr_ct").css("color", "black");
    } else {
      $lower_court_header.css("display", "none");
      $lower_court.css("display", "none");
      $("#toggle_lwr_ct").css("color", "lightgray");
    }
  });

  //toggle_lwr_ct_dec_dt
  $("#toggle_lwr_ct_dec_dt").on("click", function() {
    let $lower_court_case_number_header = $(".lower_court_case_number_header");
    let $lower_court_case_number = $(".lower_court_case_number");
    if (
      $lower_court_case_number_header.css("display") === "none" &&
      $lower_court_case_number.css("display") === "none"
    ) {
      $lower_court_case_number_header.css("display", "table-cell");
      $lower_court_case_number.css("display", "table-cell");
      $("#toggle_lwr_ct_dec_dt").css("color", "black");
    } else {
      $lower_court_case_number_header.css("display", "none");
      $lower_court_case_number.css("display", "none");
      $("#toggle_lwr_ct_dec_dt").css("color", "lightgray");
    }
  });

  // display proceedings
  // proceedings header toggle_proceedings
  $("#toggle_proceedings").on("click", function() {
    let $proceedings_header = $(".proceedings_header");
    let $proceedings = $(".proceedings");
    if (
      $proceedings_header.css("display") === "none" &&
      $proceedings.css("display") === "none"
    ) {
      $proceedings_header.css("display", "table-cell");
      $proceedings.css("display", "table-cell");
      $("#toggle_proceedings").css("color", "black");
      //.addClass("btn-light");
      //$lower_court_case_number.css("background-color", "blue");
    } else {
      $proceedings_header.css("display", "none");
      $proceedings.css("display", "none");
      $("#toggle_proceedings").css("color", "lightgray");
    }
  });

  // display columns
  // contacts header toggle_contacts
  $("#toggle_contacts").on("click", function() {
    let $contacts_header = $(".contacts_header");
    let $contacts = $(".contacts");
    if (
      $contacts_header.css("display") === "none" &&
      $contacts.css("display") === "none"
    ) {
      $contacts_header.css("display", "table-cell");
      $contacts.css("display", "table-cell");
      $("#toggle_contacts").css("color", "black");
    } else {
      $contacts_header.css("display", "none");
      $contacts.css("display", "none");
      $("#toggle_contacts").css("color", "lightgray");
    }
  });

  // date_retrieved_header
  $("#toggle_date_retrieved").on("click", function() {
    let $date_retrieved_header = $(".date_retrieved_header");
    let $date_retrieved = $(".date_retrieved");
    if (
      $date_retrieved_header.css("display") === "none" &&
      $date_retrieved.css("display") === "none"
    ) {
      $date_retrieved_header.css("display", "table-cell");
      $date_retrieved.css("display", "table-cell");
      $("#toggle_date_retrieved").css("color", "black");
    } else {
      $date_retrieved_header.css("display", "none");
      $date_retrieved.css("display", "none");
      $("#toggle_date_retrieved").css("color", "lightgray");
    }
  });

  $("#toggle_lwr_ct_cs_num").on("click", function() {
    let $lower_court_case_number_header = $(".lower_court_case_number_header");
    let $lower_court_case_number = $(".lower_court_case_number");
    if (
      $lower_court_case_number_header.css("display") === "none" &&
      $lower_court_case_number.css("display") === "none"
    ) {
      $lower_court_case_number_header.css("display", "table-cell");
      $lower_court_case_number.css("display", "table-cell");
      $("#toggle_lwr_ct_cs_num").css("color", "black");
    } else {
      $lower_court_case_number_header.css("display", "none");
      $lower_court_case_number.css("display", "none");
      $("#toggle_lwr_ct_cs_num").css("color", "lightgray");
    }
  });

  $("#toggle_dkt_yr").on("click", function() {
    let $dkt_yr_header = $(".dkt_yr");
    let $dk_yr = $(".dkt_yr_header");
    if (
      $dkt_yr_header.css("display") === "none" &&
      $dk_yr.css("display") === "none"
    ) {
      $dkt_yr_header.css("display", "table-cell");
      $dk_yr.css("display", "table-cell");
      $("#toggle_dkt_yr").css("color", "black");
    } else {
      $dkt_yr_header.css("display", "none");
      $dk_yr.css("display", "none");
      $("#toggle_dkt_yr").css("color", "lightgray");
    }
  });

  // sort logic
  $(".dkt_shrt").on("click", function() {
    var table = $(this)
      .parents("table")
      .eq(0);
    var ths = table
      .find("tr:gt(0)")
      .toArray()
      .sort(compare($(this).index()));
    this.asc = !this.asc;
    if (!this.asc) ths = ths.reverse();
    for (var i = 0; i < ths.length; i++) table.append(ths[i]);
  });

  // post logic
  // set variables
  const $docket_num = $("#docket_num");
  const $submit_docket = $("#submit-docket");
  //const $docket_found = $("#docket_found");
  //const docketRequest = new XMLHttpRequest();
  let dockets_array = [];

  // data validation
  $("#capture_docket_form").keyup(function(e) {
    if ($docket_num.val().length < 1) {
      $docket_num.removeClass("error");
      $submit_docket.prop("disabled", true);
    } else {
      const regEx = /^[0-9]{2}[\-AaMm][0-9]{1,4}$/;
      const validDocketNum = regEx.test($docket_num.val());
      if (!validDocketNum) {
        $("#docket_num").addClass("error");
        $submit_docket.prop("disabled", true);
      } else {
        $("#docket_num").removeClass("error");
        $submit_docket.prop("disabled", false);
      }
    }
  });
});
