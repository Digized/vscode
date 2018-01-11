/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { MenuId, IMenuActionOptions } from 'vs/platform/actions/common/actions';
import { Menu } from 'vs/platform/actions/browser/menu';
import { IExtensionService } from 'vs/platform/extensions/common/extensions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IDisposable } from 'vs/base/common/lifecycle';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import Event from 'vs/base/common/event';
import { MenuItemAction } from 'vs/platform/actions/browser/menuItemAction';

export interface IMenu extends IDisposable {
	onDidChange: Event<IMenu>;
	getActions(options?: IMenuActionOptions): [string, MenuItemAction[]][];
}

export const IMenuService = createDecorator<IMenuService>('menuService');

export interface IMenuService {

	_serviceBrand: any;

	createMenu(id: MenuId, scopedKeybindingService: IContextKeyService): IMenu;
}

export class MenuService implements IMenuService {

	_serviceBrand: any;

	constructor(
		@IExtensionService private _extensionService: IExtensionService,
		@ICommandService private _commandService: ICommandService
	) {
		//
	}

	createMenu(id: MenuId, contextKeyService: IContextKeyService): IMenu {
		return new Menu(id, this._extensionService.whenInstalledExtensionsRegistered(), this._commandService, contextKeyService);
	}
}
