'use strict';

// @TODO: need js injection here instead of observer
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var leaveLobbyManually = false;
var observer = new MutationObserver(function(mutations, observer) {
	var status = null;
	if (document.querySelector('button[ng-click="leaveLobby()"]')) {
		status = 'inLobby';

		// @TODO: subscribe once
		var leaveLobbyBtn = document.querySelector('button[ng-click="leaveLobby()"]');
		leaveLobbyBtn.addEventListener('click', function(ev) {
			leaveLobbyManually = true;
		});
	}
	if (document.querySelector('button[ng-click="createLobby()"]')) {
		status = 'inList';
	}
	if (document.querySelector('button[ng-click="sendConnect()"]')) {
		status = 'connecting';
	}
	chrome.extension.sendMessage({ method: 'changeStatus', status: status, manually: leaveLobbyManually }, function(response) {
		leaveLobbyManually = false;
	});
});

observer.observe(document, {
	childList: true,
	subtree: true
});
