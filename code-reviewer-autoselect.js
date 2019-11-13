var entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onChange({
  title: 'Auto Select Code Reviewer',
  guard: function(ctx) {
    var stageNowCodeReview = ctx.issue.fields.becomes(ctx.Stage, ctx.Stage.CodeReview)
    var stageNowQA = ctx.issue.fields.becomes(ctx.Stage, ctx.Stage.QA)
    return stageNowCodeReview || stageNowQA
  },
  action: function(ctx) {

    var assignees = []
    ctx.issue.fields.Assignees.forEach(function(assignee){
      assignees.push(assignee.login)
    })
    
    var previousReviewers = []
    ctx.issue.fields.Reviewer.forEach(function(reviewer){
      previousReviewers.push(reviewer.login)
    })
    ctx.issue.fields.Reviewer.clear()
       
    var reviewerPool = []       
    ctx.PlatformTeam.users.forEach(function(member){
      if(assignees.indexOf(member.login) === -1 && previousReviewers.indexOf(member.login) === -1){
        reviewerPool.push(member)
      }
    })
    var randomIndex = Math.floor(reviewerPool.length * Math.random())
    var newReviewer = reviewerPool[randomIndex] 
    ctx.issue.addComment('@' + newReviewer.login + ' has been randomly selected for ' + ctx.issue.fields.Stage.name)
    ctx.issue.fields.Reviewer.add(reviewerPool[randomIndex])

  },
  requirements: {
  	PlatformTeam: {
    	type: entities.UserGroup,
    	name: 'Platform Team'
  	},
	Stage: {
    	type: entities.EnumField.fieldType,
    	name: 'Stage',
        CodeReview: {},
      	Doing: {},
      	QA: {}
  	}
  }
});