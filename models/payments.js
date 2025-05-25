import mongoose from "mongoose";

const schema = new mongoose.Schema({
  paypal_order_id: {
    type: String,
    required: true,
  },
  paypal_payment_id: {
    type: String,
    required: true,
  },
  paypal_signature: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Payment = mongoose.model("Payment", schema);
