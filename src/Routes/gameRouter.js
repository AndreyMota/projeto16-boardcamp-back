import { Router } from "express";
import { postGame, getGames } from "../Controllers/gameController.js";
import validateAuth from "../Middlewares/validateAuth.js";
import validateSchema from "../Middlewares/validateSchema.js";
import { addGameSchema } from "../Schemas/gameSchema.js"

const gameRouter = Router();

gameRouter.post('/games', validateSchema(addGameSchema), postGame);
gameRouter.get('/games', getGames);

export default gameRouter;