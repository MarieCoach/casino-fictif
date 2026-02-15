const User = require("./models/User");
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");


const app = express();
const PORT = 3000;

// Remplace par ta vraie connection string
const MONGO_URI = "mongodb+srv://admincasino:IKTKFiX05ZyiWaHL@cluster0.e5pqs6k.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.log("❌ Erreur MongoDB :", err));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({ message: "Email déjà utilisé" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword
        });


        await newUser.save();

        res.json({ message: "Compte créé avec 100€ !" });

    } catch (error) {
        console.log(error);
        res.json({ message: "Erreur lors de l'inscription" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: "Utilisateur introuvable" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ message: "Mot de passe incorrect" });
        }

        res.json({
            message: "Connexion réussie",
            balance: user.balance
        });

    } catch (error) {
        console.log(error);
        res.json({ message: "Erreur lors de la connexion" });
    }
});

app.post("/play", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: "Utilisateur introuvable" });
        }

        if (user.balance < 10) {
            return res.json({ message: "Solde insuffisant", balance: user.balance });
        }

        // Déduire la mise
        user.balance -= 10;

        // 50% chance de gagner 20€
        const win = Math.random() < 0.5;

        if (win) {
            user.balance += 20;
            await user.save();
            return res.json({
                message: "🎉 Gagné ! +20€",
                balance: user.balance
            });
        } else {
            await user.save();
            return res.json({
                message: "❌ Perdu -10€",
                balance: user.balance
            });
        }

    } catch (error) {
        console.log(error);
        res.json({ message: "Erreur jeu" });
    }
});

app.post("/bonus", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: "Utilisateur introuvable" });
        }

        const today = new Date();
        const lastBonus = user.lastBonus;

        if (lastBonus) {
            const diffTime = today - lastBonus;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays < 1) {
                return res.json({
                    message: "Bonus déjà récupéré aujourd'hui",
                    balance: user.balance
                });
            }
        }

        user.balance += 5;
        user.lastBonus = today;
        await user.save();

        res.json({
            message: "🎁 Bonus quotidien +5€",
            balance: user.balance
        });

    } catch (error) {
        console.log(error);
        res.json({ message: "Erreur bonus" });
    }
});


app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});