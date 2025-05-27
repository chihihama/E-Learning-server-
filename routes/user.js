import express from 'express';
import { forgotPassword, loginUser, MyProfile, register, resetPassword, verifyUser } from "../controllers/user.js";
import { isAuth } from '../middlewares/isAuth.js';


const router = express.Router();

router.post("/user/register", register);        // inscription
router.post("/user/verify", verifyUser);        // vérification par OTP
router.post("/user/login", loginUser);          // connexion
router.get("/user/me", isAuth, MyProfile);      // profil protégé
router.post("/user/forgot", forgotPassword); // mot de passe oublié
router.post("/user/reset", resetPassword);


export default router;