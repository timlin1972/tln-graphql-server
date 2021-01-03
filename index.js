const { ApolloServer, gql } = require('apollo-server-express');

const MODULE_NAME = 'graphql-server';

const STR_EXPRESS_REQUIRED = 'Express web server must be provided.';
const STR_SERVER = 'graphql server is listening at';
const STR_SUB_HTTP_SERVER = 'Subscriptions http server is listening at';
const STR_SUB_HTTPS_SERVER = 'Subscriptions https server is listening at';

const DEF_LOGGER = null;
const DEF_APP = null;
const DEF_HTTP_SERVER = null;
const DEF_HTTPS_SERVER = null;
const DEF_GRAPHQL_MGR = null;
const DEF_I18N = null;

const DEF_CONFIGS = {
  logger: DEF_LOGGER,
  app: DEF_APP,
  httpServer: DEF_HTTP_SERVER,
  httpsServer: DEF_HTTPS_SERVER,
  graphqlMgr: DEF_GRAPHQL_MGR,
  i18n: DEF_I18N,
}

class GraphqlServer {
  constructor(configs=DEF_CONFIGS) {
    this.logger = configs.logger || DEF_LOGGER;
    this.app = configs.app || DEF_APP;
    this.httpServer = configs.httpServer || DEF_HTTP_SERVER;
    this.httpsServer = configs.httpsServer || DEF_HTTPS_SERVER;
    this.graphqlMgr = configs.graphqlMgr || DEF_GRAPHQL_MGR;
    this.i18n = configs.i18n || DEF_I18N;

    this.log('info', 'Initialized');
  }

  setHttpServer(httpServer) {
    this.httpServer = httpServer;
  }

  setHttpsServer(httpsServer) {
    this.httpsServer = httpsServer;
  }

  start() {
    return new Promise((resolve, reject) => {
        const { app, graphqlMgr, httpServer, httpsServer } = this;
        if (!app) {
            this.log('error', STR_EXPRESS_REQUIRED);
            return reject(new Error(STR_EXPRESS_REQUIRED))
        }

        if (!graphqlMgr) {
          this.log('error', 'Graphql mgr must be provided.');
          return reject(new Error('Graphql mgr must be provided.'))
        }

        if (!httpServer) {
          this.log('error', 'Http server must be provided.');
          return reject(new Error('Http server must be provided.'))
        }

        if (!httpsServer) {
          this.log('error', 'Https server must be provided.');
          return reject(new Error('Https server must be provided.'))
        }

        this.graphqlServer = new ApolloServer(graphqlMgr.getSchema());

        this.graphqlServer.applyMiddleware({ app });
        
        const msgListeningI18n = this.i18n ? this.i18n.t(STR_SERVER) : STR_SERVER;
        this.log('info', `${msgListeningI18n} ${this.graphqlServer.graphqlPath}`);

        this.graphqlServer.installSubscriptionHandlers(this.httpServer);
        const msgSubHttpI18n = this.i18n ? this.i18n.t(STR_SUB_HTTP_SERVER) : STR_SUB_HTTP_SERVER;
        this.log('info', `${msgSubHttpI18n} ${this.graphqlServer.subscriptionsPath}`);

        this.graphqlServer.installSubscriptionHandlers(this.httpsServer);
        const msgSubHttpsI18n = this.i18n ? this.i18n.t(STR_SUB_HTTPS_SERVER) : STR_SUB_HTTPS_SERVER;
        this.log('info', `${msgSubHttpsI18n} ${this.graphqlServer.subscriptionsPath}`);

        resolve(null);
    })
  }

  log = (level=DEF_LEVEL, msg) => {
    const msgI18n = this.i18n ? this.i18n.t(msg) : msg;
    this.logger ? 
      this.logger.log(MODULE_NAME, level, msgI18n) :
      console.log(`${level}: [${MODULE_NAME}] ${msgI18n}`);
  }

  toString = () => `[${MODULE_NAME}]\n\
    \tlogger: ${this.logger ? 'yes' : 'no'}\n\
    \tapp: ${this.app ? 'yes' : 'no'}\n\
    \thttpServer: ${this.httpServer ? 'yes' : 'no'}\n\
    \thttpsServer: ${this.httpsServer ? 'yes' : 'no'}\n\
    \tgraphqlMgr: ${this.graphqlMgr ? 'yes' : 'no'}\n\
    \ti18n: ${this.i18n ? 'yes' : 'no'}\n\
    `;
}

module.exports = GraphqlServer;
