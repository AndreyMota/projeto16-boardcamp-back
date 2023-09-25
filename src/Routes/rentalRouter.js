import { Router } from "express";
import validateSchema from "../Middlewares/validateSchema.js";
import { RentalSchema } from "../Schemas/rentalSchema.js";
import { postRental, getRentals, endRental, deleteRental } from "../Controllers/rentalController.js";

const rentalRouter = Router();

rentalRouter.post('/rentals', validateSchema(RentalSchema), postRental);
rentalRouter.post('/rentals/:id/return', endRental);
rentalRouter.get('/rentals', getRentals);
rentalRouter.delete('/rentals/:id', deleteRental);

export default rentalRouter;