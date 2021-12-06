/**
* Contains all the routes to be used in the app
* Each file of routes created in /routes must be delared here
* 23/06/20
* Author: Sahid Reyes.
*/

module.exports = (app, passport) => {
  app.use('/api/users' , require('./routes/user.routes'));
  app.use('/login' , require('./routes/login.routes'));
  app.use('/admin' , require('./routes/admin.routes'));
  app.use('/client' , require('./routes/client.routes'));
  app.use('/partner' , require('./routes/partner.routes'));
  app.use('/wallet' , require('./routes/wallet.routes'));
  app.use('/opportunity' , require('./routes/opportunity.routes'));
  app.use('/db' , require('./routes/db.routes'));
  app.use('/' , require('./routes/nav_routes'));
}
