/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Session State: Handles a multi-turn dialog model.
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 * - SSML: Using SSML tags to control how Alexa renders the text-to-speech.
 *
 * Examples:
 * Dialog model:
 *  User: "Alexa, ask Wise Guy to tell me a knock knock joke."
 *  Alexa: "Knock knock"
 *  User: "Who's there?"
 *  Alexa: "<phrase>"
 *  User: "<phrase> who"
 *  Alexa: "<Punchline>"
 */

/**
 * App ID for the skill
 */
var APP_ID = undefined;//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * Array containing sentences for practice
 */
var SENTENCE_LIST = [
    {sentence: "Do you want coffee or tea?", sentenceTwo: "Nice weather isn't it?"},
    {sentence: "Nice weather isn't it?", sentenceTwo: "Did you get a good night's sleep?"},
    {sentence: "Did you get a good night's sleep?", sentenceTwo: "I am learning how to speak English"},
    {sentence: "I am learning how to speak English", sentenceTwo: "It is summer!",
        cardPunchline: "Never mind. It's pointless."},
    {sentence: "It is summer!", sentenceTwo: "I like to wake up early in the morning", cardPunchline: "Snow use. I forgot"},
    {sentence: "I like to wake up early in the morning", sentenceTwo: "Angel Hacks is awesome",
        cardPunchline: "Aww, it's okay, don't cry."},
    {sentence: "Angel Hacks is awesome", sentenceTwo: "I hope everyone had lots of fun!",
        cardPunchline: "Don't get so excited, it's just a joke"},
    {sentence: "I hope everyone had lots of fun!", sentenceTwo: "Get some rest everyone!",
        cardPunchline: "w.h.o"},
    {sentence: "Get some rest everyone!", sentenceTwo: "Great job to you all", cardPunchline: "I didn't know you had a cold!"},
    {sentence: "Great job to you all", sentenceTwo: "Alexa says give everyone a thumbs up", cardPunchline: "Yes, they do."},
    {sentence: "Alexa says give everyone a thumbs up", sentenceTwo: "Do you want coffee or tea?", cardPunchline: "Berry nice to meet you."}
];

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * WiseGuySkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var SpeechPracticeSkill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
SpeechPracticeSkill.prototype = Object.create(AlexaSkill.prototype);
SpeechPracticeSkill.prototype.constructor = SpeechPracticeSkill;

/**
 * Overriden to show that a subclass can override this function to initialize session state.
 */
SpeechPracticeSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // Any session init logic would go here.
};

/**
 * If the user launches without specifying an intent, route to the correct function.
 */
SpeechPracticeSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("SpeechPracticeSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    handleTellMeASentenceIntent(session, response);
};

/**
 * Overriden to show that a subclass can override this function to teardown session state.
 */
SpeechPracticeSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    //Any session cleanup logic would go here.
};

