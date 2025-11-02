const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Continent = require("../model/Continent");
const Country = require("../model/Country");
const State = require("../model/State");
const City = require("../model/City");
const Attraction = require("../model/Attraction");
const Hotel = require("../model/Hotel");
const Restaurant = require("../model/Restaurant");
const Destination=require("../model/DestinationGuide")
const Itenary=require("../model/itenary")




const dataPath = path.join(__dirname, "./sampleData.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));


async function seedDatabase() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/traveTrove_DB")
    console.log("Connected to traveTrove_DB");

    const continentModel=await Continent.createContinentModel()
const countryModel =await Country.createCountryModel()
const stateModel = await State.createStateModel();
const cityModel = await City.createCityModel();
const attractionModel =await Attraction.createAttractionModel();
const hotelModel = await Hotel.createHotelModel();
const restaurantModel=await Restaurant.createRestaurantModel();
const destinationModel = await Destination.createDestinationGuideModel();
const itenaryModel = await Itenary.createItineraryModel();

    await Promise.all([
      continentModel.deleteMany(),
      countryModel.deleteMany(),
      stateModel.deleteMany(),
      cityModel.deleteMany(),
      attractionModel.deleteMany(),
      hotelModel.deleteMany(),
      restaurantModel.deleteMany(),
      destinationModel.deleteMany(),
      itenaryModel.deleteMany()
    ]);

    const continents = await continentModel.insertMany(data.continents);
    const continentMap = Object.fromEntries(continents.map(c => [c.name, c._id]));

    const countries = await countryModel.insertMany(
      data.countries.map(c => ({
        ...c,
        continentId: continentMap[c.continent]
      }))
    );
    const countryMap = Object.fromEntries(countries.map(c => [c.name, c._id]));

    const states = await stateModel.insertMany(
      data.states.map(s => ({
        ...s,
        continentId: continentMap[s.continent],
        countryId: countryMap[s.country]
      }))
    );
    const stateMap = Object.fromEntries(states.map(s => [s.name, s._id]));

    const cities = await cityModel.insertMany(
      data.cities.map(city => ({
        ...city,
        continentId: continentMap[city.continent],
        countryId: countryMap[city.country],
        stateId: stateMap[city.state]
      }))
    );
    const cityMap = Object.fromEntries(cities.map(c => [c.name, c._id]));

    const attractions = await attractionModel.insertMany(
      data.attractions.map(a => ({
        ...a,
        continentId: continentMap[a.continent],
        countryId: countryMap[a.country],
        stateId: stateMap[a.state],
        cityId: cityMap[a.city]
      }))
    );
    const attractionMap = Object.fromEntries(attractions.map(a => [a.name, a._id]));

    const hotels = await hotelModel.insertMany(
      data.hotels.map(h => ({
        ...h,
        continentId: continentMap[h.continent],
        countryId: countryMap[h.country],
        stateId: stateMap[h.state],
        cityId: cityMap[h.city]
      }))
    );
    const hotelMap = Object.fromEntries(hotels.map(h => [h.name, h._id]));

    const restaurants = await restaurantModel.insertMany(
      data.restaurants.map(r => ({
        ...r,
        continentId: continentMap[r.continent],
        countryId: countryMap[r.country],
        stateId: stateMap[r.state],
        cityId: cityMap[r.city]
      }))
    );
    const restaurantMap = Object.fromEntries(restaurants.map(r => [r.name, r._id]));

    await destinationModel.insertMany(
      data.destinationGuides.map(d => {
        // Get all attractions in this city
        const cityAttractions = attractions
          .filter(a => a.city === d.city)
          .map(a => a._id);
        
        // Get all hotels in this city
        const cityHotels = hotels
          .filter(h => h.city === d.city)
          .map(h => h._id);
        
        // Get all restaurants in this city
        const cityRestaurants = restaurants
          .filter(r => r.city === d.city)
          .map(r => r._id);
        
        return {
          ...d,
          continentId: continentMap[d.continent],
          countryId: countryMap[d.country],
          stateId: stateMap[d.state],
          cityId: cityMap[d.city],
          attractions: cityAttractions.length > 0 ? cityAttractions : [],
          hotels: cityHotels.length > 0 ? cityHotels : [],
          restaurants: cityRestaurants.length > 0 ? cityRestaurants : [],
          avgRating:
            d.reviews && d.reviews.length
              ? d.reviews.reduce((a, b) => a + b.rating, 0) / d.reviews.length
              : 0
        };
      })
    );

    await itenaryModel.insertMany(
      data.itineraries.map(i => ({
        ...i,
        continentId: continentMap[i.continent],
        countryId: countryMap[i.country],
        stateId: stateMap[i.state],
        cityId: cityMap[i.city],
        days: i.days.map(day => ({
          ...day,
          attractions: day.attractions.map(a => ({
            ...a,
            attractionId: attractionMap[a.attractionName]
          })),
          meals: {
            breakfast: day.meals.breakfast
              ? {
                  ...day.meals.breakfast,
                  restaurantId: restaurantMap[day.meals.breakfast.restaurantName]
                }
              : null,
            lunch: day.meals.lunch
              ? {
                  ...day.meals.lunch,
                  restaurantId: restaurantMap[day.meals.lunch.restaurantName]
                }
              : null,
            dinner: day.meals.dinner
              ? {
                  ...day.meals.dinner,
                  restaurantId: restaurantMap[day.meals.dinner.restaurantName]
                }
              : null
          },
          hotelStay: day.hotelStay
            ? {
                ...day.hotelStay,
                hotelId: hotelMap[day.hotelStay.hotelName]
              }
            : null
        })),
        avgRating:
          i.reviews && i.reviews.length
            ? i.reviews.reduce((a, b) => a + b.rating, 0) / i.reviews.length
            : 0
      }))
    );

    return {error:false,message:"Database seeded successfully!"}
  } catch (err) {
    console.log(err)
    return {error:false,message:"Database seeding Error!"}
  }
}

module.exports=seedDatabase()