const { ApolloServer, gql } = require('apollo-server-express');

const MODULE_NAME = 'graphql-server';

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;
 
// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const DEF_LOGGER = null;
const DEF_APP = null;
const DEF_PORT = 3010;

const DEF_CONFIGS = {
    logger: DEF_LOGGER,
    app: DEF_APP,
    port: DEF_PORT,
}

class GraphqlServer {
  constructor(configs=DEF_CONFIGS) {
    this.logger = configs.logger || DEF_LOGGER;
    this.app = configs.app || DEF_APP;
    this.port = configs.port || DEF_PORT;

    this.graphqlServer = new ApolloServer({ typeDefs, resolvers });
  }

  start() {
    return new Promise((resolve, reject) => {
        const { app, port } = this;
        if (!app) {
            this.log('error', `Express web server must be provided.`);
            reject(new Error('Express web server must be provided.'))
            return;
        }

        this.graphqlServer.applyMiddleware({ app });
        
        app.listen({ port }, () => {
          this.log('info', 
              `graphql server is listening at port ${this.port}${this.graphqlServer.graphqlPath}`);
          resolve(null);
        });
    });
  }

  log = (level=DEF_LEVEL, msg) => {
    if (this.logger !== null) {
      this.logger.log(MODULE_NAME, level, msg)
    }
    else {
      console.log(`${level}: [${MODULE_NAME}] ${msg}`);
    }
  }

  toString = () => {
    return `[${MODULE_NAME}]\n \
      \tlogger: ${this.logger ? 'yes' : 'no'}\n \
      \tport: ${this.port}\n \
      `;
  }
}

module.exports = GraphqlServer;
