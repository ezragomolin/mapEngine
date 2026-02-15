# Map Engine - Address Insights


**Live App:**  https://map-engine-mfgmrak9l-ezra-gomolins-projects.vercel.app/

---

## Description

- **Walking Score (0-100)** - Weighted average of what user considers a perfect score, users can input how many of each type of amenity is a perfect score (withib 1km radius).
- **Driving Score (0-100)** - Same as above within a 5km radius
- **Urban/Suburban Index (pretty much number of amenties within 3km)** - number of amenities within 3km, not including parks. more than 20 is urban 10-19 is suburban less than 10 is rural.
- **Interactive Map** - Mapbox GL map centered on the address with color-coded amenity markers and popups.
-**geoapify** - Api used to get aminities from long and lat coordinates returned by mapbox, this is a api that works on top of openstreetmap and i used this because with openstreet (AIs first generation the queries were much slower) map it took much longer to query results.

## AI versus Me

Up to now about a hour in opus 4.6 generated all the code with my instructions and back and forth for the custom features I wanted (I made the decisions on scoring and features).



#