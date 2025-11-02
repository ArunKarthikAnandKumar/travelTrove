const mongoose=require('mongoose')
const Schema=mongoose.Schema
const bcrypt=require('bcrypt')

const userSchema=Schema(
    {
        userName:{
            type:String,
            required:[true,"UserName is required"],
            minlength:[2,"userName must be 2 characters Long"],
            maxLength:[100,"UserName must not exceed 100 characters"],
        },
        email:{
            type:String,
            required:[true,"Email is required"],
            unique:true,
            lowercase:true,
            trim:true,
            match:[
            /^[\w.]+@[\w.]+.[^w]{2,}$/,
            "The email is in Invalid format"
            ]
            
        },
       password:{
            type:String,
            required:[true,"Password is required"],
            minlength:[8,"Password must be atleast 8 characters long"],
            validate:{

                validator:(value)=>{
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}/.test(value)

                },
                message:"Password must include uppercase, lowercase, number and special character"

            }
        },
        phoneNumber:{
            type:String,
            validate:{
                validator:(val)=>{
                    return /^[1-9]\d{9}$/.test(val)

                },
                message:"Phone Number must be 10 digit"
            }
        },
        country:{
            type:String,
            required:[true,"Country is Required"]
        },
        role:{
            type:String,
            enum:["user","admin"],
            default:"user"
        },
        isActive:{
            type:Number,
            enum:[0,1],
            default:1
        },
        // Favorites for destinations and itineraries
        favorites: {
            destinationGuides: [{ type: mongoose.Schema.Types.ObjectId, ref: "tbl_destination_guides" }],
            itineraries: [{ type: mongoose.Schema.Types.ObjectId, ref: "tbl_itineraries" }]
        }

    },{
        Collection:"tbl_users",
        timestamps:true
    }
)

let userModel={}

class User{
    constructor(obj){
        this.userName=obj.userName;
        this.email=obj.email;
        this.password=obj.password;
        this.phoneNumber=obj.phoneNumber;
        this.country=obj.country
        this.role=obj.role;
        this.favorites=obj.favorites || { destinationGuides: [], itineraries: [] };
    }
}

userModel.createUserModel=async()=>{
const userModel=mongoose.model("tbl_users",userSchema);
return userModel
}
userModel.createUserObj=(obj)=>{
    return new User(obj)

}

module.exports=userModel


// {
                
//                 "userName":"Rajesh1",
// 	"password":"Good#12345",
//                 "email":"rajes1h@gmail.com",
//                 "phoneNumber":"9988776155",
//                 "role":"user",
//                 "country":"India"

//             }