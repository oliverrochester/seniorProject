//var CryptoJS = require("crypto-js");
let vm = {
    data() { //properties of our object must be established here, and are returned as an object.
        return {
            
        }
    }, 
    methods: { //An object that contains whatever methods we need.
          createAccount(){
            let status = document.getElementById("createAccountorLoginStatus");
            let username = String(document.getElementById("userCreateAct").value);
            let password = String(document.getElementById("passwordCreateAct").value);

            // var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
            // var plaintext = bytes.toString(CryptoJS.enc.Utf8);
            // console.log(plaintext)

            if(password.length < 8){
                status.innerHTML = "password must be at least 8 characters long"
            }
            else{
                var ciphertext = CryptoJS.AES.encrypt(password, 'secret key 123');
                $.post("/createAccount", {username: username, password: ciphertext}, dataFromServer => {
                    if(!dataFromServer.createAccountSuccess){
                        status.innerHTML = "Account with that username already exists"
                    }
                    else{
                        goToMainPage()
                    }
                    console.log(dataFromServer.createAccountSuccess);
                }); 
            }
            
          },

          login(){
            let username = String(document.getElementById("userLogin").value);
            let password = String(document.getElementById("passwordLogin").value);
            $.post("/login", {username: username, password: password}, dataFromServer => {
                console.log(dataFromServer.loginSuccess)
            });
          },

          goToMainPage(){
              let loginCreateActComponent = document.getElementById("loginOrCreateAccount");
              loginCreateActComponent.style.visibility = "hidden"
          }
    },
    computed: { //computed properties (methods that compute stuff based on "data" properties)
        //Do not change the value of a property from within these functions.  Side-effects
        //will not be reliable because Vue might skip calls to computed functions as an optimization.
    }
}

let app = Vue.createApp(vm).mount('#main');