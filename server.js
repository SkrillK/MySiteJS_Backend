const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static('public'));

async function getDbCollection(dbAddress, dbName, dbCollectionName) {
	const client = new MongoClient(dbAddress);
	await client.connect();
	const db = client.db(dbName);
	return db.collection(dbCollectionName);
}

app.get('/tasks', async function (req, res) {
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'tasks');
	const data = await collection.find({}).toArray();
	res.send(data);
});

app.get('/tasks/:id', async function (req, res) {
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'tasks');
	const data = await collection.findOne({ _id: new ObjectId(req.params.id) });
	res.send(data);
});

app.post('/tasks', async function (req, res) {
	const task = { ...req.body, done: false };
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'tasks');
	await collection.insertOne(task);
	res.send(task);
});

app.patch('/tasks/:id', async function (req, res) {
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'tasks');
	await collection.updateOne({ _id: new ObjectId(req.params.id) }, { '$set': req.body });
	res.send({});
});

app.patch('/update/:id', async function (req, res) {
	const { _id, ...newData } = req.body;
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'tasks');
	const result = await collection.updateOne(
		{ '_id': new ObjectId(req.params.id) },
		{ '$set': newData }
	);
	if (result.matchedCount === 0) {
		return res.status(404).send({ message: 'Guitar not found' });
	}
	res.send({});
});

app.delete('/tasks/:id', async function (req, res) {
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'tasks');
	await collection.deleteOne({ _id: new ObjectId(req.params.id) });
	res.send({});
});

app.get('/options', async function (req, res) {
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'options');
	const data = await collection.findOne({});
	res.send(data || { brands: [], colors: [], forms: [], stringsOptions: [] });
});

app.patch('/options', async function (req, res) {
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'options');
	await collection.updateOne(
		{},
		{ '$set': req.body },
		{ upsert: true }
	);
	res.send({});
});

app.listen(port, function () {
	console.log('Server is started.');
});