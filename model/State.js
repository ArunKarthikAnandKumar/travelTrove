const mongoose=require('mongoose')
const Schema=mongoose.Schema

const stateSchema=Schema({
    continentId:{type:mongoose.Schema.Types.ObjectId,ref:"Continent"},
    continent:{type:String},
    countryId:{type:mongoose.Schema.Types.ObjectId,ref:"Country"},
    country:{type:String},
    name:{type:String,required:true,unique:true},
    shortDesc:{type:String,required:true,unique:true},
    longDesc:{type:String},
    thumbnail:{type:String},
    popularFor:{type:String},

    },{
        Collection:"tbl_states",
        timestamps:true
    })

let stateModel={}

class State{
    constructor(obj){
        this.continentId=obj.continentId
        this.continent=obj.continent;
          this.countryId=obj.countryId
          this.popularFor=obj.popularFor
        this.country=obj.country;
        this.name=obj.name;
        this.shortDesc=obj.shortDesc;
        this.longDesc=obj.longDesc;
        this.thumbnail=obj.thumbnail;
    }
}

stateModel.createStateModel=async()=>{
const stateModel=mongoose.model("tbl_states",stateSchema);
return stateModel
}
stateModel.createStateObj=(obj)=>{
    return new State(obj)

}

module.exports=stateModel

