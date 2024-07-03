const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true },
    post: { type: String, required: true },
    timeStamp: { type: Date, default: Date.now },
    published: {type: Boolean},
    username: { type: Schema.ObjectId, ref: "User", required: true },
}, {
    toJSON: {virtuals: true}
});

PostSchema.virtual("url").get(function() {
    return "/posts/" + this._id;
})

PostSchema.virtual("date_formatted").get(function () {
    return DateTime.fromJSDate(this.timeStamp).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("Post", PostSchema);