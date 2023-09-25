import { Router } from "express";
import gameRouter from "./gameRouter.js";
import custoRouter from "./customerRouter.js";
import rentalRouter from "./rentalRouter.js";

const router = Router();
router.get('/', (req, res) => res.send('Opa'));

router.use(gameRouter);
router.use(custoRouter);
router.use(rentalRouter);

export default router;