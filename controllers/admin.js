import TryCatch from "../middlewares/TryCatch.js";
import {Courses} from "../models/courses.js";
import { Lecture } from "../models/Lecture.js";
import unlink from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js"; 


export const createCourse = TryCatch(async (req, res) => {
    const { title, description, category, createdBy, duration, price,} = req.body;
  
    const image = req.file;

    await Courses.create({
        title,
        description,
        category,
        createdBy,
        duration,
        price,
        image: image?.path
    });
    res.status(201).json({
        message: "Course Created Successfully",
    });
 });
export const addLecture = TryCatch(async (req, res) => {
    const course = await Courses.findById(req.params.id) 
    if (!course) 
        return res.status(404).json({
            message: "No course with this id ",
        });

    const { title, description} = req.body

    const file = req.file

    const lecture = await  Lecture.create({
        title,
        description,
        video: file?.path,
        course: course._id,
    });

    res.status(201).json({
        message: "Lecture added",
        lecture,
    })
}); 
export const deleteLecture = TryCatch(async (req, res) => { 
    const lecture = await Lecture.findById(req.params.id)

    fs.unlink(lecture.video,()=>{
        console.log("Video deleted");
    });

    await lecture.deleteOne();

        res.json({message:"Lecture deleted"})
});

const unlinkAsync =  promisify(fs.unlink)

export const deleteCourse = TryCatch(async (req, res) => {
   const course = await Courses.findById(req.params.id);
   if (!course) return res.status(404).json({ message: "Course not found" });

   const lectures = await Lecture.find({ course: course._id });

   // Delete lecture videos
   await Promise.all(
     lectures.map(async (lecture) => {
       await unlinkAsync(lecture.video);
       console.log("Video deleted");
     })
   );

   // Delete course image
   fs.unlink(course.image, () => {
     console.log("Image deleted");
   });

   // ✅ Fix: Properly delete lecture documents
   await Lecture.deleteMany({ course: req.params.id });

   // Delete the course
   await course.deleteOne();

   // Remove course from users' subscriptions
   await User.updateMany({}, { $pull: { subscription: req.params.id } });

   res.json({ message: "Course deleted" });
});


export const getAllStats = TryCatch(async (req, res) => {
    const totalCourses = (await Courses.find()).length;
    const totalLectures = (await Lecture.find()).length;
    const totalUsers = (await User.find()).length;

    const stats = {
        totalCourses,
        totalLectures,
        totalUsers,
    };

    res.json({
        stats,
    })
});
export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.json({ users });
});
export const updateRole = TryCatch(async (req, res) => {
  if (req.user.mainrole !== "superadmin") {
    return res.status(403).json({
      message: "This action is restricted to superadmin only",
    });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const role = user.role?.trim().toLowerCase();
  console.log("User role is:", role);

  if (role === "user") {
    user.role = "admin";
    await user.save();
    return res.status(200).json({
      message: "Role updated to admin",
    });
  }

  if (role === "admin") {
    user.role = "user";
    await user.save();
    return res.status(200).json({
      message: "Role updated to user",
    });
  }

  return res.status(400).json({
    message: "Invalid role state",
  });
});


        