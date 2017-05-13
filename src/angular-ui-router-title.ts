"use strict";

let documentTitleCallback: (title: string | ng.IRootScopeService) => string = undefined;
let defaultDocumentTitle = document.title;

angular.module("ui.router.title", ["ui.router"])
	.provider("$title", function $titleProvider() {
		return {
			documentTitle: (cb: ($rootScope: ng.IRootScopeService) => string) => {
				cb.$inject = ["$rootScope"];
				documentTitleCallback = cb;
			},
			$get: ["$state", ($state: ng.ui.IStateService) => {
				return {
					title: () => getTitleValue($state.$current.locals.globals["$title"]),
					breadCrumbs: () => {
						let $breadcrumbs = [];
						var state = $state.$current;
						while (state) {
							if (state["resolve"] && state["resolve"].$title) {
								$breadcrumbs.unshift({
									title: getTitleValue(state.locals.globals["$title"]) as string,
									state: state["self"].name,
									stateParams: state.locals.globals["$stateParams"]
								});
							}
							state = state["parent"];
						}
						return $breadcrumbs;
					}
				};
			}]
		};
	})
	.run(["$rootScope", "$timeout", "$title", "$injector", function (
		$rootScope: ng.IRootScopeService,
		$timeout: ng.ITimeoutService,
		$title,
		$injector
	) {

		$rootScope.$on("$stateChangeSuccess", function () {
			var title = $title.title();
			$timeout(function () {
				$rootScope.$title = title;
				const documentTitle = documentTitleCallback ? $injector.invoke(documentTitleCallback) : title || defaultDocumentTitle;
				document.title = documentTitle;
			});

			$rootScope.$breadcrumbs = $title.breadCrumbs();
		});

	}]);

function getTitleValue(title) {
	return angular.isFunction(title) ? title() : title;
}