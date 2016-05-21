var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = require('../models/user');
var Poll = require('../models/poll');
var Choice = require('../models/choice');

router.get('/', function(req, res, next) {
  Poll.find({}, function(error, polls) {
    if (error) {
      res.send('An error occurred' + error);
    }
    else {
      res.render('polls/polls', {
        title: 'All Polls',
        polls: polls
      });
    }
  });
});

// single poll view
router.get('/:id', function(req, res, next) {
  var pollId = req.params.id;

  Poll.findById({ _id: pollId}, function(error, poll) {
    if (error) res.send(error);
    Choice.find({poll_id: pollId}, function(error, choices) {
      if (error) res.send(error);

      res.render('polls/poll', {
        title: 'Poll Detail',
        poll: poll,
        choices: choices
      });
    });
  });
});

// update choice count on a poll
router.post('/:id/addvote', function(req, res, next) {
  var choiceId = req.body.choice;
  var pollId = req.params.id;

  // get choice user selected with its ID
  Choice.findById({_id: choiceId}, function(error, choice) {
    choice.choice_count += 1;
    if (error) res.send(error);
    // increment choice vote count
    var updatedChoice = {
       choice_count: choice.choice_count
    };

    // update the choice document
    Choice.findByIdAndUpdate({_id: choiceId}, updatedChoice, {}, function(error, updatedChoice) {
      if (error) res.send(error);
    });
  });
  // look up poll associated with choice and update
  // its total votes.
  Poll.findById({_id: pollId}, function(error, poll) {
    if (error) {
      res.send(error);
    }
    else {
      poll.total_votes += 1;

      var updatedPoll = {
        total_votes: poll.total_votes
      };

      Poll.findByIdAndUpdate({_id: pollId}, updatedPoll, {}, function(error, updatedPoll) {
        if (error) res.send(error);
        
        req.flash('success', 'Thank you! Your vote has been added');
        res.redirect('/polls/' + pollId);
      });
    }
  });
});

module.exports = router;