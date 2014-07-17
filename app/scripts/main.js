'use strict';

var PopupController = function () {
	this.actions_ = document.querySelectorAll('a.action');
	this._updateActions();
	this._addListeners();
};

PopupController.prototype = {
	/**
	* A cached reference to the button elements.
	*
	* @type {Elements}
	* @private
	*/
	actions_: null,

	/**
	* Adds event listeners to the button in order to capture a user's click, and
	* perform some action in response.
	*
	* @private
	*/
	_addListeners: function () {
		for (var i = 0; i < this.actions_.length; i++) {
			this.actions_[i].addEventListener('click', this.handleActionClick_.bind(this));
		}
	},

	/**
	* Update actions according to settings
	*
	* @private
	*/
	_updateActions: function() {
		var param,
			settings = chrome.extension.getBackgroundPage().getSettings();

		for (var i = 0; i < this.actions_.length; i++) {
			param = this.actions_[i].getAttribute('data-action');
			settings[param] && this.actions_[i].classList.add('active');
		}
	},

	/**
	* Toggle settings param on/off and update actions
	*
	* @param {string} can be notification or sound
	* @private
	*/
	_toggleNotify: function(param) {
		var settings = chrome.extension.getBackgroundPage().getSettings();

		settings[param] = !settings[param];
		chrome.extension.getBackgroundPage().setSettings(settings);
		this._updateActions();
	},

	/**
	* When a user clicks the button, this method is called: it change settings param by calling _toggleNotify
	*
	* @type {Event}
	* @private
	*/
	handleActionClick_: function (ev) {
		ev.preventDefault();

		this._toggleNotify(ev.currentTarget.getAttribute('data-action'));
		window.close();
	}
};

document.addEventListener('DOMContentLoaded', function () {
	window.PC = new PopupController();
});
