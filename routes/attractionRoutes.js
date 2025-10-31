const express = require("express")
const router = express.Router()
const multer = require("multer")
const parser = require("../utilites/parser")
const attractionService = require("../service/attraction")
const attractionModel = require("../model/Attraction")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/uploads/attractions")
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fieldSize: 5 * 1024 * 1024 },
})

router.post("/addAttraction", upload.single("thumbnail"), async (req, res, next) => {
  try {
    const {
      name,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      shortDesc,
      longDesc,
      bestTimeToVisit,
      highlights,
      tips,
      entryFee,
      openingHours,
      popularFor
    } = req.body

    const attractionObj = {
      name,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      shortDesc,
      longDesc,
      entryFee,
      openingHours,
      popularFor,
      bestTimeToVisit,
      highlights: parser.parseArray(highlights),
      tips: parser.parseArray(tips),
      thumbnail: req.file ? `assets/uploads/attractions/${req.file.filename}` : null,
    }
    console.log(attractionObj)

    const data = await attractionService.createAttraction(attractionObj)
    res.status(200).send({ error: false, message: "Attraction added successfully", data })
  } catch (error) {
    next(error)
  }
})

router.post("/updateAttraction/:id", upload.single("thumbnail"), async (req, res, next) => {
  try {
    const id = req.params.id
    console.log(req.body)
    const {
      name,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      shortDesc,
      longDesc,
      bestTimeToVisit,
      highlights,
      tips,
      entryFee,
      openingHours,
      popularFor,
    } = req.body

    const thumbnailPath = req.file
      ? `assets/uploads/attractions/${req.file.filename}`
      : req.body.thumbnail

    const updatedData = {
      name,
      continent,
      continentId,
      country,
      countryId,
      state,
      stateId,
      city,
      cityId,
      shortDesc,
      longDesc,
      entryFee,
      openingHours,
      bestTimeToVisit,
       highlights: parser.parseArray(highlights),
      tips: parser.parseArray(tips),
      popularFor,
      thumbnail: thumbnailPath,
    }

    const data = await attractionService.updateAttraction(id, updatedData)
    res.status(200).send({ error: false, message: "Attraction updated successfully", data })
  } catch (error) {
    next(error)
  }
})

router.delete("/deleteAttraction/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const data = await attractionService.deleteAttraction(id)
    res.status(200).send({ error: false, message: "Attraction deleted successfully", data })
  } catch (error) {
    next(error)
  }
})

router.get("/allAttractions", async (req, res, next) => {
  try {
    const data = await attractionService.fetchAllAttractions()
    res.status(200).send({
      error: false,
      message: "Attractions fetched successfully",
      data: {
        attractionData: data.attractionData,
        continentData: data.continentData,
        countryData: data.countryData,
        stateData: data.stateData,
        cityData: data.cityData,
      },
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
