data_source_url <- 'https://raw.githubusercontent.com/codeparkhouston/events-data/master/'

events_locations_merged_url <- paste0(data_source_url, 'events-locations-merged.csv')
locations_cleaned_url       <- paste0(data_source_url, 'locations-cleaned.csv')
events_cleaned_url          <- paste0(data_source_url, 'events-cleaned.csv')

events_locations_merged   <- read.csv(events_locations_merged_url, stringsAsFactors = FALSE)
locations_cleaned         <- read.csv(locations_cleaned_url, stringsAsFactors = FALSE)
events_cleaned            <- read.csv(events_cleaned_url, stringsAsFactors = FALSE)