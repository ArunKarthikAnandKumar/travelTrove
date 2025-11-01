const express = require("express");
const router = express.Router();

const userServices = require("../service/users");
const adminServices = require("../service/admin");
const databaseSeeder = require("../seed/seedDatabase");

// ✅ Test Route
router.get("/", (req, res, next) => {
  try {
    res.status(200).send({ message: "This is a normal route" });
  } catch (error) {
    next(error);
  }
});

// ✅ Database Setup Route
router.get("/setUpDb", async (req, res, next) => {
  try {
    const data = await databaseSeeder;
    res.status(200).send({ message: "Database seeded successfully", data });
  } catch (error) {
    next(error);
  }
});

// ✅ Fetch All Users
router.get("/fetchAllUsers", async (req, res, next) => {
  try {
    const data = await userServices.fetchAllUsers();
    res.status(200).send({ error: false, message: "All user data", data });
  } catch (error) {
    next(error);
  }
});

// ✅ Register User
router.post("/register", async (req, res, next) => {
  console.log(req.body);
  try {
    const data = await userServices.registerUser(req.body);
    res.status(200).send({
      error: false,
      message: "User created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ User Login
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const data = await userServices.loginUser(email, password);
    res.status(200).send({
      error: false,
      message: "User logged in successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Make Admin
router.post("/admin/makeAdmin", async (req, res, next) => {
  const { email } = req.body;
  try {
    const data = await adminServices.makeAdmin(email);
    res.status(200).send({
      message: "Successfully made SuperAdmin",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Admin Login
router.post("/admin/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const data = await adminServices.loginAdmin(email, password);
    res.status(200).send({
      error: false,
      message: "Admin logged in successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
