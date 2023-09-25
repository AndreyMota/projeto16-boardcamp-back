import { Router } from "express";
import { postBook, getBooks } from "../Controllers/gameController.js";
import validateAuth from "../Middlewares/validateAuth.js";
import validateSchema from "../Middlewares/validateSchema.js";
import { addGameSchema } from "../Schemas/gameSchema.js"

const gameRouter = Router();

gameRouter.post('/games', validateSchema(addGameSchema), validateAuth, postBook);
gameRouter.get('/books', getBooks);

export default gameRouter;