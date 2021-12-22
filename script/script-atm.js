let thisPage = "main"
let crtAccount = undefined
let crtType = undefined

$(function() {
  // openATM();
  window.addEventListener('message', function(event) {
    let e = event.data
    switch (e) {
      case "openATM":
        openATM();
      break
      case "closeATM":
        closeATM();
      break
    }
  });
});

openATM = function() {
  thisPage = "waiting"
  $(".atm-container-card").attr("id", "openAtm");
  $('body').fadeIn(500);
  $('.atm').fadeIn(500);
  setTimeout(() => {
    refreshAtmAccounts();
  }, 2500);
}
 
closeATM = function() {
  $(".atm-container-card").attr("id", "closeAtm");
  $(".atm-container-card").fadeOut(1);
  $(".atm-container-card").fadeIn(1);
  hideAll();
  setTimeout(() => {
    $('body').fadeOut(500);
    $('.atm').fadeOut(500);
  }, 2500);
}

goMain = function() {
  if (crtType === "history") {
    $(".atm-container-screen-history").css("display", "none");
  }
  if (thisPage === "main") {
    console.log("Close ATM")
    closeATM();
  } else if (thisPage === "account") {
    console.log("Go Main")
    refreshAtmAccounts();
    editAtmContainerUp();
  } else if (thisPage === "singleAccount") {
    console.log(crtAccount)
    goSingleAccountAtm(crtAccount);
  }
}




refreshAtmAccounts = function() {
  crtAccount = undefined
  deleteAttr();
  hideAll();
  thisPage = "main"
  editBackBtn("Quitter");

  let i = 1
  $.each(userAccounts, function (k, v) {
    console.log(k,v)
    $(`#atm-button-${i}`).data("account", k);
    $(`#atm-screen-btn-${i}`).css("opacity", "100%");
    if (v.type == "courant") $(`#atm-screen-btn-${i}`).css("filter", "hue-rotate(90deg)");

    $(`#atm-screen-btn-${i}`).html("");
    $(`#atm-screen-btn-${i}`).append(`
      <header>
        N°: ${v.account}
      </header>
      <p>
        ${v.owner}
      </p>
    `);

    console.log(`#atm-button-${i}`, $(`#atm-button-${i}`).data("account"))
    i++;
    if (i > 5) return;
  });

  popBackBtn();
}


clickButton = function(d) {
  if (thisPage === "waiting") return;
  const obj = $(d);
  console.log("Click Button", obj.data("account"))
  if (thisPage === "singleAccount") {
    if (crtType === "transfer") {
      console.log("Type", "dsfsdf")
      useButtonData(0, crtType, crtAccount)
    } else {
      console.log(obj.data("nbr"))
      let amount = $(`#atm-screen-btn-${obj.data("nbr")}`).data("amount");
      useButtonData(amount, crtType, crtAccount);
    }
  } else {
    if (obj.data("account") === null) {
      if (obj.data("type") !== undefined) {
        goDataAccountAtm(obj.data("type"));
      }
    } else {
      goSingleAccountAtm(obj.data("account"));
    }
  }
}


goSingleAccountAtm = function(account) {
  crtType = undefined
  hideAll();
  editBackBtn("Retour");
  thisPage = "account";
  crtAccount = account;
  for (let i=1; i<5; i++) {
    $(`#atm-screen-btn-${i}`).html("");
    $(`#atm-screen-btn-${i}`).css("opacity", "100%");
  }
  $(`#atm-screen-btn-1`).append(`<a>Dépôt</a>`);
  $(`#atm-screen-btn-2`).append(`<a>Retrait</a>`);
  $(`#atm-screen-btn-3`).append(`<a>Virement</a>`);
  $(`#atm-screen-btn-4`).append(`<a>Historique</a>`);
  popInfoBtn(account);
  popBackBtn();
  deleteAttr();
}


