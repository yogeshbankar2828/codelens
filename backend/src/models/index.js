const User = require('./User');
const PullRequest = require('./PullRequest');
const Review = require('./Review');
const CodeEmbedding = require('./CodeEmbedding');

// Associations
PullRequest.hasOne(Review, { foreignKey: 'pullRequestId', as: 'review' });
Review.belongsTo(PullRequest, { foreignKey: 'pullRequestId', as: 'pullRequest' });

module.exports = { User, PullRequest, Review, CodeEmbedding };
