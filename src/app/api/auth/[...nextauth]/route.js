import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session?.user) {
                // Set user.id to the database user ID (stored in token during jwt callback)
                session.user.id = token.dbUserId || token.sub;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            // On first sign in (when user object is present), find or create user in database
            if (user && account?.provider === 'google') {
                try {
                    await connectDB();
                    
                    // Find or create user in database
                    const dbUser = await User.findOneAndUpdate(
                        { 
                            $or: [
                                { email: user.email },
                                { googleId: account.providerAccountId }
                            ]
                        },
                        {
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            googleId: account.providerAccountId,
                        },
                        {
                            upsert: true,
                            new: true,
                            setDefaultsOnInsert: true
                        }
                    );
                    
                    // Store database user ID in token
                    token.dbUserId = dbUser._id.toString();
                    token.googleId = account.providerAccountId;
                } catch (error) {
                    console.error('Error finding/creating user:', error);
                    // Fallback to Google ID if DB operation fails
                    token.dbUserId = token.sub;
                }
            }
            // If dbUserId is missing (e.g., from old sessions), try to find user by Google ID
            else if (!token.dbUserId && token.googleId) {
                try {
                    await connectDB();
                    const dbUser = await User.findOne({ googleId: token.googleId });
                    if (dbUser) {
                        token.dbUserId = dbUser._id.toString();
                    }
                } catch (error) {
                    console.error('Error looking up user:', error);
                }
            }
            
            return token;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
