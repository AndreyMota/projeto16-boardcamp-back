import { Router } from "express";
import validateSchema from "../Middlewares/validateSchema.js";
import { RentalSchema } from "../Schemas/rentalSchema.js";
import { postRental, getRentals, endRental } from "../Controllers/rentalController.js";

const rentalRouter = Router();

rentalRouter.post('/rentals', validateSchema(RentalSchema), postRental);
rentalRouter.post('/rental/:id/return', endRental);
rentalRouter.get('/rentals', getRentals);

export default rentalRouter;