// URLとコントローラーを紐付けます。

import express from 'express';
import { checkBasicAuth, login } from '../controllers/authController.js';

const router = express.Router();

router.get('/basic-auth', checkBasicAuth);
router.post('/login', login);

export default router;