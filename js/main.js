function renderCell (eventsDates, eventsByDates, eventsElement, date, cellType) {
  const cellDateAsISO = moment(date).format(DATA_ISO_DATE_FORMAT)
  const eventsForDate = eventsByDates[cellDateAsISO]

  const currentDate = date.getDate()

  if (cellType == 'day' && eventsDates.includes(cellDateAsISO)) {
    return {
      html: currentDate + '<span class="dp-note"></span>'
    }
  }
}

function onCellSelect (eventsDates, eventsByDates, eventsElement, fd, date) {
  const cellDateAsISO = moment(date).format(DATA_ISO_DATE_FORMAT)
  const $eventsElement = $(eventsElement)

  $eventsElement.scrollTo(`#${cellDateAsISO}`, 200)
}

function handleEventsByDateInView ($picker) {
  // $picker.data('datepicker').selectDate(moment(this.element.id).toDate())
}

// document.getElementById('events').addEventListener('scroll', function () {

// })

function handleEventsCSV(response) {
  const eventsByDates = getEventsByDateFromCSV(response)
  const eventsDates = R.keys(eventsByDates)

  const eventsElement = renderEventsByDate(eventsByDates)
  const $picker = $('#calendar')

  const pickerEventArgs = [
    eventsDates,
    eventsByDates,
    eventsElement,
  ]

  $picker.datepicker({
    language: 'en',
    onRenderCell: R.partial(renderCell, pickerEventArgs),
    onSelect: R.partial(onCellSelect, pickerEventArgs),
  })

  const eventsByDatesElements = document.querySelectorAll('.events-by-date')

  var waypoints = R.map(function(eventsByDatesElement) {
    return new Waypoint({
      element: eventsByDatesElement,
      handler: R.partial(handleEventsByDateInView, [$picker]),
      context: eventsElement,
      offset: -5,
    })
  }, eventsByDatesElements)

  setTimeout(
    function() {
      $picker.data('datepicker').selectDate(moment().toDate())
    }, 200
  )
}

Papa.parse("./Events-All.csv", {
  download: true,
  header: true,
	complete: handleEventsCSV,
})