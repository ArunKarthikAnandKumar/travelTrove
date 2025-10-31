const mongoose=require('mongoose')
const Schema=mongoose.Schema

const citySchema=Schema({
    continentId:{type:mongoose.Schema.Types.ObjectId,ref:"Continent"},
    continent:{type:String},
    countryId:{type:mongoose.Schema.Types.ObjectId,ref:"Country"},
    country:{type:String},
    stateId:{type:mongoose.Schema.Types.ObjectId,ref:"tbl_states"},
    state:{type:String},
    name:{type:String,required:true,unique:true},
    shortDesc:{type:String,required:true,unique:true},
    longDesc:{type:String},
    thumbnail:{type:String},
   
    highlights:[String],
    tips:[String],
    bestTimeToVisit:{
        months:[String],
        reason:{type:String}
    },
    adventureActivities:[String]
},{
    collection:"tbl_cities",
    timestamps:true
})

let cityModel={}

class City{
    constructor(obj){
        this.continentId=obj.continentId
        this.continent=obj.continent
        this.countryId=obj.countryId
        this.country=obj.country
        this.stateId=obj.stateId
        this.state=obj.state
        this.name=obj.name
        this.shortDesc=obj.shortDesc
        this.longDesc=obj.longDesc
        this.thumbnail=obj.thumbnail
        this.highlights=obj.highlights
        this.tips=obj.tips
        this.bestTimeToVisit=obj.bestTimeToVisit
        this.adventureActivities=obj.adventureActivities
    }
}

cityModel.createCityModel=async()=>{
    const cityModel=mongoose.model("tbl_cities",citySchema)
    return cityModel
}

cityModel.createCityObj=(obj)=>{
    return new City(obj)
}

module.exports=cityModel