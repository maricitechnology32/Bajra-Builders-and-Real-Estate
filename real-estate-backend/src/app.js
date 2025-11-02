// // src/app.js
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import express from 'express';
// import i18nextMiddleware from 'i18next-http-middleware';
// import passport from 'passport';
// import i18next from './config/i18next.config.js';
// import './config/passport.setup.js';
// import appointmentRouter from './routes/appointment.routes.js';
// import callbackRequestRouter from './routes/callbackRequest.routes.js';
// import heroImageRouter from './routes/heroImage.routes.js';
// import inquiryRouter from './routes/inquiry.routes.js';
// import pageContentRouter from './routes/pageContent.routes.js';
// import postRouter from './routes/post.routes.js';
// import propertyRouter from './routes/property.routes.js';
// import savedSearchRouter from './routes/savedSearch.routes.js';
// import seoDataRouter from './routes/seoData.routes.js';
// import serviceRouter from './routes/service.routes.js';
// import testimonialRouter from './routes/testimonial.routes.js';
// import uploadRouter from './routes/upload.routes.js';
// import wishlistRouter from './routes/wishlist.routes.js';
// const app = express();
// // Use CORS middleware
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN, // Define allowed origin in .env
//     credentials: true,
//   })
// );
// // Middleware for parsing JSON request bodies
// app.use(express.json({ limit: '16kb' }));
// // Middleware for parsing URL-encoded request bodies
// app.use(express.urlencoded({ extended: true, limit: '16kb' }));
// app.use(cookieParser()); // Use cookie-parser middleware
// app.use(passport.initialize());
// app.use(i18nextMiddleware.handle(i18next));
// app.use('/api/v1/seo', seoDataRouter);
// // --- Routes ---
// import userRouter from './routes/user.routes.js';
// // Route declaration
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/properties', propertyRouter);
// app.use('/api/v1/inquiries', inquiryRouter);
// app.use('/api/v1/wishlist', wishlistRouter);
// app.use('/api/v1/testimonials', testimonialRouter);
// app.use('/api/v1/appointments', appointmentRouter);
// app.use('/api/v1/posts', postRouter);
// app.use('/api/v1/saved-searches', savedSearchRouter);
// app.use('/api/v1/callbacks', callbackRequestRouter);
// app.use('/api/v1/services', serviceRouter);  
// app.use('/api/v1/uploads', uploadRouter);
// app.use('/api/v1/hero-images', heroImageRouter);
// app.use('/api/v1/pages', pageContentRouter); 

//  app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Server is healthy!' });
// });
// export { app };


// src/app.js
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import i18nextMiddleware from 'i18next-http-middleware';
import passport from 'passport';
import i18next from './config/i18next.config.js';
import './config/passport.setup.js';
import appointmentRouter from './routes/appointment.routes.js';
import callbackRequestRouter from './routes/callbackRequest.routes.js';
import heroImageRouter from './routes/heroImage.routes.js';
import homepageRouter from './routes/homepage.routes.js';
import inquiryRouter from './routes/inquiry.routes.js';
import pageContentRouter from './routes/pageContent.routes.js';
import postRouter from './routes/post.routes.js';
import propertyRouter from './routes/property.routes.js';
import savedSearchRouter from './routes/savedSearch.routes.js';
import seoDataRouter from './routes/seoData.routes.js';
import serviceRouter from './routes/service.routes.js';
import testimonialRouter from './routes/testimonial.routes.js';
import uploadRouter from './routes/upload.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';

const app = express();
// Use CORS middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Define allowed origin in .env
    credentials: true,
  })
);
// Middleware for parsing JSON request bodies
app.use(express.json({ limit: '16kb' }));
// Middleware for parsing URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser()); // Use cookie-parser middleware
app.use(passport.initialize());
app.use(i18nextMiddleware.handle(i18next));
app.use('/api/v1/seo', seoDataRouter);
// --- Routes ---
import userRouter from './routes/user.routes.js';
// Route declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/inquiries', inquiryRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/testimonials', testimonialRouter);
app.use('/api/v1/appointments', appointmentRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/saved-searches', savedSearchRouter);
app.use('/api/v1/callbacks', callbackRequestRouter);
app.use('/api/v1/services', serviceRouter);  
app.use('/api/v1/uploads', uploadRouter);
app.use('/api/v1/hero-images', heroImageRouter);
app.use('/api/v1/pages', pageContentRouter); 
app.use('/api/v1/homepage', homepageRouter);


 app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is healthy!' });
});
export { app };

