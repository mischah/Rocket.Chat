Meteor.methods({
	setReaction(reaction, messageId) {
		if (!Meteor.userId()) {
			throw new Meteor.Error(203, 'User_logged_out');
		}

		const user = Meteor.user();

		let message = RocketChat.models.Messages.findOne({ _id: messageId });
		let room = RocketChat.models.Rooms.findOne({ _id: message.rid });

		if (Array.isArray(room.muted) && room.muted.indexOf(user.username) !== -1) {
			return false;
		}

		if (message.reactions && message.reactions[reaction] && message.reactions[reaction].usernames.indexOf(user.username) !== -1) {
			message.reactions[reaction].usernames.splice(message.reactions[reaction].usernames.indexOf(user.username), 1);

			if (message.reactions[reaction].usernames.length === 0) {
				delete message.reactions[reaction];
			}

			if (_.isEmpty(message.reactions)) {
				delete message.reactions;
				RocketChat.models.Messages.unsetReactions(messageId);
			} else {
				RocketChat.models.Messages.setReactions(messageId, message.reactions);
			}
		} else {
			if (!message.reactions) {
				message.reactions = {};
			}
			if (!message.reactions[reaction]) {
				message.reactions[reaction] = {
					usernames: []
				};
			}
			message.reactions[reaction].usernames.push(user.username);

			RocketChat.models.Messages.setReactions(messageId, message.reactions);
		}

		return;
	}
});