goDataAccountAtm = function(type) {
  if (crtAccount === undefined) return;
  console.log("Type button", type)
  thisPage = "singleAccount";
  crtType = type;
  deleteAttr();
  hideNbr(6);
  if (crtType === "transfer") {
    
    for (let i=1; i<3; i++) {
      $(`#atm-screen-btn-${i}`).html("");
      $(`#atm-screen-btn-${i}`).css("opacity", "100%");
    }

    $(`#atm-screen-btn-1`).append(`
      <header>Entrer IBAN *</header>
      <input class="input-transfer-iban" id="iban-one" required placeholder="00" name="number" type="number" min="01" max="999" oninput="initInputIbanBank(this)">
      -
      <input class="input-transfer-iban" id="iban-two" required placeholder="00" name="number" type="number" min="01" max="999" oninput="initInputIbanBank(this)">
      -
      <input class="input-transfer-iban" id="iban-three" required placeholder="00" name="number" type="number" min="01" max="999" oninput="initInputIbanBank(this)">
    `);
    $(`#atm-screen-btn-2`).append(`
      <input id="input-atm-amount" required placeholder="918273645" name="number" type="number" oninput="initInputAmountBank(this)" min="1" max="999999999">
    `);

  } else if (crtType === "history") {

    let aHistory = userAccounts[crtAccount].history;

    $(".atm-container-screen-history").html("");

    if (aHistory.length > 0) {
      $.each(aHistory.reverse(), function (k, v) {
        $(".atm-container-screen-history").append(`
          <div class="atm-container-screen-history-box" id="bank-history-box-${v.isAdd}">
            <span class="atm-container-screen-history-box-label">${v.label}</span>
            <span class="atm-container-screen-history-box-desc">${v.desc}</span>
            <span class="atm-container-screen-history-box-amount" id="bank-history-amount-${v.isAdd}">${numberWithCommas(v.amount)} $</span>
            <img class="atm-container-screen-history-box-img" src="img/icons/${v.type}.png">
          </div>
        `);
      });
    }
    $(".atm-container-screen-history").css("display", "initial");


  } else {
    for (let i=1; i<7; i++) {
      $(`#atm-screen-btn-${i}`).html("");
      $(`#atm-screen-btn-${i}`).css("opacity", "100%");
  
      let dataDiv = $(`#atm-screen-btn-${i}`).data("amount");
      if (dataDiv === "custom") {
        $(`#atm-screen-btn-${i}`).append(`
          <input id="input-atm-amount" required placeholder="918273645" name="number" type="number" oninput="initInputAmountBank(this)" min="1" max="999999999">
        `);
      } else {
        $(`#atm-screen-btn-${i}`).append(`<a>${dataDiv} $</a>`);
      }
    }
  }
}

useButtonData = function(amount, type, account) {
  console.log("Btn = ", amount, type, account)
  if (amount === "custom") {
    amount = $("#input-atm-amount").val();
  }
  console.log(amount)
  if (type === "deposit") {
    userAccounts[account].balance = +userAccounts[account].balance+ +amount;

    userAccounts[account].history.reverse().push({
      label: "Compte: Maze Bank",
      desc: `Dépot d'argent`,
      amount: parseFloat(amount),
      isAdd: true,
      type: "bank"
    });
    blurToggle(true)
    $(".atm-container-cash-deposit").fadeIn();
    setTimeout(() => {
      $(".atm-container-cash-deposit").fadeOut();
      atmNotify("success", 1600, `Vous avez déposer ${numberWithCommas(amount)} $.`);
      goSingleAccountAtm(account);
      blurToggle(false)
    }, 2200);


  } else if (type === "withdraw") {
    userAccounts[account].balance = userAccounts[account].balance-amount;

    userAccounts[account].history.reverse().push({
      label: "Compte: Maze Bank",
      desc: `Retrait d'argent`,
      amount: parseFloat(amount),
      isAdd: false,
      type: "bank"
    });
    blurToggle(true)
    $(".atm-container-cash-withdraw").fadeIn();
    setTimeout(() => {
      $(".atm-container-cash-withdraw").fadeOut();
      atmNotify("success", 1600, `Vous avez retirer ${numberWithCommas(amount)} $.`);
      goSingleAccountAtm(account);
      blurToggle(false)
    }, 2200);

    

  } else if (type === "transfer") {
    let tI = {
      val1: $("#iban-one").val(),
      val2: $("#iban-two").val(),
      val3: $("#iban-three").val(),
      to: undefined
    }
    amount = $("#input-atm-amount").val();
    console.log(type+" ==", amount)

    let object = isCorrectData(tI, amount)
    let rSubmit = object[0];
    let rAmount = object[1];
    let rText = object[2];
    if (rSubmit) {
      console.log("Transfer is OK", rAmount, rText)

      // Code Temporaire pour example, a eviter coter client
      let bThisAccount = parseFloat(userAccounts[account].balance);
      if (bThisAccount === 0) return openNotify("error", 1800, "Votre solde du compte est à 0$");

      if (rAmount > bThisAccount) {
        rAmount = bThisAccount
      }

      $.each(userAccounts, function(k,v) {
        if (v.iban === rText) {
          tI.to = v.account
        }
      });

      let bToAccount = parseFloat(userAccounts[tI.to].balance);

      userAccounts[account].balance = bThisAccount-rAmount;
      userAccounts[tI.to].balance = +bToAccount + +rAmount;

      userAccounts[account].history.reverse().push({
        label: "Virement IBAN",
        desc: `Compte N°${account} vers ${rText}`,
        amount: parseFloat(rAmount),
        isAdd: false,
        type: "bank"
      });

      userAccounts[tI.to].history.reverse().push({
        label: "Virement IBAN",
        desc: `Compte N°${account} vers ${rText}`,
        amount: parseFloat(rAmount),
        isAdd: true,
        type: "bank"
      });

      atmNotify("success", 1600, `Vous avez transférer ${numberWithCommas(amount)} $.`);
      goSingleAccountAtm(account);


    } else {
      atmNotify("error", 1600, rText)
    }

  }

}

