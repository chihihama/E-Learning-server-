import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/db.js";
import paypal from "paypal-rest-sdk";
import cors from "cors";

// Configuration des variables d'environnement
dotenv.config();


const app = express();

// Middleware pour parser les JSON
app.use(express.json());


app.use(cors());

// Connexion à la base de données
connectDB();


// Configuring PayPal SDK
export const instance = new paypal.configure({
  mode: "sandbox", // Change to 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// Route de test
app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/uploads", express.static("uploads"));

// Importation des routes
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/course.js";

// Utilisation des routes
app.use("/api", userRoutes);
app.use("/api", adminRoutes);
app.use("/api", courseRoutes);

// Lancement du serveur
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(`✅ MongoDB is connected`);
  console.log(`✅ PayPal SDK is configured`); 

});


// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
