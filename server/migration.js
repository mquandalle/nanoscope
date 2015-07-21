Migrations.add({
  version: 1,
  up: function () {
    Posts.update({ Url: { $exists: true }}, { $rename: { "Url": "url" } }, { multi: true });
  },
  down: function () {
    Posts.update({ url: { $exists: true }}, { $rename: { "url": "Url" } }, { multi: true });
  }
});

Meteor.startup(function () {
  Migrations.migrateTo('latest');
})
