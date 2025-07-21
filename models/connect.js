const mongoose = require("mongoose");
const User = require("./user");

const connectSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
  type: String,
  enum: ["sent", "accepted", "rejected"],
  default: "sent"
},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Connect", connectSchema);
