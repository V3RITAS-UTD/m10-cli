const ObjectID = require('mongodb').ObjectID

/*
	This is the handler/controller file for <%= name %> routes,
	each route will be called only if the validations are successfull (if any are present).
	~ Generated via m10-cli CRUD type `m10-cli add crud`
*/

const collectionName = "<%= name %>"

// find all with limit and offset (optional)
module.exports.findAll = async (req, res) => {
	const limit = req.query.limit
	const offset = req.query.offset
	let <%= name %>List = []
	if (limit || offset) {
		// limit or offset present
		<%= name %>List = await req.db.collection(collectionName)
		.find()
	    .sort({ _created: -1 })
	    .skip(offset)
	    .limit(limit)
	    .toArray()
	} else {
		// get all
		<%= name %>List = await req.db.collection(collectionName)
		.find()
		.toArray()
	}
	res.json(<%= name %>List)
}

// find one via id
module.exports.findOne = async (req, res) => {
	const id = req.params.id
	const <%= name %> = await req.db.collection(collectionName)
		.findOne({_id: new ObjectID(id)})
	res.json(<%= name %>)
}

// insert one 
module.exports.insertOne = async (req, res) => {
	const body = req.body
	let newObj = Object.assign({_created: new Date()}, body)
	const <%= name %>New = await req.db.collection(collectionName).insertOne(newObj)
	const <%= name %>Id = <%= name %>New._id
	res.json({id: <%= name %>Id})
}

// update one by id
module.exports.updateOne = async (req, res) => {
	const body = req.body
	const id = new ObjectID(req.params.id)
	const query = {
		_id: id
	}
	const <%= name %>Updated = await req.db.collection(collectionName)
	.updateOne(query, {$set: body})

	if (<%= name %>Updated.matchedCount !== 1) {
		return res.status(400).json({success: false, error: 'Failed to update'})
	}
	res.json({success: true})
}

// delete one via id
module.exports.deleteOne = async (req, res) => {
	const id = new ObjectID(req.params.id)
	const <%= name %>Deleted = await req.db.collection(collectionName)
	.deleteOne({_id: id})

	if (<%= name %>Deleted.deletedCount !== 1) {
		return res.status(400).json({success: false, error: 'Failed to delete'})
	}

	res.json({success: true})
}
