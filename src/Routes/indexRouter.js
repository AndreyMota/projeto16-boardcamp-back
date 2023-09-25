import { Router } from "express";
import accountRouter from "./accountRouter.js";
import gameRouter from "./gameRouter.js";
import cartRouter from "./cartRouter.js";

const router = Router();
router.get('/', (req, res) => res.send('Opa'));

router.use(accountRouter);
router.use(gameRouter);
router.use(cartRouter);

export default router;