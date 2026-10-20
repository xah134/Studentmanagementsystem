import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import prisma from "../config/prisma.js";

function supabase() {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    });
}

class AuthService {
    static async SignUp(user) {
        try {
            const { error } = await supabase().auth.signUp({
                email: user.email,
                password: user.password,
            });
            if (error) {
                return { error: error.message };
            }
            const { password, ...userData } = user;
            const createdUser = await prisma.users.create({ data: userData });

            return { success: true, data: createdUser };
        } catch (error) {
            return { error: error.message };
        }
    }

    static async SignIn(email, password) {
        try {
            const { data, error } = await supabase().auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                return { error: error.message };
            }
            return { success: true, data };
        } catch (error) {
            return { error: error.message };
        }
    }
    static async ResetPassword(email) {
        try {
            const { data, error } = await supabase().auth.resetPasswordForEmail(email, { redirectTo: `${process.env.FRONTEND_URL}/update-password` });
            if (error) {
                return { error: error.message };
            }
            return { success: true, data };
        } catch (error) {
            return { error: error.message };
        }
    }
    static async UpdatePassword({ password, accessToken, refreshToken }) {
        try {
            const client = supabase();
            if (accessToken && refreshToken) {
                const { error: sessionError } = await client.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });
                if (sessionError) {
                    return { error: sessionError.message };
                }
            }
            const { data, error } = await client.auth.updateUser({ password });
            if (error) {
                return { error: error.message };
            }
            return { success: true, data };
        } catch (error) {
            return { error: error.message };
        }
    }

    static async SignOut(accessToken, refreshToken) {
        try {
            const client = supabase();
            const { error: sessionError } = await client.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
            if (sessionError) {
                return { error: sessionError.message };
            }

            const { error } = await client.auth.signOut();
            if (error) {
                return { error: error.message };
            }
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    }
}

export default AuthService;
