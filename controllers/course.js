// controllers/courseController.js
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Payment } from "../models/payments.js";
import paypal from "paypal-rest-sdk";
import { Progress } from "../models/progress.js";

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({ courses });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  res.json({ course });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });
  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lectures });
  }

  if (!user.subscription.includes(req.params.id)) {
    return res.status(400).json({ message: "You have not subscribed to this course" });
  }

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lecture });
  }

  if (!user.subscription.includes(lecture.course.toString())) {
    return res.status(400).json({ message: "You have not subscribed to this course" });
  }

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).populate("subscription");
  res.json({ courses: user.subscription });
});

export const checkout = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (!course) return res.status(404).json({ message: "Course not found" });

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({ message: "Already subscribed" });
  }

  const create_payment_json = {
    intent: "sale",
    payer: { payment_method: "paypal" },
    redirect_urls: {
      return_url: `http://localhost:5173/payment-success?courseId=${course._id}&userId=${user._id}`,
      cancel_url: `http://localhost:5173/payment-cancel`,
    },
    transactions: [
      {
        amount: {
          currency: "USD",
          total: course.price.toString(),
        },
        description: `Payment for course ${course.title}`,
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) return res.status(500).json({ error });

    const approvalUrl = payment.links.find(link => link.rel === "approval_url")?.href;
    res.status(200).json({ forwardLink: approvalUrl });
  });
});

export const paymentVerification = TryCatch(async (req, res) => {
  const { paymentId, PayerID, userId, courseId } = req.body;

  paypal.payment.execute(paymentId, { payer_id: PayerID }, async (error, payment) => {
    if (error) return res.status(400).json({ message: "Payment failed", error });

    await Payment.create({
      userId,
      courseId,
      paymentId: payment.id,
      payerId: payment.payer.payer_info.payer_id,
      paymentStatus: payment.state,
      amount: payment.transactions[0].amount.total,
      currency: payment.transactions[0].amount.currency,
    });

    const user = await User.findById(userId);
    if (!user.subscription.includes(courseId)) {
      user.subscription.push(courseId);

      await Progress.create({
        course: courseId,
        completedLectures: [],
        user: userId,
      });

      await user.save();
    }

    res.status(200).json({ message: "Payment successful" });
  });
});

export const addProgress = TryCatch(async (req, res) => {
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  const { lectureId } = req.query;

  if (progress.completedLectures.includes(lectureId)) {
    return res.json({ message: "Progress already recorded" });
  }

  progress.completedLectures.push(lectureId);
  await progress.save();

  res.status(201).json({ message: "Progress updated" });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  if (!progress) {
    return res.status(404).json({ message: "Progress not found" });
  }

  const allLectures = await Lecture.countDocuments({ course: req.query.course });
  const completedLectures = progress.completedLectures.length;
  const courseProgressPercentage = Math.floor((completedLectures * 100) / allLectures);

  res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    progress,
  });
});
