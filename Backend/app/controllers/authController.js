import AuthService from "../services/authService.js";
import prisma from "../config/prisma.js";
class AuthController {
    static async signUp(req, res) {
        try {
            const { email, firstName, lastName, phone, password, role } = req.body;
            const profile = {
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                phone,
                role,
            };
            const user = await AuthService.SignUp(profile);
            if (user.error) {
                return res.status(400).json({ message: user.error });
            }
            return res.status(200).json({ message: "User created", data: user.data.user });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    static async signIn(req, res) {
        try {
            const { email, password } = req.body;
            const user = await AuthService.SignIn(email, password);
            if (user.error) {
                return res.status(400).json({ message: user.error });
            }
            const userData = await prisma.users.findUnique({ where: { email } });
            const session = user.data?.session;
            return res.status(200).json({
                message: "User signed in",
                data: userData,
                ...(session && {
                    session: {
                        accessToken: session.access_token,
                        refreshToken: session.refresh_token,
                    },
                }),
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await AuthService.ResetPassword(email);
            if (user.error) {
                return res.status(400).json({ message: user.error });
            }
            return res.status(200).json({ message: "Password reset email sent", data: user.data });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    static async updatePassword(req, res) {
        try {
            const { password, accessToken, refreshToken } = req.body;
            const user = await AuthService.UpdatePassword({
                password,
                accessToken,
                refreshToken,
            });
            if (user.error) {
                return res.status(400).json({ message: user.error });
            }
            return res.status(200).json({ message: "Password updated", data: user.data });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    static async signOut(req, res) {
        try {
            const { accessToken, refreshToken } = req.body;
            if (!accessToken || !refreshToken) {
                return res.status(400).json({ message: "accessToken and refreshToken are required" });
            }
            const result = await AuthService.SignOut(accessToken, refreshToken);
            if (result.error) {
                return res.status(400).json({ message: result.error.message });
            }
            return res.status(200).json({ message: "User signed out" });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}
export default AuthController;