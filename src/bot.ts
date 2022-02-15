import { ActivityTypes, ConversationState, TurnContext } from 'botbuilder';

export class ScratchBot {
    private conversationState: ConversationState;
    constructor(conversationState: ConversationState) {
        this.conversationState = conversationState;
    }
    public onTurn = async (turnContext: TurnContext) => {
        if (turnContext.activity.type === ActivityTypes.Message) {
            await turnContext.sendActivity(`You said "${turnContext.activity.text}"`);
        } else {
            await turnContext.sendActivity(`[${turnContext.activity.type} event detected]`); // generic handler
        }
        await this.conversationState.saveChanges(turnContext); // save state
    }
}