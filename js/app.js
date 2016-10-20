if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceworker.js', { scope: '/' }).then(function(reg) {

    if (reg.installing) {
      console.log('Service worker installing');
    } else if (reg.waiting) {
      console.log('Service worker installed');
    } else if (reg.active) {
      console.log('Service worker active');
    }

  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
}

function renderAttendee(doc) {
  console.log(doc);
  var checkedin = (doc.doc.checkedin) ? 'done' : 'check_circle';
  var checkedcolor = (doc.doc.checkedin) ? 'green lighten-3' : '';
  var attendee= `<li id="${doc.id}" class="collection-item avatar ${checkedcolor}">
      <span class="title">${doc.doc['Ticket Full Name']}</span>
      <p class="details">${doc.doc['Ticket Email']}<br>
         ${doc.doc['Ticket']}
      </p>
      <span class="details" style="display: none" >
      ${doc.doc['Ticket Full Name'].toLowerCase()}
      ${doc.doc['Ticket Full Name'].toUpperCase()}
      ${doc.doc['Ticket Email'].toLowerCase()}
      ${doc.doc['Ticket Email'].toUpperCase()}
      </span>
      <a href="#!" class="checkin secondary-content"><i class="material-icons">${checkedin}</i></a>
    </li>`;
  if($('#'+doc.id).length) {
    $('#'+doc.id).replaceWith(attendee);
  } else {
    $('#attendees').append(attendee);
  }
  $('#'+doc.id+' .checkin').on('click', function() {
    var docId = $(this).parent().attr('id');
    db.get(docId, function(err, body) {
      if(!body.checkedin) {
        var checkedBody = body;
        checkedBody.checkedin = Date.now();
        db.put(checkedBody).then(function (response) {
          // handle response
        }).catch(function (err) {
          console.log(err);
        });
      }
    })
  })

}

var db = PouchDB('check-in');

db.sync('https://inurtherethandiffaturned:f40f40e9720f4f224503f429fa58b1021ff6bf39@elsmore.cloudant.com/hackference-checkin', {
  live: true,
  retry: true,
});

// Display all attendees
db.allDocs({ include_docs: true }, function(err, resp) {
  for (var i = 0; i < resp.rows.length; i++) {
    var data = resp.rows[i];
    renderAttendee(data);
  }
});

var changes = db.changes({
  since: 'now',
  live: true,
  include_docs: true
}).on('change', function(change) {
  // handle change
  renderAttendee(change)
}).on('complete', function(info) {
  // changes() was canceled
}).on('error', function (err) {
  console.log(err);
});

$('#search').on('keyup', function() {
  var term = $('#search').val();
  console.log(term);
  if (term.length) {
    $('.collection-item').hide();
    $(".title:contains('"+term+"')").parent().show();
    $(".details:contains('"+term+"')").parent().show();
  } else {
    $('.collection-item').show();
  }
})
