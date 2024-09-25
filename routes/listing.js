const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController = require("../controllers/listing");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage } );


const Listing = require("../models/listing");

const reviewsRouter = require("./review");
// Include the reviews router
router.use("/:id/reviews", reviewsRouter);


router.route("/")
.get(wrapAsync(listingController.index))  // index route
.post(
    isLoggedIn,  
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.createListing)
);  // create route

// New route
router.get("/new", isLoggedIn, listingController.renderNewForm);


router.route("/:id")
.get(
    wrapAsync(listingController.showListing)) // show route
.put(isLoggedIn, isOwner, 
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.updateListing)) // update route
.delete(isLoggedIn, isOwner,
    wrapAsync(listingController.deleteListing)); // delete route


// Edit route
router.get("/:id/edit",
    isLoggedIn, isOwner,
    wrapAsync(listingController.renderEditForm));





module.exports = router;



