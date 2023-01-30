import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';

declare const Twilio:any;
declare const manager:any;

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
    userInfo = {
        companyId: null,
        companyName: null,
        storeLocation: null,
        roleName: null,
        userName: null,
        userId: null,
        firstName: null,
        fuelobject: null,
        companyLogo: null, roles: null
    };
    collapedSideBar: boolean;
    // version = '8.4.0'; // old angular version
    version = '19.0.0'; // ui/ux angular version
    constructor(private constant: ConstantService) { }

    ngOnInit() {
        console.log('======================= Angular UI/UX => ' + this.version + '==============================');
        this.userInfo = this.constant.getUserInfo();
        // this.initTwilio();
    }

    receiveCollapsed($event) {
        this.collapedSideBar = $event;
    }

    initTwilio() {
        console.log(this.userInfo);
        const appConfig = {
            accountSid: environment.accountSid,
            flexFlowSid: environment.flexFlowSid,
            context: {
                friendlyName: this.userInfo.firstName ? this.userInfo.firstName : this.userInfo.userName
            },
            colorTheme: {
                baseName: "BlueMediumTheme"
            },
            startEngagementOnInit: false,
            preEngagementConfig: {    

                description: "What kind of support do you want?",
                fields: [
                    {
                        label: "Please select support type",
                        type: "SelectItem",
                        attributes: {
                            name: "supportType",
                            required: true,
                            readOnly: false

                        },
                        options: [
                        {
                            value: "technical",
                            label: "Technical Support",
                            selected: false
                        },
                        {
                            value: "sales",
                            label: "Sales Support",
                            selected: true
                        }
                        ]
                    },
                ],
                submitLabel: "Submit",
                }

        };
        Twilio.FlexWebChat.renderWebChat(appConfig);
        Twilio.FlexWebChat.Actions.on("afterStartEngagement", (payload) => {
              const { question } = payload.formData;
              if (!question) return;

              const { channelSid } = manager.store.getState().flex.session;
              manager.chatClient.getChannelBySid(channelSid)
                  .then(channel => {
                      channel.sendMessage(question);
                });
        });
        Twilio.FlexWebChat.MessagingCanvas.defaultProps.predefinedMessage = false;
    }
}
