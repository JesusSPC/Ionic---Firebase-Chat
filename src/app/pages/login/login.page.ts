import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';
import { MiscService } from 'src/app/services/misc.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public credentialForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private chatService: ChatService,
    private misc: MiscService
  ) { }

  ngOnInit() {
    this.credentialForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async signUp() {
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.chatService.signUp(this.credentialForm.value)
    .catch(async e => {
      this.misc.errorHandler(e);
      loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Sign up failed',
        message: e.message,
        buttons: ['OK']
      });
      alert.present();
    });

    console.log(user);
    loading.dismiss();
    this.router.navigateByUrl('/chat', { replaceUrl: true });
  }

  async signIn() {
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.chatService.signIn(this.credentialForm.value).catch(async e => {
      this.misc.errorHandler(e);
      loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Sign up failed',
        message: e.message,
        buttons: ['OK']
      });
      alert.present();
      throw e;
    });
    console.log(user);
    loading.dismiss();
    this.router.navigateByUrl('/chat', { replaceUrl: true });
  }

  // Easy access for form template
  get email() {
    return this.credentialForm.get('email');
  }

  get password() {
    return this.credentialForm.get('password');
  }
}
