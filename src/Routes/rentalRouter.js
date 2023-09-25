import { Router } from "express";
import validateSchema from "../Middlewares/validateSchema.js";
import { RentalSchema } from "../Schemas/rentalSchema.js";
import { postRental } from "../Controllers/rentalController.js";

const rentalRouter = Router();

rentalRouter.post('/rentals', validateSchema(RentalSchema), postRental);

export default rentalRouter;