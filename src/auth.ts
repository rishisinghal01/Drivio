import { error } from "console"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {
                    type: "email",
                    label: "Email",
                    placeholder: "johndoe@gmail.com",
                },
                password: {
                    type: "password",
                    label: "Password",
                    placeholder: "*****",
                },
            },
            async authorize(credentials, request) {
                if (!credentials.email || !credentials.password) {
                    throw error("Missing Credentials");
                }
                const email = credentials.email;
                const password = credentials.password as string;

                if (email === "admin@drivio.com" && password === process.env.ADMIN_PASSWORD) {
                    return {
                        id: "admin-system",
                        name: "System Admin",
                        email: "admin@drivio.com",
                        role: "admin",
                    }
                }

                await connectDb();
                const user = await User.findOne({ email })
                if (!user) {
                    throw Error("No user exits with this email first register user ")
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    throw Error("Invalid Credentials");
                }
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,

                }
            }
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET
        })
    ], // abhi hm srf ye dekh rhe h ki is our user is authenticate or not and we use valid email for that 
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider == "google") {
                await connectDb()
                const dbuser = await User.findOne({ email: user.email })
                if (!dbuser) {
                    await User.create({
                        name: user.name,
                        email: user.email,


                    })
                }

                user.id = dbuser._id.toString();
                user.role = dbuser.role;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.name = user.name
                token.email = user.email
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ token, session }) {
            if (session.user) {
                
                session.user.name = token.name as string
                session.user.email = token.email as string
                session.user.id = token.id as string
                session.user.role = token.role as string
            }
            return session
        }
    }, // help us to set cookies or another things when we came to login page
    pages: {
        signIn: "/signin",
        error: "signin"
    },
    session: {
        strategy: "jwt",
        maxAge: 10 * 24 * 60 * 60
    },
    secret: process.env.AUTH_SECRET!
})