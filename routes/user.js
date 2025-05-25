import express from 'express';
import { forgotPassword, loginUser, MyProfile, register, resetPassword, verifyUser } from "../controllers/user.js";
import { isAuth } from '../middlewares/isAuth.js';
import { addProgress, getYourProgress } from '../controllers/course.js';


const router = express.Router();

router.post("/user/register", register);        // inscription
router.post("/user/verify", verifyUser);        // vérification par OTP
router.post("/user/login", loginUser);          // connexion
router.get("/user/me", isAuth, MyProfile);      // profil protégé
router.post("/user/forgot", forgotPassword); // mot de passe oublié
router.post("/user/reset", resetPassword);
router.post("/user/progress", isAuth, addProgress); // ajouter la progression de l'utilisateur
router.get("/user/progress",isAuth, getYourProgress); // obtenir la progression de l'utilisateur


export default router;