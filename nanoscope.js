
Posts = new Mongo.Collection('posts');

var blackList = [
  'https://angular.io/',
  'https://symfony.com/',
];

var isValidUrl = function(url) {
  var urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
  return urlRegex.test(url);
};

var isBlackListed = function(url) {
  return _.any(blackList, function(blackListedUrl) {
    return (new RegExp('^' + blackListedUrl).test(url));
  });
};

Meteor.methods({
  post: function(title, url) {
    check(title, String);
    check(url, Match.Where(function (url) {
      check(url, String);
      return isValidUrl(url) && ! isBlackListed(url);
    }));
    var currentUser = Meteor.user();
    if (!currentUser) return false;
    var post = {
        userId: currentUser && currentUser._id,
        author: currentUser && currentUser.emails[0].address,
        title: title,
        Url: url
      };

    Posts.insert(post);
  },
  upvote: function(postId) {
    check(postId, String);
    var user = Meteor.user();
    if (!user) return false;

    Posts.update({
      _id: postId,
      upvoters: {$ne: user._id}
    }, {
      $addToSet: {upvoters: user._id},
      $inc: {votes: 1}
    });
  }
});

if (Meteor.isClient) {
  Template.postItem.helpers({
    upvotedClass: function() {
      var userId = Meteor.userId();
      if (!_.include(this.upvoters, userId)) {
        return 'btn-primary upvotable';
      } else {
        return 'disabled';
      }
    },
  });

  Template.posts.helpers({
    posts: function () {
      return Posts.find();
    }
  });

  Template.postSubmit.events({
    'submit form': function(e) {
      e.preventDefault();

      var post = {
        url: $(e.target).find('[name=url]').val(),
        title: $(e.target).find('[name=title]').val(),
      };

      Meteor.call('post', post.title, post.url);
    }
  });

  Template.postItem.events({
    'click .upvotable': function(e) {
      e.preventDefault();
      Meteor.call('upvote', this._id);
    }
  });
}
