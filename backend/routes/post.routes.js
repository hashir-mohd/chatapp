import {Router} from 'express';
import { getAllBlogPosts,
        publishAPost
} from '../controllers/post.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();



router
  .route("/")
  .get(getAllBlogPosts)
  .post(
    verifyJWT,
    upload.fields([
      {
        name: "video",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAPost
  );
export default router;