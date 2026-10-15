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

export default async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Sign in required" });
  }

  const accessToken = header.slice("Bearer ".length).trim();
  if (!accessToken) {
    return res.status(401).json({ message: "Sign in required" });
  }

  try {
    const { data, error } = await supabase().auth.getUser(accessToken);
    if (error || !data?.user?.email) {
      return res.status(401).json({ message: "Sign in required" });
    }

    const user = await prisma.users.findUnique({
      where: { email: data.user.email },
    });
    if (!user || user.is_deleted) {
      return res.status(401).json({ message: "Sign in required" });
    }

    req.actor = {
      id: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institution_id,
      siteId: user.site_id,
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Sign in required" });
  }
}
