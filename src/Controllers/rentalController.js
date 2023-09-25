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


export async function getGames(req, res) {
    try {
        const result = await db.query('SELECT * FROM games');
        res.status(200).send(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
}