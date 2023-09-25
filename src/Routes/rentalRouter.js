import { Router } from "express";
import validateSchema from "../Middlewares/validateSchema.js";
import { RentalSchema } from "../Schemas/rentalSchema.js";
import { postRental, getRentals } from "../Controllers/rentalController.js";

const rentalRouter = Router();

rentalRouter.post('/rentals', validateSchema(RentalSchema), postRental);
rentalRouter.get('/rentals', getRentals);

export default rentalRouter;