SpeechPracticeSkill.prototype.intentHandlers = {
    "TellMeASentenceIntent": function (intent, session, response) {
        handleTellMeASentenceIntent(session, response);
    },

    "SentenceTwoIntent": function (intent, session, response) {
        handleSentenceTwoIntent(session, response);
    },

    "SetupSentenceIntent": function (intent, session, response) {
        handleSetupSentenceIntent(session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "";

        switch (session.attributes.stage) {
            case 0:
                speechText = "Learning how to pronounce correctly will help you communicate with others better. " +
                    "To start practice, just ask by saying give me a sentence, or you can say exit.";
                break;
            case 1:
                speechText = "You can ask, please repeat or you can say exit.";
                break;
            case 2:
                speechText = "You can ask, please repeat or you can say exit.";
                break;
            default:
                speechText = "Learning how to pronounce correctly will help you communicate with others better. " +
                    "To start practice, just ask by saying give me a sentence, or you can say exit.";
        }

        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        // For the repromptText, play the speechOutput again
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};


/**
 * Selects a joke randomly and starts it off by saying "Knock knock".
 */
function handleTellMeASentenceIntent(session, response) {
    var speechText = "";

    //Reprompt speech will be triggered if the user doesn't respond.
    var repromptText = "You can ask, please repeat";

    //Check if session variables are already initialized.
    if (session.attributes.stage) {

        //Ensure the dialogue is on the correct stage.
        if (session.attributes.stage === 0) {
            //The sentence is already initialized, this function has no more work.
            speechText = "Repeat after me!" +  session.attributes.sentence;
        
        } else {
            //The user attempted to jump to the intent of another stage.
            session.attributes.stage = 0;
            speechText = "That's not how to say the sentence! "
                + "Repeat after me!";
        }
    } else {
        //Select a random sentence and store it in the session variables.
        var sentenceID = Math.floor(Math.random() * SENTENCE_LIST.length);

        //The stage variable tracks the phase of the dialogue. 
        //When this function completes, it will be on stage 1.
        session.attributes.stage = 1;
        session.attributes.sentence = SENTENCE_LIST[sentenceID].sentence;
        session.attributes.sentenceTwo = SENTENCE_LIST[sentenceID].sentenceTwo;
        session.attributes.cardPunchline = SENTENCE_LIST[sentenceID].cardPunchline;

        //speechText = "Repeat after me!";
        speechText = session.attributes.sentence;
    }

    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };

    var speechOutput = {
        speech: speechText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    
    response.askWithCard(speechOutput, repromptOutput, "Speech Practice", speechText);
}

/**
 * Responds to the user repeats the first sentence..
 */
function handleSentenceTwoIntent(session, response) {
    var speechText = "";
    var repromptText = "";


    if (session.attributes.stage = session.attributes.sentence) { // = session.attributes.sentence
        if (session.attributes.stage === 1) {
            //Retrieve the first sentence setup text.
            speechText = session.attributes.sentence;

            //Advance the stage of the dialogue.
            session.attributes.stage = 2;
            var sentenceID = Math.floor(Math.random() * SENTENCE_LIST.length);
            session.attributes.sentenceTwo = SENTENCE_LIST[sentenceID].sentenceTwo;
            speechText = session.attributes.sentenceTwo;
            repromptText = "Repeat after me" + speechText;
            
      } else {
            session.attributes.stage = 1;
            speechText = "That's not how you say it! It is" + session.attributes.sentence;

            repromptText = "You can say, skip or repeat please."
        }
    } else {

        //If the session attributes are not found, the sentence must restart. 
        speechText = "Sorry, I couldn't understand the statement. "
            + "You can say, tell me a sentence!";

        repromptText = "You can say, tell me a sentence!";
    }

    var speechOutput = {
        speech: '<speak>' + speechText + '</speak>',
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    var repromptOutput = {
        speech: '<speak>' + repromptText + '</speak>',
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.ask(speechOutput, repromptOutput);
}

/**
 * Delivers the last sentence after the user repeats the second sentence.
 */
function handleSetupSentenceIntent(session, response) {
    var speechText = "",
        repromptText = "",
        speechOutput,
        repromptOutput,
        cardOutput;

    if (session.attributes.stage) {
        if (session.attributes.stage === 2) {
            speechText = session.attributes.sentenceTwo;
            cardOutput = session.attributes.cardPunchline;
            speechOutput = {
                speech: '<speak>' + speechText + '</speak>',
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            //If the sentence matches, this function uses a "tell" response.
            response.tellWithCard(speechOutput, "Speech practice", cardOutput);
        } else {

            session.attributes.stage = 1;
            speechText = "That's not how you say it.";
            cardOutput = "That's not how you say it.! "
                + session.attributes.sentence;

            repromptText = "You can ask repeat the sentence.";

            speechOutput = {
                speech: speechText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: repromptText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            //If the sentence has to be restarted, this function uses an "ask" response.
            response.askWithCard(speechOutput, repromptOutput, "Speech practice", cardOutput);
        }
    } else {
        speechText = "Sorry, I couldn't hear the sentence. "
            + "You can say, tell me a sentence";

        repromptText = "You can say, tell me a sentence";

        speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.askWithCard(speechOutput, repromptOutput, "Speech practice", speechOutput);
    }
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the SpeechPractice Skill.
    var skill = new SpeechPracticeSkill();
    skill.execute(event, context);
};
