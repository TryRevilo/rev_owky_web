/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './contextMenuHandler.css';
import { ActionRunner } from '../../../base/common/actions.js';
import { combinedDisposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { Menu } from '../../../base/browser/ui/menu/menu.js';
import { EventType, $, isHTMLElement } from '../../../base/browser/dom.js';
import { attachMenuStyler } from '../../theme/common/styler.js';
import { domEvent } from '../../../base/browser/event.js';
import { StandardMouseEvent } from '../../../base/browser/mouseEvent.js';
import { isPromiseCanceledError } from '../../../base/common/errors.js';
export class ContextMenuHandler {
    constructor(contextViewService, telemetryService, notificationService, keybindingService, themeService) {
        this.contextViewService = contextViewService;
        this.telemetryService = telemetryService;
        this.notificationService = notificationService;
        this.keybindingService = keybindingService;
        this.themeService = themeService;
        this.focusToReturn = null;
        this.block = null;
        this.options = { blockMouse: true };
    }
    configure(options) {
        this.options = options;
    }
    showContextMenu(delegate) {
        const actions = delegate.getActions();
        if (!actions.length) {
            return; // Don't render an empty context menu
        }
        this.focusToReturn = document.activeElement;
        let menu;
        let shadowRootElement = isHTMLElement(delegate.domForShadowRoot) ? delegate.domForShadowRoot : undefined;
        this.contextViewService.showContextView({
            getAnchor: () => delegate.getAnchor(),
            canRelayout: false,
            anchorAlignment: delegate.anchorAlignment,
            anchorAxisAlignment: delegate.anchorAxisAlignment,
            render: (container) => {
                let className = delegate.getMenuClassName ? delegate.getMenuClassName() : '';
                if (className) {
                    container.className += ' ' + className;
                }
                // Render invisible div to block mouse interaction in the rest of the UI
                if (this.options.blockMouse) {
                    this.block = container.appendChild($('.context-view-block'));
                    this.block.style.position = 'fixed';
                    this.block.style.cursor = 'initial';
                    this.block.style.left = '0';
                    this.block.style.top = '0';
                    this.block.style.width = '100%';
                    this.block.style.height = '100%';
                    this.block.style.zIndex = '-1';
                    domEvent(this.block, EventType.MOUSE_DOWN)((e) => e.stopPropagation());
                }
                const menuDisposables = new DisposableStore();
                const actionRunner = delegate.actionRunner || new ActionRunner();
                actionRunner.onBeforeRun(this.onActionRun, this, menuDisposables);
                actionRunner.onDidRun(this.onDidActionRun, this, menuDisposables);
                menu = new Menu(container, actions, {
                    actionViewItemProvider: delegate.getActionViewItem,
                    context: delegate.getActionsContext ? delegate.getActionsContext() : null,
                    actionRunner,
                    getKeyBinding: delegate.getKeyBinding ? delegate.getKeyBinding : action => this.keybindingService.lookupKeybinding(action.id)
                });
                menuDisposables.add(attachMenuStyler(menu, this.themeService));
                menu.onDidCancel(() => this.contextViewService.hideContextView(true), null, menuDisposables);
                menu.onDidBlur(() => this.contextViewService.hideContextView(true), null, menuDisposables);
                domEvent(window, EventType.BLUR)(() => { this.contextViewService.hideContextView(true); }, null, menuDisposables);
                domEvent(window, EventType.MOUSE_DOWN)((e) => {
                    if (e.defaultPrevented) {
                        return;
                    }
                    let event = new StandardMouseEvent(e);
                    let element = event.target;
                    // Don't do anything as we are likely creating a context menu
                    if (event.rightButton) {
                        return;
                    }
                    while (element) {
                        if (element === container) {
                            return;
                        }
                        element = element.parentElement;
                    }
                    this.contextViewService.hideContextView(true);
                }, null, menuDisposables);
                return combinedDisposable(menuDisposables, menu);
            },
            focus: () => {
                if (menu) {
                    menu.focus(!!delegate.autoSelectFirstItem);
                }
            },
            onHide: (didCancel) => {
                if (delegate.onHide) {
                    delegate.onHide(!!didCancel);
                }
                if (this.block) {
                    this.block.remove();
                    this.block = null;
                }
                if (this.focusToReturn) {
                    this.focusToReturn.focus();
                }
            }
        }, shadowRootElement, !!shadowRootElement);
    }
    onActionRun(e) {
        this.telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'contextMenu' });
        this.contextViewService.hideContextView(false);
        // Restore focus here
        if (this.focusToReturn) {
            this.focusToReturn.focus();
        }
    }
    onDidActionRun(e) {
        if (e.error && !isPromiseCanceledError(e.error)) {
            this.notificationService.error(e.error);
        }
    }
}
