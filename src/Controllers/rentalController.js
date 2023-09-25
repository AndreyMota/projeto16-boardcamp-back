import db from "../Database/databaseConnection.js";

export async function postRental(req, res) {
    try {
        const { customerId, gameId, daysRented } = req.body;

        
        const customerCheck = await db.query('SELECT * FROM customers WHERE id = $1', [customerId]);
        if (customerCheck.rowCount === 0) {
            res.status(400).send('Customer not found');
            return;
        }

        
        const gameCheck = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);
        if (gameCheck.rowCount === 0) {
            res.status(400).send('Game not found');
            return;
        }

        
        if (daysRented <= 0) {
            res.status(400).send('Invalid daysRented');
            return;
        }

        
        const stockTotal = gameCheck.rows[0].stockTotal;
        const rentedGames = await db.query('SELECT COUNT(*) FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL', [gameId]);
        const rentedCount = parseInt(rentedGames.rows[0].count);

        if (rentedCount >= stockTotal) {
            res.status(400).send('No available games in stock');
            return;
        }

        
        const pricePerDay = gameCheck.rows[0].pricePerDay;
        const originalPrice = daysRented * pricePerDay;

        
        const rentDate = new Date();

        
        const query = `
            INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice", "returnDate", "delayFee")
            VALUES ($1, $2, $3, $4, $5, NULL, NULL)
        `;
        const values = [customerId, gameId, daysRented, rentDate, originalPrice];

        const result = await db.query(query, values);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
}


export async function getRentals(req, res) {
    try {
        const query = `
        SELECT 
            rentals.id, 
            rentals."customerId", 
            rentals."gameId", 
            rentals."rentDate", 
            rentals."daysRented", 
            rentals."returnDate", 
            rentals."originalPrice", 
            rentals."delayFee", 
            customers.id AS "customer.id", 
            customers.name AS "customer.name", 
            games.id AS "game.id", 
            games.name AS "game.name"
        FROM rentals
        JOIN customers ON rentals."customerId" = customers.id
        JOIN games ON rentals."gameId" = games.id
        `;

        const result = await db.query(query);

        
        const rentals = result.rows.map((row) => {
            return {
                id: row.id,
                customerId: row.customerId,
                gameId: row.gameId,
                rentDate: row.rentDate.toISOString().split('T')[0],
                daysRented: row.daysRented,
                returnDate: row.returnDate ? row.returnDate.toISOString().split('T')[0] : null,
                originalPrice: row.originalPrice,
                delayFee: row.delayFee,
                customer: {
                    id: row['customer.id'],
                    name: row['customer.name']
                },
                game: {
                    id: row['game.id'],
                    name: row['game.name']
                }
            };
        });

        res.status(200).send(rentals);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function endRental(req, res) {
    const { id } = req.params;

    try {
        
        const rentalCheck = await db.query('SELECT * FROM rentals WHERE id = $1', [id]);

        if (rentalCheck.rowCount === 0) {
            res.status(404).send('Rental not found');
            return;
        }

        
        const rental = rentalCheck.rows[0];
        if (rental.returnDate !== null) {
            res.status(400).send('Rental already finalized');
            return;
        }

        
        const returnDate = new Date();

        
        const rentDate = new Date(rental.rentDate);
        const daysRented = rental.daysRented;
        const pricePerDay = rental.originalPrice / daysRented;
        
        
        const daysDelayed = Math.floor((returnDate - rentDate) / (1000 * 60 * 60 * 24));
        
        
        const delayFee = daysDelayed * pricePerDay;

        
        const updateQuery = `
            UPDATE rentals
            SET "returnDate" = $1, "delayFee" = $2
            WHERE id = $3
        `;
        const updateValues = [returnDate, delayFee, id];

        await db.query(updateQuery, updateValues);

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}


export async function deleteRental(req, res) {
    const { id } = req.params;

    try {

        const rentalCheck = await db.query('SELECT * FROM rentals WHERE id = $1', [id]);

        if (rentalCheck.rowCount === 0) {
            res.status(404).send('Rental not found');
            return;
        } 

        const rental = rentalCheck.rows[0];
        if (rental.returnDate === null) {
            res.status(400).send('Rental not finalized');
            return;
        }

        const deleteQuery = 'DELETE FROM rentals WHERE id = $1';
        await db.query(deleteQuery, [id]);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}
