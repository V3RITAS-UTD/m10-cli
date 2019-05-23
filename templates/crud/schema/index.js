const { Joi } = require('m10') // import joi lib from m10

/*
	This is the validation file for <%= name %> routes,
	for each exported objects you can validate HTTP `query` / `params` / `body`
	via Joi definitions.
	~ Generated via m10-cli CRUD type `m10-cli add crud`
*/

const schema = <%= joiDefinition %>

// param id definition
const idDef = Joi.string().length(24, 'utf8').required()

// find all with limit and offset (optional)
module.exports.findAll = {
	query: {
		limit: Joi.number().integer(),
		offset: Joi.number().integer()
	}
}

// find one, id is required (as param /:id)
module.exports.findOne = {
	params: {
		id: idDef
	}
}

// insert one 
module.exports.insertOne = {
	body: schema
}

// update one by params id
module.exports.updateOne = {
	/*
	 for update you can also have a different schema
	 or add schema.forbiddenKeys(...)
	*/
	body: schema,
	params: {
		id: idDef
	}
}

// delete one, id is required (as param /:id)
module.exports.deleteOne = {
	params: {
		id: idDef
	}
}


