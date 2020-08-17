import { Component, OnInit } from '@angular/core';
import { ChatService, AuthService } from 'src/app/shared';
import { FormControl, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  messages$;
  chatInput: FormControl = new FormControl('', Validators.required);
  constructor(private chatService: ChatService, private auth: AuthService) {}

  ngOnInit() {
    this.messages$ = this.chatService.get().pipe(
      map((x) => {
        return x.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      })
    );
  }
  sendMessage() {
    if (this.chatInput.valid) {
      this.chatService.send(this.chatInput.value);
      this.chatInput.reset();
    }
  }
  isMyMessage$(msg) {
    return this.auth.user$.pipe(
      map((x) => {
        return x && x.uid == msg.uid;
      })
    );
  }
}
