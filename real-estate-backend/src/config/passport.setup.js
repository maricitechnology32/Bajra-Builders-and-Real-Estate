import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/users/google/callback', // Must match the one in Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      // This function is called after Google successfully authenticates the user
      try {
        // Find if a user already exists with this Google ID or email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If user exists, pass the user object to the next middleware
          return done(null, user);
        } else {
          // If user doesn't exist, create a new one
          const newUser = await User.create({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            // Password is not required for OAuth users. We can generate a random one
            // or modify the schema to not require a password for OAuth users.
            // For simplicity, we rely on the schema's default behavior for now.
            // A more robust solution might involve a separate field like 'authProvider'.
            password: Math.random().toString(36).slice(-8), // Temporary weak password
          });
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);