function renderCell (eventsDates, eventsByDates, eventsElement, date, cellType) {
  const cellDateAsISO = moment(date).format(DATA_ISO_DATE_FORMAT)
  const eventsForDate = eventsByDates[cellDateAsISO]

  const currentDate = date.getDate()

  if (cellType == 'day' && eventsDates.includes(cellDateAsISO)) {
    return {
      html: `
<div class="datepicker--cell-day--date">
  ${currentDate}
</div>
<div class="has-events"></div>
      `
    }
  }
}

let LAST_SCROLLED = moment().valueOf()
let CURRENT_EVENT_DATE = moment().format(DATA_ISO_DATE_FORMAT)

function onCellSelect (eventsDates, eventsByDates, eventsElement, fd, date) {
  const cellDateAsISO = moment(date).format(DATA_ISO_DATE_FORMAT)
  const $eventsElement = $(eventsElement)

  CURRENT_EVENT_DATE = cellDateAsISO
  $eventsElement.scrollTo(`#${cellDateAsISO}`, 200)
}

// document.getElementById('events').addEventListener('scroll', function() {
//   LAST_SCROLLED = moment().valueOf()
// })

function handleEventsByDateInView ($picker) {
  if (LAST_SCROLLED === moment().valueOf() && CURRENT_EVENT_DATE !== this.element.id ) {
    $picker.data('datepicker').selectDate(moment(this.element.id).toDate())
  }
}

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
      const $firstUpcoming = $('.events-by-date.is-upcoming')
      $(eventsElement).scrollTo($firstUpcoming, 0)
      CURRENT_EVENT_DATE = $firstUpcoming.attr('id')
      $picker.data('datepicker').selectDate(moment(CURRENT_EVENT_DATE).toDate())
    }, 200
  )
}

Papa.parse("./Events-All.csv", {
  download: true,
  header: true,
	complete: handleEventsCSV,
})