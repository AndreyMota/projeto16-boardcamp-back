import Joi from "joi";

export const RentalSchema = Joi.object({
    customerId: Joi.number().required().min(1),
    gameId: Joi.number().required().min(1),
    daysRented: Joi.number().required().min(1)
});