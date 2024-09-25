const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "review",
            populate: { path: "author" }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
};

// module.exports.createListing = async (req, res) => {
//     let url = req.file.path;
//     let filename = req.file.filename;

//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = { url, filename};
//     await newListing.save();
//     req.flash('success', 'New Listing Created!');
//     res.redirect('/listings');
// };

// create listings
module.exports.createListing = async (req, res) => {
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();
    
    let url = req.file ? req.file.path : '';  // Ensure this handles the file data correctly
    let filename = req.file ? req.file.filename : '';

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (req.file) {
        newListing.image = { url, filename };  // Assign file details
    }

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash('success', 'New Listing Created!');
    res.redirect('/listings');
};

// module.exports.renderEditForm = async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id);
//     if (!listing) {
//         req.flash("error", "Listing you requested for does not exist");
//         return res.redirect("/listings");
//     }

//     let originalImageUrl = listing.image.url;
//     originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
//     res.render("listings/edit", { listing, originalImageUrl });
// };

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    // Check if listing.image.url exists
    let originalImageUrl = listing.image ? listing.image.url : null;
    if (originalImageUrl) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    }

    res.render("listings/edit", { listing, originalImageUrl });
};



module.exports.updateListing = async (req, res) => {
    let { id } = req.params;   // write const instead let if not works
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if( req.file) {
    let url = req.file ? req.file.path : '';  // Ensure this handles the file data correctly
    let filename = req.file ? req.file.filename : '';
    listing.image = { url, filename };
    await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};
