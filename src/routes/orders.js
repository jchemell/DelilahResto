const express = require('express');
const { sql, sequelize } = require('../../database/database');
const Router = express.Router();
const { isAdmin, isLogged, isAccesingOwnData } = require('../lib/helpers');

//! ROUTES /ORDERS

Router.post('/orders', isLogged, async (req, res) => {
	try {
		let answer;
		let inserts = [];
		let order = req.body;
		inserts.push(
			sequelize
				.query(
					`INSERT INTO orders (payment_id, status_id, user_id) VALUES (${order.payment_id}, ${order.status_id}, ${order.user_id})`
				)
				.then((index) => {
					answer = index[0];
					order.items.forEach((item) => {
						sequelize.query(
							`INSERT INTO order_details (order_id, product_id, quantity) VALUES(${index[0]}, ${item.product_id}, ${item.quantity})`
						);
					});
				})
		);

		Promise.all(inserts).then(async () => {
			answer = await sql(`SELECT * FROM orders WHERE id = ?`, answer);
			res.status(201).json(answer);
		});
	} catch (e) {
		console.log(e.message);
		res.sendStatus(500);
	}
});

Router.get('/orders', isAdmin, async (_req, res) => {
	try {
		const query = 'SELECT * FROM orders WHERE is_deleted = 0';
		const answer = await sequelize.query(query);
		res.status(200).send(answer[0]);
	} catch {
		res.sendStatus(500);
	}
});

Router.get(
	'/orders/:username',
	isLogged,
	isAccesingOwnData,
	async (req, res) => {
		try {
			let { username } = req.params;
			let regex = new RegExp('^[\\w]+$');
			if (!regex.test(username)) return res.sendStatus(400);
			const answer = await sql(
				`SELECT orders.id, products.description, orders.created_at, order_details.quantity, users.fullname, status.status, payment.method
										FROM users
										JOIN orders ON orders.user_id = users.id
										JOIN order_details ON orders.id = order_details.order_id
										JOIN products ON order_details.product_id = products.id
										JOIN status ON orders.status_id = status.id
										JOIN payment ON orders.payment_id = payment.id
										WHERE username = ? AND orders.is_deleted = 0;`,
				username
			);
			if (!answer[0]) return res.sendStatus(404);
			let id = answer[0].id;
			let orders = [],
				items = [],
				buffer = {};
			answer.forEach((order) => {
				if (id == order.id) {
					items.push({
						description: order.description,
						quantity: order.quantity,
					});
					buffer = {
						id: order.id,
						time: order.created_at,
						user: order.fullname,
						status: order.status,
						payment: order.method,
					};
				}
				if (id != order.id) {
					buffer.items = items;
					orders.push(buffer);
					items = [];
					buffer = {
						id: order.id,
						time: order.created_at,
						user: order.fullname,
						status: order.status,
						payment: order.method,
					};
					items.push({
						description: order.description,
						quantity: order.quantity,
					});
					id = order.id;
				}
			});
			buffer.items = items;
			orders.push(buffer);

			res.send(orders);
		} catch (e) {
			console.log(e.message);
			res.sendStatus(500);
		}
	}
);

Router.put('/orders/:id', isAdmin, async (req, res) => {
	try {
		let { id } = req.params;
		let { status } = req.body;
		let regex = new RegExp('^[0-9]+$');
		if (!regex.test(id) || !status) return res.sendStatus(400);
		let query = `UPDATE orders SET status_id = "${status}" WHERE id = "${id}"`;
		let [answer] = await sequelize.query(query);
		if (!answer.changedRows)
			return res.status(409).send([{ err: 'Nothing changed.' }]);
		// query = `SELECT * FROM orders WHERE id = ${id} AND is_deleted = 0`;
		// answer = await sequelize.query(query);
		answer = await sql('SELECT * FROM orders WHERE id = ?', id);
		res.send(answer);
	} catch (e) {
		console.log(e.message);
		res.sendStatus(500);
	}
});

Router.delete('/orders/:id', isAdmin, async (req, res) => {
	try {
		let { id } = req.params;
		let regex = new RegExp('^[0-9]+$');
		if (!regex.test(id)) return res.sendStatus(400);
		let query = `SELECT is_deleted FROM orders WHERE id = ${id} AND is_deleted = 0`;
		let answer = await sequelize.query(query);
		if (!answer[0][0]) return res.sendStatus(404);
		query = `UPDATE orders SET is_deleted = 1 WHERE id = ${id}`;
		await sequelize.query(query);
		res.sendStatus(204);
	} catch {
		res.sendStatus(500);
	}
});

module.exports = Router;
