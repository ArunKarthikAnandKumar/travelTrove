var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors=require('cors')

var Router=require('./routes/userRoutes')
var authRouter=require('./routes/authRoutes')
var adminRouter=require('./routes/adminRoutes')




const userModel=require('./model/users')

var dotenv=require('dotenv')
dotenv.config()

var requestLoger=require('./utilites/requestLogger')
var errorLogger=require('./utilites/errorLogger')
var {isAdmin,isAuthenticated}=require('./utilites/authMiddleware')

const Auth=require('./utilites/auth')

let connectDb=require('./config/db')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLoger)

app.use('/assets/uploads/continents',express.static(path.join(__dirname,'/assets/uploads/continents')))
app.use('/assets/uploads/country',express.static(path.join(__dirname,'/assets/uploads/country')))
app.use('/assets/uploads/state',express.static(path.join(__dirname,'/assets/uploads/state')))
app.use('/assets/uploads/city',express.static(path.join(__dirname,'/assets/uploads/city')))
app.use('/assets/uploads/attractions',express.static(path.join(__dirname,'/assets/uploads/attractions')))
app.use('/assets/uploads/restaurants',express.static(path.join(__dirname,'/assets/uploads/restaurants')))
app.use('/assets/uploads/hotels',express.static(path.join(__dirname,'/assets/uploads/hotels')))
app.use('/assets/uploads/destinationGuides',express.static(path.join(__dirname,'/assets/uploads/destinationGuides')))

// app.use('/api/auth',isAuthenticated,authRouter)
app.get('/',(req,res,next)=>{
  res.status(200).json({message:"Api Hit"})
})
app.use('/api/admin',adminRouter)
app.use('/api',Router)


app.listen(process.env.PORT,async ()=>{
  console.log("travelTroveBacken Running on localhost:3000/")
  await connectDb()

 

})

app.use(errorLogger)

module.exports = app;
