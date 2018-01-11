/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Action, IAction } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { SyncDescriptor0, createSyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IConstructorSignature2 } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindings } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IDisposable } from 'vs/base/common/lifecycle';

export interface ILocalizedString {
	value: string;
	original: string;
}

export interface ICommandAction {
	id: string;
	title: string | ILocalizedString;
	category?: string | ILocalizedString;
	iconPath?: string | { light: string; dark: string; };
	precondition?: ContextKeyExpr;
}

export interface IMenuItem {
	command: ICommandAction;
	alt?: ICommandAction;
	when?: ContextKeyExpr;
	group?: 'navigation' | string;
	order?: number;
}

export class MenuId {

	private static ID = 1;

	static readonly EditorTitle = new MenuId();
	static readonly EditorTitleContext = new MenuId();
	static readonly EditorContext = new MenuId();
	static readonly ExplorerContext = new MenuId();
	static readonly OpenEditorsContext = new MenuId();
	static readonly ProblemsPanelContext = new MenuId();
	static readonly DebugVariablesContext = new MenuId();
	static readonly DebugWatchContext = new MenuId();
	static readonly DebugCallStackContext = new MenuId();
	static readonly DebugBreakpointsContext = new MenuId();
	static readonly DebugConsoleContext = new MenuId();
	static readonly SCMTitle = new MenuId();
	static readonly SCMSourceControl = new MenuId();
	static readonly SCMResourceGroupContext = new MenuId();
	static readonly SCMResourceContext = new MenuId();
	static readonly SCMChangeContext = new MenuId();
	static readonly CommandPalette = new MenuId();
	static readonly ViewTitle = new MenuId();
	static readonly ViewItemContext = new MenuId();
	static readonly TouchBarContext = new MenuId();

	readonly id: string = String(MenuId.ID++);
}

export interface IMenuActionOptions {
	arg?: any;
	shouldForwardArgs?: boolean;
}

export interface IMenuRegistry {
	addCommand(userCommand: ICommandAction): boolean;
	getCommand(id: string): ICommandAction;
	appendMenuItem(menu: MenuId, item: IMenuItem): IDisposable;
	getMenuItems(loc: MenuId): IMenuItem[];
}

export const MenuRegistry: IMenuRegistry = new class implements IMenuRegistry {

	private _commands: { [id: string]: ICommandAction } = Object.create(null);

	private _menuItems: { [loc: string]: IMenuItem[] } = Object.create(null);

	addCommand(command: ICommandAction): boolean {
		const old = this._commands[command.id];
		this._commands[command.id] = command;
		return old !== void 0;
	}

	getCommand(id: string): ICommandAction {
		return this._commands[id];
	}

	appendMenuItem({ id }: MenuId, item: IMenuItem): IDisposable {
		let array = this._menuItems[id];
		if (!array) {
			this._menuItems[id] = array = [item];
		} else {
			array.push(item);
		}
		return {
			dispose() {
				const idx = array.indexOf(item);
				if (idx >= 0) {
					array.splice(idx, 1);
				}
			}
		};
	}

	getMenuItems({ id }: MenuId): IMenuItem[] {
		const result = this._menuItems[id] || [];

		if (id === MenuId.CommandPalette.id) {
			// CommandPalette is special because it shows
			// all commands by default
			this._appendImplicitItems(result);
		}
		return result;
	}

	private _appendImplicitItems(result: IMenuItem[]) {
		const set = new Set<string>();
		for (const { command, alt } of result) {
			set.add(command.id);
			if (alt) {
				set.add(alt.id);
			}
		}
		for (let id in this._commands) {
			if (!set.has(id)) {
				result.push({ command: this._commands[id] });
			}
		}
	}
};

export class ExecuteCommandAction extends Action {

	constructor(
		id: string,
		label: string,
		@ICommandService private _commandService: ICommandService) {

		super(id, label);
	}

	run(...args: any[]): TPromise<any> {
		return this._commandService.executeCommand(this.id, ...args);
	}
}

export interface IMenuItemAction extends IAction {

}

export class SyncActionDescriptor {

	private _descriptor: SyncDescriptor0<Action>;

	private _id: string;
	private _label: string;
	private _keybindings: IKeybindings;
	private _keybindingContext: ContextKeyExpr;
	private _keybindingWeight: number;

	constructor(ctor: IConstructorSignature2<string, string, Action>,
		id: string, label: string, keybindings?: IKeybindings, keybindingContext?: ContextKeyExpr, keybindingWeight?: number
	) {
		this._id = id;
		this._label = label;
		this._keybindings = keybindings;
		this._keybindingContext = keybindingContext;
		this._keybindingWeight = keybindingWeight;
		this._descriptor = createSyncDescriptor(ctor, this._id, this._label);
	}

	public get syncDescriptor(): SyncDescriptor0<Action> {
		return this._descriptor;
	}

	public get id(): string {
		return this._id;
	}

	public get label(): string {
		return this._label;
	}

	public get keybindings(): IKeybindings {
		return this._keybindings;
	}

	public get keybindingContext(): ContextKeyExpr {
		return this._keybindingContext;
	}

	public get keybindingWeight(): number {
		return this._keybindingWeight;
	}
}
