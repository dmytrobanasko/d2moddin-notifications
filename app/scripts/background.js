// asynchronous self-invoking function to not pollute global namespace
(function(window, document, undefined) {
	// 'use strict';

	// request/check if browser notifications is enabled for extension
	$.notification.requestPermission(function () {
		console.info('Notification permission: ' + $.notification.permissionLevel());
	});

	/*
	 * Returns inLobby flag
	 *
	 * @public
	 */
	this.getInLobby = function() {
		return inLobby;
	};

	/*
	 * Returns settings from localStorage
	 *
	 * @public
	 */
	this.getSettings = function(key) {
		var settings = JSON.parse(localStorage.getItem('settings') || '{}');

		return key ? settings[key] : settings;
	};

	/*
	 * Set settings to localStorage
	 * @params {Object} settings
	 * @public
	 */
	this.setSettings = function(settings) {
		// @TODO: fix it
		if (typeof settings !== 'string') {
			settings = JSON.stringify(settings || {});
		}

		localStorage.setItem('settings', settings);
	};

	// @TODO: settings part...
	var notificationTimeout = 5; // in seconds
	var d2url = 'http://d2modd.in';
	var inLobby = false;
	var readyState = false;
	var sounds = {
		'badNews': 'sounds/bad-news.mp3',
		'ready': 'sounds/ready.mp3',
		'foolsDie': 'sounds/fools-die.mp3'
	};

	/*
	 * Show pageAction only for d2moddin
	 *
	 * @private
	 */
	var checkForValidUrl = function(tabId, changeInfo, tab) {
		if (tab.url.indexOf(d2url) == 0) {
			chrome.pageAction.show(tabId);
		}
	};

	/*
	 * Generate message content from status
	 * @param {Object} Contains message data (title, desc, eventKey)
	 * @param {Object} options
	 * @private
	 */
	var notify = function(data, options) {
		data || (data = {});
		options || (options = {});

		var notificationIsEnabled = this.getSettings('notification'),
			soundIsEnabled = this.getSettings('sound');

		if (notificationIsEnabled) {
			var options = {
				iconUrl: 'images/icon-38.png',
				title: data.title,
				body: data.content,
				onclick: function () {
					chrome.tabs.query({url: d2url + '/*'}, function(foundedTabs) {
						foundedTabs && chrome.tabs.update(foundedTabs[0].id, {selected: true});
					});

				}
			};
			// I need this until http://www.w3.org/TR/notifications/ and/or https://developer.chrome.com/extensions/notifications start working ...
			$.notification(options)
				.then(function (notification) {
					setTimeout(function () {
					notification.close();
					}, notificationTimeout * 1000);
				}, function () {
					console.error('Notification rejected!');
				});
		}

		if (soundIsEnabled && sounds[data.eventKey]) {
			var audio = new Audio(sounds[data.eventKey]);
			audio.play();
		}
	};

	/*
	 * Generate message content from status
	 * @param {Object} Contains status
	 * @param {Sender}
	 * @params {sendResponse}
	 * @private
	 */
	var messageHandler = function(msg, sender, sendResponse) {
		if (msg.method && msg.method === 'changeStatus') {
			var doshow = true,
				data = {
					eventKey: null,
					title: '',
					content: ''
				};

			switch(msg.status) {
				case 'inLobby':
					if (inLobby) {
						doshow = false;
					}
					data.eventKey = 'foolsDie';
					data.title = chrome.i18n.getMessage('okInLobby');
					data.content = chrome.i18n.getMessage('okInLobbyMore');

					inLobby = true;
				break;

				case 'inList':
					if (!inLobby || msg.manually) {
						doshow = false;
					}
					data.eventKey = 'badNews';
					data.title = chrome.i18n.getMessage('badNewsInList');
					data.content = chrome.i18n.getMessage('badNewsInListMore');

					inLobby = false;
					readyState = false;
				break;

				case 'connecting':
					if (readyState) {
						doshow = false;
					}
					data.eventKey = 'ready';
					data.title = chrome.i18n.getMessage('getReady');
					data.content = chrome.i18n.getMessage('getReadyMore');

					readyState = true;
				break;
				default:
					doshow = false;
					data.title = chrome.i18n.getMessage('Ooops');
					data.content = chrome.i18n.getMessage('OoopsMore');
				break;
			}

			doshow && notify(data);
		}
	}

	// Listen for any messages from d2moddin
	chrome.runtime.onMessage.addListener(messageHandler);

	// Listen for any changes to the URL of any tab.
	chrome.tabs.onUpdated.addListener(checkForValidUrl);

})(this, this.document);
