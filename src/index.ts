// Import utilities
import * as path from 'path';
import * as restify from 'restify';
import * as dotenv from 'dotenv';

// Import bot stuff
import { BotFrameworkAdapter, ConversationState, MemoryStorage, TurnContext } from 'botbuilder';
import { BotConfiguration, IEndpointService } from 'botframework-config';
import { ScratchBot } from './bot';

// Read env configs
const ENV_FILE = path.join(__dirname, '../.env'); // The .. referback is to allocate for dist directory from where the code executes
console.log(`${ENV_FILE}`);
dotenv.config({ path: ENV_FILE });

// Look for .bot file and load the bot configs
// Refer README for configuring a bot locally and using it with MS Bot Emulator
const BOT_FILE = path.join(__dirname, (process.env.botFilePath || ''));
let botConfig: BotConfiguration;
try {
    botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
} catch (err) {
    console.log(`${process.env.botFilePath}`);
    console.error(`\n Error loading .bot file ${BOT_FILE}`);
    process.exit();
}

// Local dev configs
const DEV_ENVIRONMENT = 'development';
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);
// const endPointConfig = <IEndpointService>botConfig.findServiceByNameOrId(BOT_CONFIGURATION); // Skipped for now as the echo bot runs locally

// Create bot adapter
const adapter: BotFrameworkAdapter = new BotFrameworkAdapter({
    // Temporarily blanked out to allocate for local run without an azure account
    appId: process.env.microsoftAppID || "" , // endPointConfig.appId || 
    appPassword: process.env.microsoftAppPassword || "" // endPointConfig.appPassword || 
});

// Catch all unhandled errors
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] ${ error }`);
    context.sendActivity('Oops. Something went wrong!'); // send msg to user
    await conversationState.clear(context); // clear out state
    await conversationState.saveChanges(context) // save state changes
};

const memoryStorage: MemoryStorage = new MemoryStorage();
let conversationState: ConversationState = new ConversationState(memoryStorage);

// Create main dialog
const bot = new ScratchBot(conversationState);

// Create http server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n ${server.name} listening to ${server.url}`);
    console.log('\n Now you can open the .bot file in bot-emulator.');
});

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context: TurnContext) => {
        // Route to main dialog.
        await bot.onTurn(context);
    });
});
