import db from "../Database/databaseConnection.js";

export async function postCusto(req, res) {
    try {
        const { name, cpf, phone, birthday } = req.body;
        
        const isoDate = birthday.slice(0, 10)

        const query = `
        INSERT INTO customers (name, "cpf", phone, birthday)
        VALUES ($1, $2, $3, $4)
        `;
        const values = [name, cpf, phone, isoDate];

        const tem = await db.query('SELECT * FROM customers WHERE cpf = $1', [cpf]);
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

export async function getCustos(req, res) {
    try {
        const result = await db.query('SELECT * FROM customers');

        // Formatando o campo "birthday" para o formato "YYYY-MM-DD" em todos os objetos
        const customers = result.rows.map((customer) => {
            if (customer.birthday) {
                customer.birthday = customer.birthday.toISOString().split('T')[0];
            }
            return customer;
        });

        res.status(200).send(customers);
    } catch (err) {
        res.status(500).send(err.message);
    }
}


export async function getCustoId(req, res) {
    try {
        const aid = req.params.id;
        const result = await db.query('SELECT * FROM customers WHERE id = $1', [aid]);

        if (result.rowCount === 0) {
            res.status(404).send('Customer not found'); // Enviar uma mensagem de erro 404
            return; // Adicionar um 'return' aqui para evitar execução adicional
        }

        // Formatando o campo "birthday" para o formato "YYYY-MM-DD"
        const customer = result.rows[0];
        if (customer.birthday) {
            customer.birthday = customer.birthday.toISOString().split('T')[0];
        }

        // Enviar o objeto do cliente com o campo "birthday" formatado
        res.status(200).send(customer);
    } catch (err) {
        res.status(500).send(err.message);
    }
}


export async function putCusto(req, res) {
    try {
        const { name, cpf, phone, birthday } = req.body;
        const aid = req.params.id;
        const resu = await db.query('SELECT * FROM customers WHERE id = $1', [aid]);
        if (resu.rowCount === 0) {
            res.status(404).send('Customer not found'); // Enviar uma mensagem de erro 404
            return; // Adicionar um 'return' aqui para evitar execução adicional
        }
        const query = `
        UPDATE customers
        SET 
            name = $2,
            cpf = $3,
            phone = $4,
            birthday = $5
        WHERE id = $1
        `;
        const values = [aid, name, cpf, phone, birthday];

        const existingCustomer = await db.query('SELECT * FROM customers WHERE cpf = $1 AND id != $2', [cpf, aid]);
        if (existingCustomer.rowCount > 0) {
            return res.status(409).send('CPF already belongs to another customer');
        }

        const result = await db.query(query, values);
        res.sendStatus(200);

        
    } catch (err) {
        res.status(500).send(err.message);
    }
}