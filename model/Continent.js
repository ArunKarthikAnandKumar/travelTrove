const mongoose=require('mongoose')
const Schema=mongoose.Schema

const continentSchema=Schema({
    name:{type:String,required:true,unique:true},
    shortDesc:{type:String,required:true,unique:true},
    longDesc:{type:String},
    thumbnail:{type:String}

    },{
        Collection:"tbl_continents",
        timestamps:true
    })

let continentModel={}

class Continent{
    constructor(obj){
        this.name=obj.name;
        this.shortDesc=obj.shortDesc;
        this.longDesc=obj.longDesc;
        this.thumbnail=obj.thumbnail;
    }
}

continentModel.createContinentModel=async()=>{
const continentModel=mongoose.model("tbl_continents",continentSchema);
return continentModel
}
continentModel.createContinentObj=(obj)=>{
    return new Continent(obj)

}

module.exports=continentModel


//SampleData
// [

//   {

//     "name": "Asia",

//     "shortDesc": "Largest continent by both area and population.",

//     "longDesc": "Asia is home to diverse cultures, languages, and ecosystems. It contains the world's highest point, Mount Everest, and includes major economies like China, India, and Japan.",

//     "thumbnail": "https://example.com/images/continent-asia.jpg"

//   },

//   {

//     "name": "Africa",

//     "shortDesc": "Second largest continent known for its natural diversity.",

//     "longDesc": "Africa is rich in wildlife and natural resources, featuring vast deserts like the Sahara, tropical rainforests, and iconic landmarks such as the Nile River and Mount Kilimanjaro.",

//     "thumbnail": "https://example.com/images/continent-africa.jpg"

//   },

//   {

//     "name": "Europe",

//     "shortDesc": "A continent steeped in history, culture, and innovation.",

//     "longDesc": "Europe is known for its influential art, architecture, and political history. It’s home to the European Union and cities like Paris, London, and Rome.",

//     "thumbnail": "https://example.com/images/continent-europe.jpg"

//   },

//   {

//     "name": "North America",

//     "shortDesc": "Home to varied landscapes from Arctic tundras to tropical beaches.",

//     "longDesc": "North America includes countries like the United States, Canada, and Mexico. It is economically influential and geographically diverse.",

//     "thumbnail": "https://example.com/images/continent-north-america.jpg"

//   },

//   {

//     "name": "South America",

//     "shortDesc": "Rich in biodiversity and culture.",

//     "longDesc": "South America is home to the Amazon Rainforest and the Andes Mountains. Its countries include Brazil, Argentina, and Peru, known for vibrant traditions and diverse landscapes.",

//     "thumbnail": "https://example.com/images/continent-south-america.jpg"

//   },

//   {

//     "name": "Australia",

//     "shortDesc": "Smallest continent and largest island nation.",

//     "longDesc": "Australia features unique wildlife, natural wonders like the Great Barrier Reef, and a mix of modern urban centers and remote outback regions.",

//     "thumbnail": "https://example.com/images/continent-australia.jpg"

//   },

//   {

//     "name": "Antarctica",

//     "shortDesc": "The coldest and least populated continent.",

//     "longDesc": "Antarctica is covered almost entirely by ice and is primarily used for scientific research. It plays a critical role in Earth’s climate and ocean systems.",

//     "thumbnail": "https://example.com/images/continent-antarctica.jpg"

//   }

// ]