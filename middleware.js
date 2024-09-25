const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listings!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// module.exports.isOwner = async (req, res, next) => {
//     let { id } = req.params;
//         let listing = await Listing.findById(id);
//         if (!Listing.owner.equals(res.locals.currUser._id)) {
//             req.flash("error", "you don't have permission to edit");
//             return res.redirect(`/listings/${id}`);
//         };
//         next();
// };


  

module.exports.isOwner = async function(req, res, next) {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        if (!listing.owner) {
            req.flash("error", "Listing has no owner");
            return res.redirect("/listings");
        }

        if (!listing.owner.equals(res.locals.currUser._id)) {
            req.flash("error", "You do not have permission to do that");
            return res.redirect("/listings");
        }

        next();
    } catch (err) {
        next(err);
    }
};



module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message); // Provide specific error message
    }
    next();
};



module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


// module.exports.isReviewAuthor = async (req, res, next) => {
//     let { reviewId } = req.params;
//     let review = await Review.findById(reviewId);
//     if (!review.author.equals(res.locals.currUser._id)) {
//         req.flash("error", "you are not the author of this review");
//         return res.redirect(`/listings/${listing._id}`);
//     }
//     next();
// };

module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        console.log('Review ID:', reviewId); // Log the review ID

        const review = await Review.findById(reviewId);
        if (!review) {
            console.log('Review not found with ID:', reviewId); // Log if review is not found
            req.flash("error", "Review not found");
            return res.redirect("/listings");
        }

        if (!review.author) {
            console.log('Review author information not available'); // Log if author is not found
            req.flash("error", "Review author information not available");
            return res.redirect("/listings");
        }

        if (!review.author.equals(res.locals.currUser._id)) {
            console.log('Current user is not the author of the review'); // Log if the user is not the author
            req.flash("error", "You are not the author of this review");
            return res.redirect(`/listings/${review.listing}`); // Assuming `review.listing` contains the listing ID
        }

        next();
    } catch (err) {
        console.error('Error in isReviewAuthor middleware:', err); // Log the error
        next(err);
    }
};

