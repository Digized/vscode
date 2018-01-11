/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IdGenerator } from 'vs/base/common/idGenerator';
import { createCSSRule } from 'vs/base/browser/dom';
import URI from 'vs/base/common/uri';
import { ExecuteCommandAction, IMenuActionOptions, ICommandAction } from 'vs/platform/actions/common/actions';

const ids = new IdGenerator('menu-item-action-icon-');

export class MenuItemAction extends ExecuteCommandAction {

	static readonly ICON_PATH_TO_CSS_RULES: Map<string /* path*/, string /* CSS rule */> = new Map<string, string>();

	private _options: IMenuActionOptions;

	readonly item: ICommandAction;
	readonly alt: MenuItemAction;

	constructor(
		item: ICommandAction,
		alt: ICommandAction,
		options: IMenuActionOptions,
		@IContextKeyService contextKeyService: IContextKeyService,
		@ICommandService commandService: ICommandService
	) {
		typeof item.title === 'string' ? super(item.id, item.title, commandService) : super(item.id, item.title.value, commandService);
		this._enabled = !item.precondition || contextKeyService.contextMatchesRules(item.precondition);
		this._options = options || {};

		if (item.iconPath) {
			let iconClass: string;
			if (typeof item.iconPath === 'string') {
				if (MenuItemAction.ICON_PATH_TO_CSS_RULES.has(item.iconPath)) {
					iconClass = MenuItemAction.ICON_PATH_TO_CSS_RULES.get(item.iconPath);
				} else {
					const iconClass = ids.nextId();
					createCSSRule(`.icon.${iconClass}`, `background-image: url("${URI.file(item.iconPath).toString()}")`);
					MenuItemAction.ICON_PATH_TO_CSS_RULES.set(item.iconPath, iconClass);
				}
			} else {
				if (MenuItemAction.ICON_PATH_TO_CSS_RULES.has(item.iconPath.dark)) {
					iconClass = MenuItemAction.ICON_PATH_TO_CSS_RULES.get(item.iconPath.dark);
				} else {
					const iconClass = ids.nextId();
					createCSSRule(`.icon.${iconClass}`, `background-image: url("${URI.file(item.iconPath.light).toString()}")`);
					createCSSRule(`.vs-dark .icon.${iconClass}, .hc-black .icon.${iconClass}`, `background-image: url("${URI.file(item.iconPath.dark).toString()}")`);
					MenuItemAction.ICON_PATH_TO_CSS_RULES.set(item.iconPath.dark, iconClass);
				}
			}

			this._cssClass = iconClass;
		}

		this.item = item;
		this.alt = alt ? new MenuItemAction(alt, undefined, this._options, contextKeyService, commandService) : undefined;
	}

	run(...args: any[]): TPromise<any> {
		let runArgs: any[] = [];

		if (this._options.arg) {
			runArgs = [...runArgs, this._options.arg];
		}

		if (this._options.shouldForwardArgs) {
			runArgs = [...runArgs, ...args];
		}

		return super.run(...runArgs);
	}
}