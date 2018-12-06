const DATA_PATH = 'data'
const DATA_TIME_FORMAT = 'h:mma'
const DATA_DATE_FORMAT = 'MMMM D, YYYY'
const DATA_ISO_DATE_FORMAT = 'YYYY-MM-DD'
const DATA_DATETIME_FORMAT = `${DATA_DATE_FORMAT} ${DATA_TIME_FORMAT}`
const URL_REGEX = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+\(\).~#?&//=]*)[^(\) )|(\),)]/)
const TODAY_TIMESTAMP = moment().startOf('day').valueOf()
