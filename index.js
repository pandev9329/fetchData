const axios = require('axios');
const dbo = require("./db/conn");
var express = require('express');
var cors = require('cors');
var bodyparser = require('body-parser');
var prevData = require("./prevData.json");

const APIURL = 'https://api.thegraph.com/subgraphs/name/hch86702/phoenix';


var app = express();
app.use(cors({ origin: "*" }));
app.use(bodyparser.json());
app.post("/update", function (req, res) {
	res.send("update");
});


app.listen(process.env.PORT || 80);

// dbo.connectToServer(function (err) {
// 	if (err) {
// 		console.error(err);
// 	} else {

// 		var db = dbo.getDb();
// 		var app = express();
// 		app.use(cors({ origin: "*" }));
// 		app.use(bodyparser.json());

// 		app.post("/update", function (req, res) {
// 			getData(db.collection('nests'));
// 			res.send("");
// 		});

// 		app.post("/get_count", async function (req, res) {
// 			var count = await db.collection('nests').distinct('buyer');
// 			res.json({ count: count.length });
// 		});
// 		app.post("/get_detail", async function (req, res) {
// 			var list = await db.collection('nests').aggregate([
// 				{ $group: { _id: "$buyer", total: { $sum: 1 } } },
// 				{ $sort: { total: -1 } }
// 			]).toArray();
// 			res.json({ data: list });
// 		});

// 		async function setPrevData() {
// 			var temp = [];
// 			prevData.forEach(element => {
// 				temp.push({ __typename: "PurchasedNode", createTime: element.createTime, buyer: element.buyer });
// 			});

// 			var count = await db.collection('nests').find({ createTime: temp[0].createTime, buyer: temp[0].buyer }).count();
// 			if (count > 0) {

// 			} else if (count == 0) {
// 				const insertResult = await db.collection('nests').insertMany(temp);
// 				console.log('Inserted documents =>', insertResult);
// 			}
// 		}
// 		setPrevData();

// 		setInterval(() => {
// 			getData(db.collection('nests'));
// 		}, 100000);

// 		app.listen(80, () => console.log('Listening on port 9000'));
// 	}

// });


// async function getData(collection) {

// 	var list = await collection.find().sort({ createTime: -1 }).limit(1).toArray();
// 	var lastCreateTime = '1000000000';
// 	if (list.length != 0) {
// 		lastCreateTime = list[0].createTime;
// 	}
// 	const query = {
// 		query: `{purchasedNodes(first: 1000 skip: 0 orderBy: createTime orderDirection: asc where: {createTime_gt: ${lastCreateTime}}) { buyer createTime __typename}}`,
// 		variables: {}
// 	};
// 	// console.log("query", query);
// 	axios.post(APIURL, query)
// 		.then(async function (response) {
// 			if (response.data.data.purchasedNodes && response.data.data.purchasedNodes.length > 0) {
// 				const insertResult = await collection.insertMany(response.data.data.purchasedNodes);
// 				console.log('Inserted documents =>', insertResult);
// 			}
// 		})
// 		.catch(function (error) {
// 			console.log(error);
// 		});
// }


