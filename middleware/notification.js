function notificationMiddleware(req, res, next) {
  // Transfer notification from session to locals
  res.locals.notification = req.session.notification;
  // Clear the notification from session after transferring
  delete req.session.notification;
  next();
}
