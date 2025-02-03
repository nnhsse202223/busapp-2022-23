"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    bus: {
        type: Number,
        required: true,
    },
    subscription: {
        type: String,
        required: false,
    },
});
const Subscription = mongoose.model("Subscription", schema);
module.exports = Subscription;
//# sourceMappingURL=subscription.js.map