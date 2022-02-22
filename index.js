const axios = require('axios');
const dbo = require("./db/conn");
var express = require('express');
var cors = require('cors');
var bodyparser = require('body-parser');
var prevData = require("./prevData.json");

const APIURL = 'https://api.thegraph.com/subgraphs/name/hch86702/phoenix';
const NFTAPIURL = 'https://api.thegraph.com/subgraphs/name/david86702/phoenix-new';

const query1 = `{
	purchasedNFTs(first: 1000, skip: 0, orderBy: createTime, orderDirection: asc, where: {createTime_gt: 0}) {
	  addr
	  typeOfNFT
	  createTime
	}
  }`;
  


dbo.connectToServer(function (err) {
	if (err) {
		console.error(err);
	} else {

		var db = dbo.getDb();
		var app = express();
		app.use(cors({ origin: "*" }));
		app.use(bodyparser.json());

		app.post("/update", function (req, res) {
			getData(db.collection('nests'));
			res.send("");
		});

		app.post("/get_count", async function (req, res) {
			var count = await db.collection('nests').distinct('buyer');
			res.json({ count: count.length });
		});
		app.post("/get_detail", async function (req, res) {
			var list = await db.collection('nests').aggregate([
				{ $group: { _id: "$buyer", total: { $sum: 1 } } },
				{ $sort: { total: -1 } }
			]).toArray();
			res.json({ data: list });
		});

		app.post("/get_nft_count", async function(req, res) {
			var list = await db.collection('nfts').aggregate([
				{$group: {_id: "$typeOfNFT", total: {$sum: 1}}}
			]).toArray();
			res.json({data: list});
		})

		app.post("/get_daily_nest", async function(req, res) {
			var list = await db.collection('nests').aggregate([
				{
					$project: {
						createdAt: {
							$dateToString: {
								"format": "%Y-%m-%d",
								"date": {
									$toDate: {
										$multiply: [{
											$toInt: "$createTime"
										}, 1000]
									}
								}
							}
						}
					}
				},
				{
					$group: {"_id": "$createdAt", "count": {$sum: 1}}
				},
					{
						$sort: {"_id": 1}
					}
			]).toArray();
			res.json({data: list});
		});



		async function setPrevData() {
			var temp = [];
			prevData.forEach(element => {
				temp.push({ __typename: "PurchasedNode", createTime: element.createTime, buyer: element.buyer });
			});

			var count = await db.collection('nests').find({ createTime: temp[0].createTime, buyer: temp[0].buyer }).count();
			if (count > 0) {

			} else if (count == 0) {
				const insertResult = await db.collection('nests').insertMany(temp);
				console.log('Inserted documents =>', insertResult);
			}
		}
		setPrevData();
		setInterval(() => {
			getData(db.collection('nests'));
			getNftdata(db.collection('nfts'));
		}, 10000);


		app.listen(process.env.PORT || 4000, () => console.log('Listening on port 4000'));
	}
});




async function getData(collection) {

	var list = await collection.find().sort({ createTime: -1 }).limit(1).toArray();
	var lastCreateTime = '1000000000';
	if (list.length != 0) {
		lastCreateTime = list[0].createTime;
	}
	const query = {
		query: `{purchasedNodes(first: 1000 skip: 0 orderBy: createTime orderDirection: asc where: {createTime_gt: ${lastCreateTime}}) { buyer createTime __typename}}`,
		variables: {}
	};
	// console.log("query", query);
	axios.post(APIURL, query)
		.then(async function (response) {
			if (response.data.data.purchasedNodes && response.data.data.purchasedNodes.length > 0) {
				const insertResult = await collection.insertMany(response.data.data.purchasedNodes);
				console.log('Inserted documents =>', insertResult);
			}
		})
		.catch(function (error) {
			console.log(error);
		});
}

async function getNftdata(collection) {
	var list = await collection.find().sort({createTime: -1}).limit(1).toArray();
	var lastCreateTime = '10000';
	if (list.length != 0) {
		lastCreateTime = list[0].createTime;
	}
	const query = {
		query: 
		`{
			purchasedNFTs(first: 1000, skip: 0, orderBy: createTime, orderDirection: asc, where: {createTime_gt: ${lastCreateTime}}) {
			  addr
			  typeOfNFT
			  createTime
			}
		  }`,
		variables: {}
	};
	
	axios.post(NFTAPIURL, query)
	.then(async function (response) {
		if (response.data.data.purchasedNFTs && response.data.data.purchasedNFTs.length > 0) {
			const insertResult = await collection.insertMany(response.data.data.purchasedNFTs);
			console.log('Inserted documents =>', insertResult);
		}
	})
	.catch(function (error) {
		console.log(error);
	});
}
