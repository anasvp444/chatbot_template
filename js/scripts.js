
document.querySelector('.chat-class3').style.display = "block";
document.querySelector('.chat-arrow').style.display = "block";



const expirationDuration = 1000 * 60 * 10;
const prevAccepted = localStorage.getItem("accepted");
const currentTime = new Date().getTime();

const notAccepted = prevAccepted == undefined;
const prevAcceptedExpired = prevAccepted != undefined && currentTime - prevAccepted > expirationDuration
if (notAccepted || prevAcceptedExpired) {
    localStorage.removeItem("session");
    localStorage.removeItem("chat");
    localStorage.removeItem("chat_id");
}



let session = localStorage.getItem("session");
if (session === null) {
    session = makeid();
    localStorage.setItem("session", session);
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


const chatbutton = document.querySelector('.chatbotclass0');
chatbutton.addEventListener('click', openForm);

function openForm(e) {

    document.querySelector("#chatframe").style.display = "block";
    document.querySelector("#chat-header").style.display = "block";
    document.querySelector('.chatbotclass1').style.display = "none";
    $("#chatul").scrollTop($("#chatul").prop('scrollHeight'));
}

const chatPullDown = document.querySelector('.fa-caret-down');
chatPullDown.addEventListener('click', chatDown);

function chatDown(e) {
    document.querySelector("#chatframe").style.display = "none";
    document.querySelector("#chat-header").style.display = "none";
    document.querySelector('.chatbotclass1').style.display = "flex";
}

function submit_message(message) {
    let incomeChat;


    $.ajax({
        url: `https://us-central1-restaurant-bot-pawhlh.cloudfunctions.net/connectChat?text=${message}&session=${session}`,
        dataType: 'json',
        success: function (data) {


            let option_flag = 0
            data.fulfillmentMessages.forEach(function (fulfillmentMessage) {
                if (Object.keys(fulfillmentMessage)[1] === "text") {
                    processText(fulfillmentMessage.text.text[0])
                }
                else if (Object.keys(fulfillmentMessage)[1] === "quickReplies") {

                    processQuikReplies(fulfillmentMessage.quickReplies.quickReplies)
                    option_flag = 1
                }
                else if (Object.keys(fulfillmentMessage)[1] === "card") {

                    processCard(fulfillmentMessage.card)
                }


            });


        },
        error: function () {
            incomeChat = "Internal Server Error";
        }
    });

}

function processText(text) {


    incomeChat = JSON.stringify(text, undefined, 2);
    incomeChat = incomeChat.slice(1, -1);

    incomeChat = incomeChat.replace(/\\n/g, '<br>')

    var chat_array = JSON.parse(localStorage["chat"]);
    var chat_id = JSON.parse(localStorage["chat_id"]);
    if (chat_array.length > 40) {
        chat_array.shift();
        chat_id.shift();
    }
    chat_array.push(incomeChat);
    chat_id.push("bot");
    localStorage.setItem("chat", JSON.stringify(chat_array));
    localStorage.setItem("chat_id", JSON.stringify(chat_id));
    insertChat("bot", incomeChat);


}



function processQuikReplies(quikReplies) {


    var options = [];
    var options_back = []
    quikReplies.forEach(function (quikReply) {

        if (quikReply.charAt(0) === "<") {
            quikReply = quikReply.substr(1);
            options_back.push(quikReply)
        }
        else {
            options.push(quikReply)
        }
    });
    let control = `<li>
    <div class="option-container" >`;
    options.forEach(quikReply => {
        control += `<div class="option-rta pt-2 ">
        <button class="btn btn-chat-option align-items-center ">${quikReply}</button>
        </div>`;
    });
    control += `</div>
    <div class="option-container" >`
    options_back.forEach(quikReply => {
        control += `<div class="option-rta pt-2 ">
        <button class="btn btn-chat-option option-rev align-items-center ">${quikReply}</button>
        </div>`;
    });

    control += `</div>
    </li>`


    localStorage.setItem("options", JSON.stringify(options));
    localStorage.setItem("options_back", JSON.stringify(options_back));

    $("#chatul").append(control).scrollTop($("#chatul").prop('scrollHeight'));
    const questionButtons = document.querySelectorAll('.btn-chat-option');
    questionButtons.forEach(element => {
        element.addEventListener('click', askQuestion);
    });
}

function processCard(card) {


    var card_array = null

    let control = `<li>

    <div class="chatbot-dialog">
        <div class="chat-icon">
            <img src="img/bot.png" width="17" height="17">
        </div>


    <div class="mycard px-5">

        <div class="card ">
          <img class ="thumbnail-image" src="${card.imageUri}" alt="Avatar" style="width:100%">
          <div class="container border border-info pb-2"">
            <h4><b>${card.title}</b></h4> 
            <p>${card.subtitle}</p> `

    if (card.buttons.length > 0) {
        control += `<a class="card-btn" href=${card.buttons[0].postback} target=\"_blank\">${card.buttons[0].text}</a>`;
        card_array = [card.title, card.subtitle, card.imageUri, card.buttons[0].text, card.buttons[0].postback]
    }
    else {
        card_array = [card.title, card.subtitle, card.imageUri]
    }
    control += ` </div>
                </div>
                </div>   
                </div> 
                </li>`;
    ;
    $("#chatul").append(control).scrollTop($("#chatul").prop('scrollHeight'));

    $(".thumbnail-image").load(function () {
        $("#chatul").scrollTop($("#chatul").prop('scrollHeight'));
    });

    var chat_array = JSON.parse(localStorage["chat"]);
    var chat_id = JSON.parse(localStorage["chat_id"]);
    if (chat_array.length > 40) {
        chat_array.shift();
        chat_id.shift();
    }

    chat_array.push(card_array);
    chat_id.push("card");
    localStorage.setItem("chat", JSON.stringify(chat_array));
    localStorage.setItem("chat_id", JSON.stringify(chat_id));

}


function insertChat(who, text) {

    var control = "";

    if (who == "bot") {
        control = `<li>
                        <div class="chatbot-dialog">
                            <div class="chat-icon">
                                <img src="img/bot.png" width="17" height="17">
                            </div>

                             <div class = "chat-dialog">
                                    <span>${text}</span>
                             </div>
                        </div>
                       </li>`;
    }
    else {
        control = `<li>      
                        <div class="user-dialog pull-right">
                                <div class = "user-single-dialog">
                                    <span>${text}</span>
                                </div>
                        </div>
                       </li>`
    }


    $('.option-rta').remove();
    $('#datebox-container').remove();
    $(".user-type").prop('disabled', false);
    $("#chatul").append(control).scrollTop($("#chatul").prop('scrollHeight'));


}

$(".user-type").on("keydown", userEnter);
function userEnter(e) {
    if (e.which == 13) {

        // document.querySelector('.dates').style.display = "none";
        // document.querySelector('.user-type').style.display = "block";



        var text = $(this).val();
        if (text !== "") {
            insertChat("user", text);
            $(this).val('');
            submit_message(text);
            var chat_array = JSON.parse(localStorage["chat"]);
            var chat_id = JSON.parse(localStorage["chat_id"]);
            if (chat_array.length > 40) {
                chat_array.shift();
                chat_id.shift();
            }
            chat_array.push(text);
            chat_id.push("user");
            localStorage.setItem("chat", JSON.stringify(chat_array));
            localStorage.setItem("chat_id", JSON.stringify(chat_id));
            const currentTime = new Date().getTime();
            localStorage.setItem("accepted", currentTime);

        }
    }
}

$('body > div > div > div:nth-child(2) > span').click(function () {
    $(".user-type").trigger({ type: 'keydown', which: 13, keyCode: 13 });
    $(".input-date").trigger({ type: 'keydown', which: 13, keyCode: 13 });
})

function askQuestion(e) {

    var text = e.target.textContent

    insertChat("me", text);

    // document.querySelector('.dates').style.display = "none";
    // document.querySelector('.user-type').style.display = "block";

    submit_message(text);
    var chat_array = JSON.parse(localStorage["chat"]);
    var chat_id = JSON.parse(localStorage["chat_id"]);
    if (chat_array.length > 40) {
        chat_array.shift();
        chat_id.shift();
    }
    chat_array.push(text);
    chat_id.push("user");
    localStorage.setItem("chat", JSON.stringify(chat_array));
    localStorage.setItem("chat_id", JSON.stringify(chat_id));
    const currentTime = new Date().getTime();
    localStorage.setItem("accepted", currentTime);
}


if (localStorage.getItem("chat") === null) {
    insertChat("bot", "Hey welcome to our site.");


    var array = ["Hey welcome to our site."];
    var chat_id = ["bot"]
    localStorage.setItem("chat", JSON.stringify(array));
    localStorage.setItem("chat_id", JSON.stringify(chat_id));

}
else {
    var chat_array = JSON.parse(localStorage["chat"]);
    var chat_id = JSON.parse(localStorage["chat_id"]);

    var chat_n = chat_array.length;


    for (i = 0; i <= chat_n; i++) {
        if (chat_id[i] === "bot") { insertChat("bot", chat_array[i]); }

        else if (chat_id[i] === "user") { insertChat("user", chat_array[i]); }

        else if (chat_id[i] === "card") {
            let button_html = null;
            if (chat_array[i].length > 4) {
                button_html = '<a class="card-btn" href=${card.buttons[0].postback} target=\"_blank\">${card.buttons[0].text}</a>';

            }
            else {

            }

            let control = `<li>

            <div class="chatbot-dialog">
                <div class="chat-icon">
                    <img src="img/195.png" width="15" height="20">
                </div>
        
        
            <div class="mycard px-5">
        
                <div class="card ">
                  <img class ="thumbnail-image" src="${chat_array[i][2]}" alt="Avatar" style="width:100%">
                  <div class="container border border-info pb-2"">
                    <h4><b>${chat_array[i][0]}</b></h4> 
                    <p>${chat_array[i][1]}</p> `

            if (chat_array[i].length > 4) {
                control += `<a class="card-btn" href=${chat_array[i][4]} target=\"_blank\">${chat_array[i][3]}</a>`;
            }

            control += ` </div>
                        </div>
                        </div>   
                        </div> 
                        </li>`;



            $("#chatul").append(control).scrollTop($("#chatul").prop('scrollHeight'));

            $(".thumbnail-image").load(function () {
                $("#chatul").scrollTop($("#chatul").prop('scrollHeight'));
            });


        }
    }

    if (localStorage["options"] !== null) {

        var options = JSON.parse(localStorage["options"]);
        var options_back = JSON.parse(localStorage["options_back"]);
        let control = `<li>
            <div class="option-container" >`;
        options.forEach(quikReply => {
            control += `<div class="option-rta pt-2 ">
                <button class="btn btn-chat-option align-items-center ">${quikReply}</button>
                </div>`;
        });
        control += `</div>
            <div class="option-container" >`
        options_back.forEach(quikReply => {
            control += `<div class="option-rta pt-2 ">
                <button class="btn btn-chat-option option-rev align-items-center ">${quikReply}</button>
                </div>`;
        });

        control += `</div>
            </li>`

        $("#chatul").append(control).scrollTop($("#chatul").prop('scrollHeight'));


        const questionButtons = document.querySelectorAll('.btn-chat-option');
        questionButtons.forEach(element => {
            element.addEventListener('click', askQuestion);
        });
    }


}






