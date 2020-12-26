const { ApolloServer, gql } = require('apollo-server-express');

const MODULE_NAME = 'graphql-server';

const DEF_LOGGER = null;
const DEF_APP = null;
const DEF_PORT = 3010;
const DEF_GRAPHQL_MGR = null;
const DEF_I18N = null;

const DEF_CONFIGS = {
  logger: DEF_LOGGER,
  app: DEF_APP,
  port: DEF_PORT,
  graphqlMgr: DEF_GRAPHQL_MGR,
  i18n: DEF_I18N,
}

class GraphqlServer {
  constructor(configs=DEF_CONFIGS) {
    this.logger = configs.logger || DEF_LOGGER;
    this.app = configs.app || DEF_APP;
    this.port = configs.port || DEF_PORT;
    this.graphqlMgr = configs.graphqlMgr || DEF_GRAPHQL_MGR;
    this.i18n = configs.i18n || DEF_I18N;

    this.log('info', 'Initialized');
  }

  start() {
    return new Promise((resolve, reject) => {
        const { app, graphqlMgr, port } = this;
        if (!app) {
            this.log('error', `Express web server must be provided.`);
            reject(new Error('Express web server must be provided.'))
            return;
        }

        if (!graphqlMgr) {
          this.log('error', `Graphql mgr must be provided.`);
          reject(new Error('Graphql mgr must be provided.'))
          return;
        }

        this.graphqlServer = new ApolloServer(graphqlMgr.getSchema());

        this.graphqlServer.applyMiddleware({ app });
        
        app.listen({ port }, () => {
          const msgListeningI18n = this.i18n 
            ? this.i18n.t('graphql server is listening at port') 
            : 'graphql server is listening at port';

          this.log('info', `${msgListeningI18n} ${this.port}${this.graphqlServer.graphqlPath}`);
          resolve(null);
        });
    });
  }

  log = (level=DEF_LEVEL, msg) => {
    const msgI18n = this.i18n ? this.i18n.t(msg) : msg;
    this.logger ? 
      this.logger.log(MODULE_NAME, level, msgI18n) :
      console.log(`${level}: [${MODULE_NAME}] ${msgI18n}`);
  }

  toString = () => `[${MODULE_NAME}]\n\
    \tlogger: ${this.logger ? 'yes' : 'no'}\n\
    \tport: ${this.port}\n\
    `;
}

module.exports = GraphqlServer;
