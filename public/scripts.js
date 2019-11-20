"use strict";

$(document).ready(function() {
  // datatable processing -- on load
  var docket_table = $("#docket-table").dataTable({
    

  });

  docket_table
    .api()
    .column(0)
    .visible(false) // .date_retrieved
    .column(1)
    .visible(false) // .dkt_yr
    .column(2)
    .visible(false) // .dkt_shrt
    .column(3)
    .visible(true) // .docket_number
    .column(4)
    .visible(true) // .case_name
    .column(5)
    .visible(false) // .date_docketed
    .column(6)
    .visible(false) // .lower_court
    .column(7)
    .visible(false) // .lower_court_case_number
    .column(8)
    .visible(false) // .lower_court_decision_dates
    .column(9)
    .visible(true) // .latest_proceeding
    .column(10)
    .visible(false) // .proceedings
    .column(11)
    .visible(false); // .contacts


  $(".toggle-vis").on("click", handler => {
    var column = docket_table.api().column(handler.target.dataset.column);
    column.visible(!column.visible());
  });

  // post logic
  // set variables
  const $docket_num = $("#docket_num");
  const $submit_docket = $("#submit-docket");
  const $submit_docket_plus = $("#submit-docket-plus");
  let dockets_array = [];
  // data validation
  $("#capture_docket_form").keyup(function(e) {
    if ($docket_num.val().length < 1) {
      $docket_num.removeClass("error");
      $submit_docket.prop("disabled", true);
      $submit_docket_plus.prop("disabled", true);
    } else {
      const regEx = /^[0-9]{2}[\-AaMmOo][0-9]{1,4}$/;
      const validDocketNum = regEx.test($docket_num.val());
      if (!validDocketNum) {
        $("#docket_num").addClass("error");
        $submit_docket.prop("disabled", true);
        $submit_docket_plus.prop("disabled", true);
      } else {
        $("#docket_num").removeClass("error");
        $submit_docket.prop("disabled", false);
        $submit_docket_plus.prop("disabled", false);
      }
    }
  });
});
