import { Router } from "express";
import gameRouter from "./gameRouter.js";
import custoRouter from "./customerRouter.js";

const router = Router();
router.get('/', (req, res) => res.send('Opa'));

router.use(gameRouter);
router.use(custoRouter);

export default router;