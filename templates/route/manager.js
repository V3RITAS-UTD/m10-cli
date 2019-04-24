<%_ if (generateValidation) { _%>
const { Joi } = require('m10')
<%_ } _%>

module.exports = {
  <%_ if (generateValidation) { _%>
  validate: <%= joiDefinition %>,
  <%_ } _%>
  handler: function (req, res) {
    // req.body // body request (e.g. on POST)
    // req.query // for query strings e.g. ?limit=20
    // req.params // if you have :paramName in your route

    // response
    res.status(200).json({success: true})
  }
}

