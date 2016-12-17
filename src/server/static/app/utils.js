DEBUG = true;

function shake(element) {
  try {
    element.classList.add('shake');
    element.classList.add('long');
    element.classList.add('animated');
    setTimeout(function () {
      element.classList.remove('shake');
      element.classList.remove('long');
      element.classList.remove('animated');
    }, 1000);
  }
  catch(err) {
    // ignore
  }
}

function clearSelection() {
    if(document.selection && document.selection.empty) {
        document.selection.empty();
    } else if(window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
    }
}

function initMaterializeComponents() {
  try {
    // the 'href' attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal();

    $('.datepicker').pickadate({
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15, // Creates a dropdown of 15 years to control year
      firstDay: 1 //  monday
    });

    $('.parallax').parallax();
  } catch(err) {
    // ignore
  }
}

function debug(obj) {
  if (DEBUG) {
    console.log(obj);
  }
}


// Date utils
function endOfWeek() {
  var now = new Date();
  now.setDate(now.getDate() + (0+(7-now.getDay())) % 7);
  now.setHours(23);
  now.setMinutes(59);
  now.setSeconds(59);
  return now;
}
