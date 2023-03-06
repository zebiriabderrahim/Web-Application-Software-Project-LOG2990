import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatMessage } from '@common/game-interfaces';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent {
    @Input() opponentName: string;
    @Input() messages: ChatMessage[] = [];
    @Output() add = new EventEmitter<string>();

    onAdd(inputField: { value: string }): void {
        this.add.emit(inputField.value?.trim());
        inputField.value = '';
    }
}
