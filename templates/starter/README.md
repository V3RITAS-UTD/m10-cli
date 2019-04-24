# <%= projectName %>

This project is generated with [m10-cli](https://github.com/V3RITAS-UTD/m10-cli) centralized configuration development for Express APIs.

The boilerplate is thin and allows you to customize it from the start.

Includes:

 * m10 initialization and basic express setup (`app.js`)

 * dotenv

 * nodemon (for development)

 <%_ if (mongodb) { _%>
 * MongoDB (check `app.js` for configuration)
 <%_ } _%>



To add a new route you can run:

`m10-cli add --route`


Read more about [m10 configuration file](https://github.com/V3RITAS-UTD/m10#readme)


# Install

`npm install`


# Development

`npm run dev`

Will start the API on watch mode (automatically refresh on change thanks to nodemon).


# Production

`npm run prod`
