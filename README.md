# Map Engine - Address Insights


**Live App:**  https://map-engine-lyart.vercel.app/

---

## Description

- **Walking Score (0-100)** - Weighted average of what user considers a perfect score, users can input how many of each type of amenity is a perfect score (withib 1km radius).
- **Driving Score (0-100)** - Same as above within a 5km radius
- **Urban/Suburban Index (pretty much number of amenties within 3km)** - number of amenities within 3km, not including parks. more than 20 is urban 10-19 is suburban less than 10 is rural.
- **AI analysis** - AI analysis that generates a short summary of the findings, it also allows users to chat with it and saves chat history.
- **Interactive Map** - Mapbox GL map centered on the address with color-coded amenity markers and popups.
- **geoapify** - Api used to get aminities from long and lat coordinates returned by mapbox, this is a api that works on top of openstreetmap and i used this because with openstreet (AIs first generation the queries were much slower) map it took much longer to query results.

## AI versus Me

All of the code was generated with AI on cursor with me monitoring the files and going back and forth with opus 4.6 to generate any features that I want. Infa setup and APIs were all set up by me and are stored as environment variables in vercel.

## Approach to solving problems
- First problem encountered was slow response from openstreetmap so i found geoapify which helped load amenities much quicker
- Another problem i encountered was when allowing users to edit the radius it was still using data that was within the initial 5km radius call not exposing extra data. So when a user now goes beyond that initial 5kn we now re call the geoapify api to expand the amenities.

## Assumptions
-Used a weigthed average of amenities compared to ideal ammenities for scoring.
-Decided to allow users to change the parameters and input what their ideal scores are and what they actually conisder urban
- Originally we get ammenities within 5km radius but i addes that when a user changes a radius beyond that 5km we actually refetch ammenities so that we can get the results and also bump up the limit per number of ammenities (initially we get max 20 items for speed).
- Added AI analysis that uses gpt-4o-mini that keeps chat history and allows users to chat back and forth and ask any questions they may have.