import db from "../Database/databaseConnection.js";

export async function postRental(req, res) {
    try {
        const { customerId, gameId, daysRented } = req.body;

        // Verificar se customerId se refere a um cliente existente
        const customerCheck = await db.query('SELECT * FROM customers WHERE id = $1', [customerId]);
        if (customerCheck.rowCount === 0) {
            res.status(400).send('Customer not found');
            return;
        }

        // Verificar se gameId se refere a um jogo existente
        const gameCheck = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);
        if (gameCheck.rowCount === 0) {
            res.status(400).send('Game not found');
            return;
        }

        // Validar que daysRented é maior que 0
        if (daysRented <= 0) {
            res.status(400).send('Invalid daysRented');
            return;
        }

        // Verificar disponibilidade de jogos em estoque
        const stockTotal = gameCheck.rows[0].stockTotal;
        const rentedGames = await db.query('SELECT COUNT(*) FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL', [gameId]);
        const rentedCount = parseInt(rentedGames.rows[0].count);

        if (rentedCount >= stockTotal) {
            res.status(400).send('No available games in stock');
            return;
        }

        // Calcular o preço original
        const pricePerDay = gameCheck.rows[0].pricePerDay;
        const originalPrice = daysRented * pricePerDay;

        // Obter a data atual
        const rentDate = new Date();

        // Inserir o aluguel no banco de dados
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

        // Organizar os dados da maneira esperada
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
        // Verificar se o aluguel com o ID fornecido existe
        const rentalCheck = await db.query('SELECT * FROM rentals WHERE id = $1', [id]);

        if (rentalCheck.rowCount === 0) {
            res.status(404).send('Rental not found');
            return;
        }

        // Verificar se o aluguel já não está finalizado
        const rental = rentalCheck.rows[0];
        if (rental.returnDate !== null) {
            res.status(400).send('Rental already finalized');
            return;
        }

        // Obter a data atual
        const returnDate = new Date();

        // Calcular a delayFee (multa por atraso) se houver atraso na devolução
        const rentDate = new Date(rental.rentDate);
        const daysRented = rental.daysRented;
        const pricePerDay = rental.originalPrice / daysRented;
        let delayFee = 0;

        if (returnDate > rentDate) {
            const daysDelayed = Math.floor((returnDate - rentDate) / (1000 * 60 * 60 * 24));
            delayFee = daysDelayed * pricePerDay;
        }

        // Atualizar o aluguel com a data de retorno e a delayFee
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
        // Verificar se o aluguel com o ID fornecido existe
        const rentalCheck = await db.query('SELECT * FROM rentals WHERE id = $1', [id]);

        if (rentalCheck.rowCount === 0) {
            res.status(404).send('Rental not found');
            return;
        }

        // Verificar se o aluguel já está finalizado (returnDate preenchido)
        const rental = rentalCheck.rows[0];
        if (rental.returnDate !== null) {
            res.status(400).send('Rental already finalized');
            return;
        }

        // Excluir o aluguel
        const deleteQuery = 'DELETE FROM rentals WHERE id = $1';
        await db.query(deleteQuery, [id]);

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}
