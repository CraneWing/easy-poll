# EasyPoll

EasyPoll is the first of Free Code Camp's full-stack challenges, which is to build a voting app.These are the "user stories" this app must fulfill:

* As an authenticated user, I can keep my polls and come back later to access them.
* As an authenticated user, I can share my polls with my friends.
* As an authenticated user, I can see the aggregate results of my polls.
* As an authenticated user, I can delete polls that I decide I don't want anymore.
* As an authenticated user, I can create a poll with any number of possible items.
* As an unauthenticated or authenticated user, I can see and vote on everyone's polls.
* As an unauthenticated or authenticated user, I can see the results of polls in chart form.
* As an authenticated user, if I don't like the options on a poll, I can create a new option.

App is Node based, with Express framework with MongoDB for the database. Passport provides user verification and authentication. Poll result pie charts rendered with d3.js.