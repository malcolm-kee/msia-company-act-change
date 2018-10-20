const mongoose = require('mongoose');

const dbUrl = process.env.DB_URL || 'mongodb://localhost/ssm-data';

const connect = () => {
  if (mongoose.connection.readyState === 0) {
    const connectPromise = mongoose.connect(
      dbUrl,
      {
        promiseLibrary: global.Promise,
        useNewUrlParser: true
      }
    );

    mongoose.connection.on('connected', () => console.info(`Mongoose connected to ${dbUrl}`));

    mongoose.connection.on('error', err => console.info(`Mongoose connection error: ${err}`));

    mongoose.connection.on('disconnected', () => console.info(`Mongoose disconnected`));

    const graceFulShutDown = msg =>
      mongoose.connection.close().then(() => console.info(`Mongoose disconnected through ${msg}`));

    // SIGUSR2 is emitted by nodemon, see https://github.com/remy/nodemon#controlling-shutdown-of-your-script
    process.once('SIGUSR2', () =>
      graceFulShutDown('nodemon restart').then(() => process.kill(process.pid, 'SIGUSR2'))
    );

    // SIGINT is emitted when you terminate the app via Ctrl + C, see https://nodejs.org/api/process.html
    process.once('SIGINT', () => graceFulShutDown('app termination').then(() => process.exit(0)));

    // SIGTERM is emitted by heroku, see https://devcenter.heroku.com/articles/dynos
    process.on('SIGTERM', () =>
      graceFulShutDown('Heroku app shutdown').then(() => process.exit(0))
    );

    return connectPromise;
  }
};

module.exports = {
  connect
};
