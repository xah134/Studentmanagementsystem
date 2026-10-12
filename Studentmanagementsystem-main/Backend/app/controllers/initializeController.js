import { Role } from "../types/user.js";
import AuthService from "../services/authService.js";
import prisma from "../config/prisma.js";

class InitializeController {
    static async checkUserExists(req, res) {
        try {
            const count = await prisma.users.count();
            return res.status(200).json({ exists: count > 0 });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async createUser(req, res) {
        try {
            const count = await prisma.users.count();
            if (count > 0) {
                return res.status(403).json({ message: "A system admin already exists" });
            }

            const { email, password } = req.body;
            const user = await AuthService.SignUp({
                email,
                password,
                role: Role.SYSTEM_ADMIN,
            });
            if (user.error) {
                return res.status(400).json({ message: user.error });
            }
            return res.status(200).json({ message: "User created", data: user.data });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export default InitializeController;
