AUI().add(
	'event-onscreen',
	function(A) {
		A.Event.defineOnScreen = function(name) {
			var config = {
				detach: function(node, subscription, notifier) {
					subscription._loadEventHandle.detach();
					subscription._resizeEventHandle.detach();
					subscription._loadEventHandle.detach();
				},

				on: function(node, subscription, notifier) {
					var instance = this;

					if (name == "onscreentop") {
						subscription._nodeOffset = parseInt(node.attr('data-offset-top'));
					}
					else {
						subscription._nodeOffset = parseInt(node.attr('data-offset-bottom'));
					}

					subscription._loadEventHandle = A.on(
						['load', 'resize', 'scroll'],
						function(event) {
							instance._processOnScreenEvent(node, subscription, notifier, event);
						}
					);
				},

				_findNodePosition: function(node, subscription) {
					var nodePosition = {};

					nodePosition.top = node.getY();

					nodePosition.bottom = nodePosition.top + node.get('clientHeight');

					var offset = subscription._nodeOffset;

					if (offset && (name == 'onscreentop')) {
						nodePosition.top -= offset;
					}
					else if (offset) {
						nodePosition.top += offset;
					}

					return nodePosition;
				},

				_findWindowPosition: function() {
					var WIN = A.getWin();

					var winPosition = {};

					winPosition.top = WIN.get('docScrollY');

					var winHeight = WIN.get('innerHeight');

					if (winHeight == undefined) {
						winHeight = document.documentElement.clientHeight;
					}

					winPosition.bottom = winPosition.top + winHeight;

					return winPosition;
				},

				_processOnScreenEvent: function(node, subscription, notifier, event) {
					var instance = this;

					var winPosition = instance._findWindowPosition();

					var nodePosition = instance._findNodePosition(node, subscription);

					var fireEvent = false;

					if (name == 'offscreen') {
						fireEvent = (winPosition.bottom < nodePosition.top) || (winPosition.top > nodePosition.bottom);
					}
					else {
						var triggerPoint = winPosition.bottom;

						if (name == "onscreentop") {
							triggerPoint = winPosition.top;
						}

						fireEvent = (triggerPoint >= nodePosition.top) && (winPosition.top <= nodePosition.bottom);
					}

					if (fireEvent) {
						if (event) {
							event.currentTarget = node;
						}

						notifier.fire(node);
					}
				}
			};

			A.Event.define(name, config);
		};

		A.Event.defineOnScreen('onscreentop');
		A.Event.defineOnScreen('onscreenbottom');
		A.Event.defineOnScreen('offscreen');
	},
	'',
	{
		requires:['aui-base','event-synthetic']
	}
);