isCorrectData = function(tI, amount) {
  if (tI.val1 === "" || tI.val1.length < 2 || tI.val1.length > 3) return [false, "error", "Iban introuvable"];
  if (tI.val2 === "" || tI.val2.length < 2 || tI.val2.length > 3) return [false, "error", "Iban introuvable"];
  if (tI.val3 === "" || tI.val3.length < 2 || tI.val3.length > 3) return [false, "error", "Iban introuvable"];
  if (tI.val1.length !== tI.val2.length || tI.val1.length !== tI.val3.length) return [false, "error", "Iban introuvable"];
  if (amount === "" || amount === "0") return [false, "error", "Aucun montant trouver"];
  return [true, parseFloat(amount), `${tI.val1}-${tI.val2}-${tI.val3}`]
}

blurToggle = function(state) {
  if (state) {
    $(".atm-container-button-left").attr('id', 'isBlur');
    $(".atm-container-button-right").attr('id', 'isBlur');
    $(".atm-container-screen").attr('id', 'isBlur');
  } else {
    $(".atm-container-button-left").removeAttr('id', 'isBlur');
    $(".atm-container-button-right").removeAttr('id', 'isBlur');
    $(".atm-container-screen").removeAttr('id', 'isBlur');
  }
}



atmNotify = function(type, time, text) {
  console.log(type, time, text)

  let faIcon = '<i class="fas fa-check"></i>'
  $(".atm-notify").css("box-shadow", "rgb(0, 255, 0) 0px 8px 20px -10px");
  $(".atm-notify").removeAttr("id");

  if (type === "error") {
    faIcon = '<i class="fa fa-times"></i>'
    $(".atm-notify").css("box-shadow", "rgb(255, 0, 0) 0px 8px 20px -10px");
    $(".atm-notify").attr("id", "error");
  }

  $(".atm-notify-box").html("");
  $(".atm-notify-box").append(`
    <div class="atm-notify-box-icon-${type}">
      ${faIcon}
    </div>
    <p>${text}</p>
    <div class="atm-notify-box-btns">
      <button id="atm-notify-box-close">Fermer</button>
    </div>
  `);

  if (notifyThread !== undefined) {
    clearTimeout(notifyThread);
    notifyThread = undefined
    closeAtmNotify();
    console.log("Force Delete notify")
  }
  $(".atm-notify").animate({'zoom': 0.1}, 0).fadeIn(50).animate({'zoom': 1}, 50);
  setTimeout( () => {
    $(".atm-notify").removeAttr("id");
  }, 500); 

  toggleBlur(true, true);

  notifyThread = setTimeout(() => {
    notifyThread = undefined
    closeAtmNotify();
    console.log("Delete notify")
  }, time);

  $("#atm-notify-box-close").on('click', function() {
    clearTimeout(notifyThread);
    notifyThread = undefined
    closeAtmNotify();
    console.log("Close notify")
  });
}

closeAtmNotify = function() {
  $(".atm-notify").animate({'zoom': 0.1}, 50).fadeOut(50);
  toggleBlur(false);
}




deleteAttr = function() {
  $(".atm-buttons").data('account', null);
}

hideAll = function() {
  $(".atm-screen-box-left").css({opacity: "0%",filter: ""});
  $(".atm-screen-box-right").css({opacity: "0%",filter: ""});
}

hideNbr = function(val) {
  for (let i=1; i<+val+1; i++) {
    $(`#atm-screen-btn-${i}`).html("");
    $(`#atm-screen-btn-${i}`).css("opacity", "0%");
  }
}

editBackBtn = function(text) {
  console.log("Edit btn", text)
  $(`#atm-screen-btn-8`).html("");
  $(`#atm-screen-btn-8`).append(`
    <a>${text}</a>
  `);
}

popBackBtn = function() {
  $(`#atm-button-8`).data("account", "main");
  $(`#atm-screen-btn-8`).css("opacity", "100%");
}

popInfoBtn = function(account) {
  console.log("Info", account)

  let dAc = userAccounts[account];

  $(`#atm-screen-btn-7`).html("");
  $(`#atm-screen-btn-7`).append(`
    <header>
      Balance:
    </header>
    <a>
      ${numberWithCommas(dAc.balance)} $
    </a>
  `);
  editAtmContainerUp(dAc);

  $(`#atm-screen-btn-7`).css("opacity", "100%");
}

editAtmContainerUp = function(dAc) {
  $(`.atm-container-up`).html("");
  if (dAc) {
    $(`.atm-container-up`).append(`
    <header>ATM</header>
    <text>
      N° ${dAc.account}
      <br>
      ${dAc.owner}
      <br>
      ${dAc.type}
    </text>
  `);
  } else {
    $(`.atm-container-up`).append(`<header>ATM</header>`);
  }
}