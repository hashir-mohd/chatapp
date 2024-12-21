import {Router} from 'express';
import {registerUser
    , loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser
} from '../controllers/user.controller.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

// router.route('/').get((req, res) => {
//     res.send('User route');
// });

router.route("/register").post(
  registerUser
);
router.route("/login").post(
  loginUser
);
router.route("/logout").post(
  verifyJWT,
  logoutUser
);
router.route("/refresh-token").post(
  refreshAccessToken
);
router.route("/current-user").get(
  verifyJWT,
  getCurrentUser
);

export default router;