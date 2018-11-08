const DATA_PATH = 'data'
const DATA_TIME_FORMAT = 'h:mma'
const DATA_DATE_FORMAT = 'MMMM D, YYYY'
const DATA_ISO_DATE_FORMAT = 'YYYY-MM-DD'
const DATA_DATETIME_FORMAT = `${DATA_DATE_FORMAT} ${DATA_TIME_FORMAT}`
const URL_REGEX = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+\(\).~#?&//=]*)[^(\) )|(\),)]/)
const TODAY_TIMESTAMP = moment().startOf('day').valueOf()

const getEventDataMoment = R.partialRight(moment, [DATA_DATETIME_FORMAT])

function isEventDateUpcoming (eventDateInfo) {
  return eventDateInfo.startTimestamp > TODAY_TIMESTAMP
}

function getEventDateInfo ( { Start, End } ) {
  const startMoment = getEventDataMoment(Start)
  const endMoment = getEventDataMoment(End)

  const startTimestamp = startMoment.valueOf()
  const endTimestamp = endMoment.valueOf()

  const startTime = startMoment.format(DATA_TIME_FORMAT)
  const endTime = endMoment.format(DATA_TIME_FORMAT)

  const durationPhrase = `${startTime} - ${endTime}`
  const eventDate = startMoment.format(DATA_DATE_FORMAT)
  const eventISODate = startMoment.format(DATA_ISO_DATE_FORMAT)

  return {
    startTimestamp,
    endTimestamp,
    durationPhrase,
    eventDate,
    eventISODate,
  }
}

function assignInfo (eventInfo) {
  const eventDateInfo = getEventDateInfo(eventInfo)
  const pictureURLMatches = eventInfo.Pictures.match(URL_REGEX)
  const pictureURL = (pictureURLMatches && pictureURLMatches[0] || '')

  const eventAlt = `${eventInfo.Program} at ${eventInfo.Site} on ${eventDateInfo.eventDate} -- ${eventInfo['Program Name']}`
  const isUpcoming = isEventDateUpcoming(eventDateInfo)

  return R.merge(
    eventInfo,
    {
      eventDateInfo,
      pictureURL,
      eventAlt,
      isUpcoming,
    },
  )
}

const processEventsData = R.pipe(
  R.map(assignInfo),
  R.sortBy(R.path(['eventDateInfo', 'startTimestamp'])),
)

function makeEventHTML (eventInfo) {
  return `
<article class="events-by-date--event event">
  <div class="row sqs-row">
    <div class="col sqs-col-12 span-12">
      <h5 class="event--program-title sqs-block">
        <span class="event--program-title--name">
          ${eventInfo.Program}
        </span>
        <time class="event--program-title--time">
          ${eventInfo.eventDateInfo.durationPhrase}
        </time>
      </h5>
    </div>
  </div>
  <div class="row sqs-row">
    <div class="col sqs-col-6 span-6">
      <p class="event--description sqs-block">
        ${eventInfo.Description}
      </p>
    </div>
    <div class="col sqs-col-3 span-3">
      <address class="event--location sqs-block">
        <a href="${eventInfo.Map}" target="_blank">
          ${eventInfo.Site}<br/>
          ${eventInfo.Address.replace(', \n', '<br/>')}
        </a>
      </address>
    </div>
    <div class="col sqs-col-3 span-3">
      <div class="sqs-block">
      ${
        (
          eventInfo.pictureURL &&
          `<img
            class="event--image"
            src="${eventInfo.pictureURL}"
            alt="${eventInfo.eventAlt}"
          />`
        ) || ''
      }
      </div>
    </div>
  </div>
</article>
  `
}

const makeEventsHTML = R.pipe(
  R.map(makeEventHTML),
  R.reduce(R.concat, ''),
)

function makeDateHTML (eventsDataList) {
  const {
    eventDateInfo,
    isUpcoming,
  } = eventsDataList[0]
  const {
    eventISODate,
    eventDate,
  } = eventDateInfo

  return `
<section
  class="${classNames('events-by-date', { 'is-upcoming': isUpcoming })}"
  id="${eventISODate}"
>
  <div class="row sqs-row">
    <div class="col sqs-col-12 span-12">
      <p class="events-by-date--date sqs-block">${eventDate}</p>
    </div>
  </div>
  ${makeEventsHTML(eventsDataList)}
</section>
  `
}

const makeEventsByDateHTML = R.pipe(
  R.map(makeDateHTML),
  R.values,
  R.reduce(R.concat, ''),
)

function renderEvents (eventsHTML) {
  const eventsElement = document.getElementById('events')
  eventsElement.innerHTML = eventsHTML
  return eventsElement
}

const getDataFromCSV = R.prop(DATA_PATH)

const getEventsWithDateInfoFromCSV = R.pipe(
  getDataFromCSV,
  processEventsData,
)

const getEventsByDateFromCSV = R.pipe(
  getDataFromCSV,
  processEventsData,
  // R.filter(isUpcoming),
  R.groupBy(R.path(['eventDateInfo', 'eventISODate'])),
)

const renderEventsByDate = R.pipe(
  makeEventsByDateHTML,
  renderEvents,
)