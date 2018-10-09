library(ggmap)
library(purrr)

sites <- read.csv('./Sites-Main View.csv',
                  stringsAsFactors = FALSE)
events <- read.csv('./Events-All.csv',
                   stringsAsFactors = FALSE)

events <- events[c(2, 6:8, 10, 12,  14, 15, 38)]
colnames(events)[colnames(events) == 'Adults'] <- 'for_adults'
colnames(events)[colnames(events) == 'Program.Name'] <- 'program_type'
events$for_adults <- events$for_adults == "checked"

clean_address <- partial(gsub, ", \n|\n", " ")
geocode_with_dsk <- function (address){
  return(geocode(gsub('#[1-9][0-9]*', '', address), source = 'dsk'))
}

addresses <- unlist(lapply(sites$Address, clean_address))
sites$Address <- addresses
sites_lat_lons <- data.frame(Reduce(rbind, 
                                    lapply(sites$Address, geocode_with_dsk)
                  ))

locations <- sites[c(1:6, 8)]
locations$lat <- sites_lat_lons$lat
locations$lon <- sites_lat_lons$lon

merged <- merge(events, locations, by.x = 'Site', by.y = 'Name')
merged <- merged[c(2, 1, 3, 4, 16, 17, 10, 6, 8, 7, 9, 5, 11:15)]

write.csv(locations, file = 'locations-cleaned.csv', row.names = FALSE)
write.csv(events, file = 'events-cleaned.csv', row.names = FALSE)
write.csv(merged, file = 'events-locations-merged.csv', row.names = FALSE)






