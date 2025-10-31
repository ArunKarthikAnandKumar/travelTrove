const mongoose=require('mongoose')
const Schema=mongoose.Schema

const countrySchema=Schema({
    continentId:{type:mongoose.Schema.Types.ObjectId,ref:"Continent"},
    continent:{type:String},
    name:{type:String,required:true,unique:true},
    shortDesc:{type:String,required:true,unique:true},
    longDesc:{type:String},
    thumbnail:{type:String}

    },{
        Collection:"tbl_countrys",
        timestamps:true
    })

let countryModel={}

class Country{
    constructor(obj){
        this.continentId=obj.continentId
        this.continent=obj.continent;
        this.name=obj.name;
        this.shortDesc=obj.shortDesc;
        this.longDesc=obj.longDesc;
        this.thumbnail=obj.thumbnail;
    }
}

countryModel.createCountryModel=async()=>{
const countryModel=mongoose.model("tbl_countrys",countrySchema);
return countryModel
}
countryModel.createCountryObj=(obj)=>{
    return new Country(obj)

}

module.exports=countryModel

