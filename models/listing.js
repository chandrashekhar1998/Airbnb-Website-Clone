const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },    
    description: {
        type: String,
    }, 
    image:{
        url:String,
        filename:String,
        
    },
    price: Number,
    location: String,
    country: String,
    review: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],  
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ["Point"], // 'location.type' must be 'Point'
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
    },
    
    // reviews: [{
    //     type: Schema.Types.ObjectId,
    //     ref: "Review"
    // }],
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({_id: { $in: listing.review }});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;




// const mongoose = require('mongoose');
// const Listing = require('../models/listing');
// const Review = require('../models/review');

// module.exports.deleteReview = async (req, res) => {
//     const { reviewId } = req.params;
//     const { id: listingId } = req.params; // Extract listingId from URL

//     if (!mongoose.Types.ObjectId.isValid(reviewId) || !mongoose.Types.ObjectId.isValid(listingId)) {
//         return res.status(400).send('Invalid ID');
//     }

//     try {
//         // Remove review reference from the listing
//         await Listing.findByIdAndUpdate(
//             listingId,
//             { $pull: { review: reviewId } } // Use 'review' field to pull the reviewId
//         );

//         // Delete review from Review collection
//         const result = await Review.findByIdAndDelete(reviewId);

//         if (!result) {
//             return res.status(404).send('Review not found');
//         }

//         res.send('Review deleted successfully');
//     } catch (error) {
//         console.error('Error deleting review:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };

