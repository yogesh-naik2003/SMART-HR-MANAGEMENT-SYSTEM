const swaggerJsdoc =
require("swagger-jsdoc");

const options = {

 definition: {

  openapi: "3.0.0",

  info: {
   title: "AI HRMS API",
   version: "1.0.0",
   description:
   "Production HRMS Backend API"
  },

  components: {
   securitySchemes: {
    bearerAuth: {
     type: "http",
     scheme: "bearer",
     bearerFormat: "JWT"
    }
   }
  },

  servers: [
   {
    url:
    "http://localhost:5000"
   }
  ]

 },

 apis: [
  "./src/routes/*.js"
 ]

};

const swaggerSpec =
swaggerJsdoc(options);

module.exports =
swaggerSpec;
