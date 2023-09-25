import db from "../Database/databaseConnection.js";

export async function postGame(req, res) {
    try {
        const { name, image, stockTotal, pricePerDay } = req.body;
        const query = `
        INSERT INTO games (name, image, "stockTotal", "pricePerDay")
        VALUES ($1, $2, $3, $4)
        `;
        const values = [name, image, stockTotal, pricePerDay];

        const tem = await db.query('SELECT * FROM games WHERE name = $1', [name]);
        if (tem.rowCount !== 0) {
            res.sendStatus(409);
            return   
        }
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