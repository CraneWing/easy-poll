var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var pollMiddleware = require('../middleware/poll.middleware');
var userMiddleware = require('../middleware/user.middleware');
var User = require('../models/user.js');
var Poll = require('../models/poll.js');
var Choice = require('../models/choice.js');

/* user dashboard */
router.get('/', userMiddleware.isLoggedIn, function(req, res, next) {
  Poll.find({'author.username': req.user.local.displayName || req.user.twitter.displayName},
      function(error, polls) {
        if (error) {
          res.send('An error occurred:' + error);
        }
        else {
          res.render('manage/dashboard', {
            title: 'Dashboard',
            polls: polls
          });
        }
      });
});

// single poll view
router.get('/poll/:id', userMiddleware.isLoggedIn, function(req, res, next) {
  var pollId = req.params.id;

  Poll.findById({ _id: pollId}, function(error, poll) {
    if (error) res.send(error);
    Choice.find({poll_id: pollId}, function(error, choices) {
      if (error) res.send(error);

      res.render('manage/poll_show', {
        title: 'Poll Detail',
        poll: poll,
        choices: choices
      });
    });
  });
});

// add new poll
router.get('/add', function(req, res, next) {
  res.render('manage/poll_add', {
    title: 'Add Poll'
  });
});

// edit poll view
router.get('/poll/:id/edit', pollMiddleware.checkPollOwnership, function(req, res, next) {
  var pollId = req.params.id;

  Poll.findById({ _id: pollId}, function(error, poll) {
    if (error) {
      res.send(error);
    } 
    else {
      Choice.find({poll_id: pollId}, function(error, choices) {
        if (error) res.send(error);

        res.render('manage/poll_edit', {
          title: 'Edit Poll',
          poll: poll,
          choices: choices
        });
      });
    }
  });  
});

// "are you sure" delete poll page
router.get('/poll/:id/delete', function(req, res, next) {
  Poll.findById({_id: req.params.id}, function(error, poll) {
    if (error) res.send(error);

    res.render('manage/poll_delete', {
      title: 'Delete Poll',
      poll: poll
    });
  });
});
// POST routes
router.post('/add', userMiddleware.isLoggedIn, function(req, res, next) {
  req.checkBody('poll_title', 'Title is required').notEmpty();
  req.checkBody('question', 'Question is required').notEmpty();
  req.checkBody('choices', 'Choices are required').notEmpty();
  
  var errors = req.validationErrors();

	if (errors) {
		res.render('manage/poll_add', {
			errors: errors,
			title: 'Add Poll'
		});
	}
	else {
		var poll_title = req.body.poll_title.trim();
    var question = req.body.question.trim();

    var poll = new Poll(); 
    var pollId = poll._id;
    poll.poll_title = poll_title;
    poll.question = question;
    poll.author = {
      id: req.user._id,
      username: req.user.local.displayName || req.user.twitter.displayName
    };

		Poll.create(poll, function(error, poll) {
			if (error) res.send(error);
		});	

    // get choices string and convert to array
    var formChoices = req.body.choices.trim().split(';');
    var choices = [];

    for (var i = 0; i < formChoices.length; i++) {
      choices.push({
        choice_name: formChoices[i],
        choice_count: 0,
        poll_id: pollId.toString()
      });
    }

    Choice.insertMany(choices, function(error, choices) {
      if (error) res.send(error);
    });
	  
    req.flash('success', 'Your poll was successfully added');
    res.redirect('/manage');
   	}
});

// update choice count on poll
router.post('/poll/:id/addvote', pollMiddleware.checkPollOwnership, function(req, res, next) {
  var choiceId = req.body.choice;
  var pollId = req.params.id;

  console.log('choice ID is ' + choiceId);
  console.log('poll ID is ' + pollId);
  
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
        res.redirect('/manage/poll/' + pollId);
      });
    }
  });
});

// update poll and related choices
router.post('/poll/:id/edit', pollMiddleware.checkPollOwnership, function(req, res, next) {
  var pollId = req.params.id;
  var fields = req.body;
  console.log(fields);
 
  var newChoices = [];

  // update poll data first
  Poll.findById({_id: pollId}, function(error, poll) {
    if (error) req.send(error);
    
    var update = {
      poll_title: fields.poll_title,
      question: fields.question
    };

    Poll.findByIdAndUpdate(pollId, update, {}, function(error, poll) {
      if (error) res.send(error);
    });
  });

  // update the choices
  Choice.find({poll_id: pollId}, function(error, choices) {
    if (error) res.send(error);

    // update existing fields 
    var ids = [];
    choices.forEach(function(choice, i) {
      choice.choice_name = fields['current-' + i];
      Choice.update({_id: choice._id}, {$set: {choice_name: fields['current-' + i]}}, function(error, choices) {
        if (error) res.send(error);
      });
    });

    // check if any new fields were added
    if (fields.new_fields > 0) {
      for (var i = 1; i <= fields.new_fields; i++) {
        newChoices.push({
          choice_name: fields['new-' + i],
          choice_count: 0,
          poll_id: pollId.toString()
        });
      }

      Choice.insertMany(newChoices, function(error, newChoices) {
        if (error) res.send(error);
        console.log(newChoices);
      });
    }

    req.flash('success', 'Your poll was updated successfully');
    res.redirect('/manage/poll/' + pollId);
  });
});

// delete a poll and its choices
router.post('/poll/:id/delete', pollMiddleware.checkPollOwnership, function(req, res, next) {
  var pollId = req.params.id;

  Poll.findByIdAndRemove({_id: pollId}, function(error, poll) {
    if (error) {
      res.send(error);
    }
    else { // poll deleted, now find and delete choices
      Choice.remove({poll_id: pollId}, function(error, choices) {
        if (error) {
          res.send(error);
        }
        else {
          req.flash('success', 'Your poll was deleted');
          res.redirect('/manage/dashboard');
        }
      });
    }
  });
});

module.exports = router;