var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var pollMiddleware = require('../middleware/poll.middleware');
var userMiddleware = require('../middleware/user.middleware');
var Poll = require('../models/poll.js');
var Choice = require('../models/choice.js');

/* GET home page. */
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

router.get('/new', userMiddleware.isLoggedIn, function(req, res, next) {
  var errors = false;

  res.render('polls/polls_new', {
    user: req.user,
    session: req.session,
    title: 'Add Poll',
    errors: errors
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

// edit poll view
router.get('/:id/edit', pollMiddleware.checkPollOwnership, function(req, res, next) {
  var pollId = req.params.id;

  Poll.findById({ _id: pollId}, function(error, poll) {
    if (error) {
      res.send(error);
    } 
    else {
      Choice.find({poll_id: pollId}, function(error, choices) {
        if (error) res.send(error);

        res.render('polls/polls_edit', {
          title: 'Edit Poll',
          poll: poll,
          choices: choices
        });
      });
    }
  });  
});

// "are you sure" delete poll page
router.get('/:id/delete', function(req, res, next) {
  Poll.findById({_id: req.params.id}, function(error, poll) {
    if (error) res.send(error);

    res.render('polls/polls_delete', {
      title: 'Delete Poll',
      poll: poll
    });
  });
});
// POST routes
router.post('/new', userMiddleware.isLoggedIn, function(req, res, next) {
  req.checkBody('poll_title', 'Title is required').notEmpty();
  req.checkBody('question', 'Question is required').notEmpty();
  req.checkBody('choices', 'Choices are required').notEmpty();
  
  var errors = req.validationErrors();

	if (errors) {
		res.render('polls/polls_new', {
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
    res.redirect('/polls');
   	}
});

// update choice count on a poll
router.post('/:id/addvote', function(req, res, next) {
  var choiceId = req.body.choice;
  var pollId = req.params.id;

  console.log('choice ID is ' + choiceId);
  console.log('poll ID is ' + pollId);
  
  var choiceVote = 0;
  
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

// update poll and related choices
router.post('/:id/edit', pollMiddleware.checkPollOwnership, function(req, res, next) {
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
    res.redirect('/polls/' + pollId);
  });
});

// delete a poll and its choices
router.post('/:id/delete', function(req, res, next) {
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
          res.redirect('/polls');
        }
      });
    }
  });
});

module.exports = router;