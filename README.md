## Data

* [Events with Locations Data](https://raw.githubusercontent.com/codeparkhouston/events-data/master/events-locations-merged.csv)
* [Events Data](https://raw.githubusercontent.com/codeparkhouston/events-data/master/events-cleaned.csv)
* [Locations Data](https://raw.githubusercontent.com/codeparkhouston/events-data/master/locations-cleaned.csv)

## Quickly Load the Data

This will loaded the data as the following variables: `events_locations_merged`, `locations_cleaned`, `events_cleaned`

```R
source('https://raw.githubusercontent.com/codeparkhouston/events-data/master/script.R')
```

## Data Dictionary for `events_locations_merged`:

### Summary Fields

| Column Name | Description |
| ------------| ----------- |
| Program | The name of the class or workshop |
| Site | The name of the site |
| Start | Start date and time |
| End | End date and time |
| lat | Latitude of site |
| lon | Longitude of site |
| Address | Address |

### Program Details

| Column Name | Description |
| ------------| ----------- |
| Num.Participants | Approximate number of participants.  For repeating classes, only the first class has the total number of participants. |
| Description | Description of the event |
| program_type | One of 4 program types |
| is_adults | Is the event targeted at grades 12+ ? |
| Total.Service.Hours | Time duration of event |

### Site Details

| Column Name | Description |
| ------------| ----------- |
| Street.Address | Address of site, first line |
| City | City of site |
| State | State of site |
| Zip.Code | Zip code of site |
| Link.to.Google.Map | Link to Google Maps of site |