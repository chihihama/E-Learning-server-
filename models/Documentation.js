import mongoose from "mongoose";

const schema = new mongoose.Schema({
 title:{
    type: String,
    required: true,
 },
 description:{
    type: String,
    required: true,
 },
 pdf:{
    type: String,
    required: true,
 },
 course:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courses',
    required: true,
 },
 createdAt:{
    type: Date,
    default: Date.now,
 },
});

export const Documentation = mongoose.model("Documentation", schema);
export default Documentation;