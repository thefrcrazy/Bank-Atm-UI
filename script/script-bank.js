userAccounts = {
  ["12345"] : {
    account : "12345",
    owner : "Copel Luke",
    isPly : true,
    type : "courant",
    balance : 255000,
    iban : "123-456-789",
    history : [
      {
        label: "Concession",
        desc: "Achat de: Jester S",
        amount: 257000,
        isAdd: false,
        type: "vehicle"
      },
      {
        label: "Station n°2",
        desc: "Plein de 25 litres",
        amount: 12,
        isAdd: false,
        type: "fuel"
      },
      {
        label: "Dynasty 8",
        desc: "Maison Vinewood",
        amount: 25000,
        isAdd: false,
        type: "property"
      },
      {
        label: "Binco",
        desc: "Achat de: 1 t-shirt",
        amount: 25,
        isAdd: false,
        type: "clothe"
      },
      {
        label: "ATM: Maze Bank",
        desc: "Dépot d'argent",
        amount: 75000,
        isAdd: true,
        type: "bank"
      },
      {
        label: "ATM: Maze Bank",
        desc: "Dépot d'argent",
        amount: 10,
        isAdd: true,
        type: "bank"
      },
      {
        label: "ATM: Maze Bank",
        desc: "Dépot d'argent",
        amount: 259,
        isAdd: false,
        type: "bank"
      },
      {
        label: "ATM: Maze Bank",
        desc: "Dépot d'argent",
        amount: 119186,
        isAdd: true,
        type: "bank"
      },
    ]
  },
}

let notifyThread = undefined
let confirmThread = false
let newAccountThread = false
let transferThread = false
let depositWithdrawThread = false

numberWithCommas = function(x) {
  x=String(x).toString();
  var afterPoint = '';
  if(x.indexOf('.') > 0)
    afterPoint = x.substring(x.indexOf('.'),x.length);
  x = Math.floor(x);
  x=x.toString();
  var lastThree = x.substring(x.length-3);
  var otherNumbers = x.substring(0,x.length-3);
  if(otherNumbers != '')
    lastThree = ' ' + lastThree;
  return otherNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + lastThree + afterPoint;
}

initInputIbanBank = function(obj) {
  console.log(obj.value.length)
  if (obj.value.length > 3) {
    obj.value = obj.value.slice(0, 3);
  }
  if (obj.value > obj.max) {
    obj.value = obj.max;
  }
}

initInputAmountBank = function(obj) {
  console.log(obj.value.length)
  if (obj.value.length > 9) {
    obj.value = obj.value.slice(0, 9);
  }
}


$(function() {
  openBank();
  window.addEventListener('message', function(event) {
    let e = event.data
    switch (e) {
      case "openBank":
        openBank();
      break
      case "closeBank":
        closeBank();
      break
    }
  });
});

openBank = function() {
  $('body').fadeIn(500);
  $('.bank').fadeIn(500);
  hideall();
  $(".bank-home").fadeIn(500);
  refreshAccounts();
}

closeBank = function() {
  setTimeout(() => {
    $('body').fadeOut(500);
    $('.bank').fadeOut(500);
  }, 250);
}

hideall = function() {
  console.log("Bank")
  $(".bank-home").fadeOut(500);
  $(".bank-account").fadeOut(500);
}


openNotify = function(type, time, text) {
  console.log(type, time, text)

  let faIcon = '<i class="fas fa-check"></i>'
  $(".bank-notify").css("box-shadow", "rgb(0, 255, 0) 0px 8px 20px -10px");
  $(".bank-notify").removeAttr("id");

  if (type === "error") {
    faIcon = '<i class="fa fa-times"></i>'
    $(".bank-notify").css("box-shadow", "rgb(255, 0, 0) 0px 8px 20px -10px");
    $(".bank-notify").attr("id", "error");
  }

  $(".bank-notify-box").html("");
  $(".bank-notify-box").append(`
    <div class="bank-notify-box-icon-${type}">
      ${faIcon}
    </div>
    <p>${text}</p>
    <div class="bank-notify-box-btns">
      <button id="bank-notify-box-close">Fermer</button>
    </div>
  `);

  if (notifyThread !== undefined) {
    clearTimeout(notifyThread);
    notifyThread = undefined
    closeNotify();
    console.log("Force Delete notify")
  }
  $(".bank-notify").animate({'zoom': 0.1}, 0).fadeIn(50).animate({'zoom': 1}, 50);
  setTimeout( () => {
    $(".bank-notify").removeAttr("id");
  }, 500); 

  toggleBlur(true, true);

  notifyThread = setTimeout(() => {
    notifyThread = undefined
    closeNotify();
    console.log("Delete notify")
  }, time);

  $("#bank-notify-box-close").on('click', function() {
    clearTimeout(notifyThread);
    notifyThread = undefined
    closeNotify();
    console.log("Close notify")
  });
}

closeNotify = function() {
  $(".bank-notify").animate({'zoom': 0.1}, 50).fadeOut(50);
  toggleBlur(false);
}


openConfirm = function(header, desc, account, type) {
  if (confirmThread) return console.log("Confirm is currently open");

  console.log(header, desc, account, type)
  $(".bank-confirm-box").html("");
  $(".bank-confirm-box").append(`
    <div class="bank-confirm-box-icon">
      <i class="fa fa-exclamation"></i>
    </div>
    <header>${header}</header>
    <p>${desc}</p>
    <div class="bank-confirm-box-btns">
      <button id="bank-confirm-box-yes">Oui</button>
      <button id="bank-confirm-box-no">Non</button>
    </div>
  `);

  $(".bank-confirm").animate({'zoom': 0.1}, 0).fadeIn(50).animate({'zoom': 1}, 50);

  confirmThread = true
  toggleBlur(true);

  $("#bank-confirm-box-yes").on('click', function() {
    confirmThread = false
    closeConfirm();
    console.log("Close confirm yes")
    console.log(account, type)
   
    delete userAccounts[account]
    goHome();
  });

  $("#bank-confirm-box-no").on('click', function() {
    confirmThread = false
    closeConfirm();
    console.log("Close confirm no")
  });

}

closeConfirm = function() {
  $(".bank-confirm").animate({'zoom': 0.1}, 50).fadeOut(50);
  toggleBlur(false);
}



openNewAccount = function() {
  if (newAccountThread) return console.log("NewAccount is currently open");

  console.log("openNewAccount")

  $(".bank-newAccount").animate({'zoom': 0.1}, 0).fadeIn(50).animate({'zoom': 1}, 50);

  newAccountThread = true
  toggleBlur(true);

  $(".bank-newAccount-box").html("");
  $(".bank-newAccount-box").append(`
    <div class="bank-newAccount-box-accountTypetList">
      <header>Type de compte personnel: *</header>
      <select id="accountTypetList-select" required>
        <option name="" value="" selected>Aucun</option>
        <option value="courant">Courant</option>
        <option value="epargne">Epargne</option>
      </select>
    </div>

    <div class="bank-newAccount-box-btns">
      <input id="bank-newAccount-box-create" type="button" value="Crée">
      <input id="bank-newAccount-box-cancel" type="button" value="Annuler">
    </div>
  `);

  let dType = ""

  $("#accountTypetList-select").on("change", function() {
    let obj = $(this);
    console.log(obj.val())
    dType = obj.val();
  });


  $("#bank-newAccount-box-create").on('click', function() {

    let isSubmit = isNewAccountSubmit(dType);

    if (!isSubmit) return openNotify("error", 1600, "Aucun type de compte choisi");
    
    let newNumberAccount =  Math.floor(Math.random() * (99999 - 0)) + 0;
    console.log(newNumberAccount)

    if (dType === "courant") {
      let randomIban = getRandomIban()+"-"+getRandomIban()+"-"+getRandomIban();
      console.log(randomIban)
      userAccounts[newNumberAccount] = {
        account: `${newNumberAccount}`,
        owner: "Copel Luke",
        isPly : true,
        type : "courant",
        balance : 0,
        iban : randomIban,
        history : []
      }
      
      newAccountThread = false
      closeNewAccount();
      openNotify("success", 2400, `Vous avez crée un nouveau compte courant`);
      goHome();

    } else if (dType === "epargne") {
      userAccounts[newNumberAccount] = {
        account: `${newNumberAccount}`,
        owner: "Copel Luke",
        isPly : true,
        type : "epargne",
        balance : 0,
        iban : "Aucun",
        history : []
      }

      newAccountThread = false
      closeNewAccount();
      openNotify("success", 2400, `Vous avez crée un nouveau compte epargne`);
      goHome();
    }
  });

  $("#bank-newAccount-box-cancel").on('click', function() {
    newAccountThread = false
    closeNewAccount();
    console.log("Close newAccount cancel")
  });
}


getRandomIban = function() {
  return Math.floor(Math.random() * (999 - 100)) + 100;
}

isNewAccountSubmit = function(dType) {
  if (dType === "") return false;
  return true
}

closeNewAccount = function() {
  $(".bank-newAccount").animate({'zoom': 0.1}, 50).fadeOut(50);
  toggleBlur(false);
}






openTransfer = function(account) {
  if (transferThread) return console.log("Transfer is currently open");

  let tData = {
    this: account,
    to: undefined,
    iban: { val1: 0, val2: 0, val3: 0 },
    amount: ""
  }
  console.log("OpenTransfer", account)

  $(".bank-transfer").animate({'zoom': 0.1}, 0).fadeIn(50).animate({'zoom': 1}, 50);

  transferThread = true
  toggleBlur(true);
  

  $(".bank-transfer-box").html("");
  $(".bank-transfer-box").append(`
    <div class="bank-transfer-box-accountList">
      <header>Transférer à: *</header>
      <select id="accountList-select" required>
        <option name="" value="" selected>Aucun</option>
        
        <option name="iban" value="iban">Autre compte</option>
      </select>
    </div>
    <div class="bank-transfer-box-iban">
      <header>Entrer IBAN *</header>
      <input class="input-transfer-iban" id="iban-one" required placeholder="00" name="number" type="number" min="01" max="999" oninput="initInputIbanBank(this)">
      -
      <input class="input-transfer-iban" id="iban-two" required placeholder="00" name="number" type="number" min="01" max="999" oninput="initInputIbanBank(this)">
      -
      <input class="input-transfer-iban" id="iban-three" required placeholder="00" name="number" type="number" min="01" max="999" oninput="initInputIbanBank(this)">
    </div>

    <div class="bank-transfer-box-amount">
      <header>Montant *</header>
      <input id="input-transfer-amount" required placeholder="918273645" name="number" type="number" oninput="initInputAmountBank(this)" min="1" max="999999999">
    </div>

    <div class="bank-transfer-box-btns">
      <input id="bank-transfer-box-yes" type="button" value="Envoyer">
      <input id="bank-transfer-box-no" type="button" value="Annuler">
    </div>
  `);

  $.each(userAccounts, function (k, v) {
    if (k != account) {
      console.log(k)
      $("#accountList-select").append("<option name=+'"+k+"' value='"+k+"'>Compte n°"+k+"</option>");
    }
  });


  $(".bank-transfer-box-iban").hide();
  $(".bank-transfer").css("height", "25vh");
  $(".input-transfer-iban").removeAttr("required");


  $("#accountList-select").on("change", function() {
    let obj = $(this);
    console.log(obj.val())
    tData.to = obj.val();
    if (obj.val() === "iban") {
      $(".bank-transfer-box-iban").fadeIn(100);
      $(".bank-transfer").css("height", "34vh");
      $(".input-transfer-iban").attr("required", true);
    } else {
      $(".bank-transfer-box-iban").hide();
      $(".bank-transfer").css("height", "25vh");
      $(".input-transfer-iban").removeAttr("required");
      tData.iban = { val1: 0, val2: 0, val3: 0 }
    }
  });

  $("#bank-transfer-box-yes").on('click', function() {
    tData.iban.val1 = $("#iban-one").val();
    tData.iban.val2 = $("#iban-two").val();
    tData.iban.val3 = $("#iban-three").val();
    tData.amount = $("#input-transfer-amount").val();

    let object = isTransferSubmit(tData);
    let tSubmit = object[0];
    let type = object[1];
    let text = object[2];

    console.log(tSubmit, type, text)
    if (tSubmit) {
      if (type !== "iban") {
        
        // Code Temporaire pour example, a eviter coter client
        let bThisAccount = parseFloat(userAccounts[tData.this].balance);
        let bToAccount = parseFloat(userAccounts[tData.to].balance);

        if (bThisAccount === 0) return openNotify("error", 1800, "Votre solde du compte est à 0$");

        if (tData.amount > bThisAccount) {
          tData.amount = bThisAccount
        }

        userAccounts[tData.this].balance = bThisAccount-tData.amount;
        userAccounts[tData.to].balance = +bToAccount + +tData.amount;

        userAccounts[tData.this].history.reverse().push({
          label: "Virement Compte",
          desc: `Compte N°${tData.this} vers Compte N°${tData.to}`,
          amount: parseFloat(tData.amount),
          isAdd: false,
          type: "bank"
        });

        userAccounts[tData.to].history.reverse().push({
          label: "Virement Compte",
          desc: `Compte N°${tData.this} vers Compte N°${tData.to}`,
          amount: parseFloat(tData.amount),
          isAdd: true,
          type: "bank"
        });

        closeTransfer();
        transferThread = false
        openNotify("success", 2400, `Vous avez fait un virement de ${tData.amount} $`);

        goSingleAccount("_"+tData.this);

      } else {


        // Code Temporaire pour example, a eviter coter client
        let bThisAccount = parseFloat(userAccounts[tData.this].balance);
        if (bThisAccount === 0) return openNotify("error", 1800, "Votre solde du compte est à 0$");

        if (tData.amount > bThisAccount) {
          tData.amount = bThisAccount
        }

        let tI = tData.iban
        let ibanToAccount = `${tI.val1}-${tI.val2}-${tI.val3}`
        $.each(userAccounts, function(k,v) {
          if (v.iban === ibanToAccount) {
            tData.to = v.account
          }
        });
        
        let bToAccount = parseFloat(userAccounts[tData.to].balance);
        
        userAccounts[tData.this].balance = bThisAccount-tData.amount;
        userAccounts[tData.to].balance = +bToAccount + +tData.amount;
        
        userAccounts[tData.this].history.reverse().push({
          label: "Virement IBAN",
          desc: `Compte N°${tData.this} vers ${ibanToAccount}`,
          amount: parseFloat(tData.amount),
          isAdd: false,
          type: "bank"
        });

        userAccounts[tData.to].history.reverse().push({
          label: "Virement IBAN",
          desc: `Compte N°${tData.this} vers ${ibanToAccount}`,
          amount: parseFloat(tData.amount),
          isAdd: true,
          type: "bank"
        });

        closeTransfer();
        transferThread = false
        openNotify("success", 2400, `Vous avez fait un virement de ${tData.amount} $`);
        
        goSingleAccount("_"+tData.this);

      }
    } else {
      openNotify("error", 1600, text)
    }
  });

  $("#bank-transfer-box-no").on('click', function() {
    transferThread = false
    closeTransfer();
    console.log("Close transfer no")
  });
}

closeTransfer = function() {
  $(".bank-transfer").animate({'zoom': 0.1}, 50).fadeOut(50);
  toggleBlur(false);
}

isTransferSubmit = function(d) {
  console.log(d, d.iban)
  
  if (d.to === undefined || d.to === "") {
    return [false, "error", "Aucun compte trouver"];
  } else if (d.to === "iban") {
    if (d.iban.val1 === "" || d.iban.val1.length < 2 || d.iban.val1.length > 3) return [false, "error", "Iban introuvable"];
    if (d.iban.val2 === "" || d.iban.val2.length < 2 || d.iban.val2.length > 3) return [false, "error", "Iban introuvable"];
    if (d.iban.val3 === "" || d.iban.val3.length < 2 || d.iban.val3.length > 3) return [false, "error", "Iban introuvable"];

    if (d.iban.val1.length !== d.iban.val2.length || d.iban.val1.length !== d.iban.val3.length) return [false, "error", "Iban introuvable"];
  }

  if (d.amount === "") return [false, "error", "Aucun montant trouver"];

  return [true, d.to, d.iban]
}






openDepositWithdraw = function(account, type) {
  if (depositWithdrawThread) return console.log("Transfer is currently open");

  console.log("OpenDepositWithdraw", account, type)

  $(".bank-deposit-withdraw").animate({'zoom': 0.1}, 0).fadeIn(50).animate({'zoom': 1}, 50);

  depositWithdrawThread = true
  toggleBlur(true);

  $(".bank-deposit-withdraw-box").html("");

  if (type === "deposit") {

    $(".bank-deposit-withdraw-box").append(`
      <div class="bank-deposit-withdraw-box-amount">
        <header>Montant à deposer *</header>
        <input id="input-deposit-withdraw-amount" required placeholder="918273645" name="number" type="number" oninput="initInputAmountBank(this)" min="1" max="999999999">
      </div>

      <div class="bank-deposit-withdraw-box-btns">
        <input id="bank-deposit-withdraw-box-confirm" type="button" value="Déposer">
        <input id="bank-deposit-withdraw-box-cancel" type="button" value="Annuler">
      </div>
    `);

  } else if (type === "withdraw") {

    $(".bank-deposit-withdraw-box").append(`
      <div class="bank-deposit-withdraw-box-amount">
        <header>Montant à retirer *</header>
        <input id="input-deposit-withdraw-amount" required placeholder="918273645" name="number" type="number" oninput="initInputAmountBank(this)" min="1" max="999999999">
      </div>

      <div class="bank-deposit-withdraw-box-btns">
        <input id="bank-deposit-withdraw-box-confirm" type="button" value="Retirer">
        <input id="bank-deposit-withdraw-box-cancel" type="button" value="Annuler">
      </div>
    `);
  }

  $("#bank-deposit-withdraw-box-confirm").on('click', function() {

    let amount = isDWSubmit();

    if (!amount) return openNotify("error", 1600, "Aucun montant trouver");
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

    } else if (type === "withdraw") {
      userAccounts[account].balance = userAccounts[account].balance-amount;

      userAccounts[account].history.reverse().push({
        label: "Compte: Maze Bank",
        desc: `Retrait d'argent`,
        amount: parseFloat(amount),
        isAdd: false,
        type: "bank"
      });
    }
    
    depositWithdrawThread = false
    closeDepositWithdraw();
    console.log("Close depositWithdraw yes")
    goSingleAccount("_"+account);
  });

  $("#bank-deposit-withdraw-box-cancel").on('click', function() {
    depositWithdrawThread = false
    closeDepositWithdraw();
    console.log("Close depositWithdraw no")
  });
}

isDWSubmit = function() {
  let amount = $("#input-deposit-withdraw-amount").val();
  if (amount === "") return false;
  return amount
}

closeDepositWithdraw = function(type) {
  $(".bank-deposit-withdraw").animate({'zoom': 0.1}, 50).fadeOut(50);
  toggleBlur(false);
}


toggleBlur = function(state, isNotif) {
  if (state) {
    $(".bank-verticalBar").attr('id', 'isBlur');
    $(".bank-home").attr('id', 'isBlur');
    $(".bank-account").attr('id', 'isBlur');
    if (isNotif) {
      $(".bank-confirm").attr('id', 'isBlur');
      $(".bank-transfer").attr('id', 'isBlur');
      $(".bank-deposit-withdraw").attr('id', 'isBlur');
      $(".bank-newAccount").attr('id', 'isBlur');
    }
  } else {

    if (notifyThread !== undefined) return;
    
    $(".bank-confirm").removeAttr('id', 'isBlur');
    if (confirmThread) return;
    
    $(".bank-transfer").removeAttr('id', 'isBlur');
    if (transferThread) return;
   
    $(".bank-deposit-withdraw").removeAttr('id', 'isBlur');
    if (depositWithdrawThread) return;
    
    $(".bank-newAccount").removeAttr('id', 'isBlur');
    if (newAccountThread) return;
    

    $(".bank-verticalBar").removeAttr('id', 'isBlur');
    $(".bank-home").removeAttr('id', 'isBlur');
    $(".bank-account").removeAttr('id', 'isBlur');
  }
}



refreshAccounts = function() {
  $(".bank-verticalBar-buttons-accountsList").html("");
  $(".bank-home-container").html("");
  $.each(userAccounts, function (k, v) {
    console.log(k,v)
    $(".bank-verticalBar-buttons-accountsList").append(`
      <div class="bank-verticalBar-buttons-account-${v.type}" id="${v.account}" data="${v.account}">
        <span class="bank-verticalBar-buttons-account-text">
          Compte N°${v.account}
          <br>
          Propriétaire: ${v.owner}
          <br>
          Type: ${v.type}
        </span>
      </div>
    `);
    $(".bank-home-container").append(`
      <div class="bank-home-container-box-${v.type}">
        <span class="box-title">Compte N°${v.account}</span>
        <span class="box-desc">
          ${numberWithCommas(v.balance)} $
          <br><br>
          Propriétaire: ${v.owner}
          <br><br>
          IBAN: ${v.iban}
        </span>
        <button class="box-button" id="_${v.account}" data="${v.account}">Détails</button>
      </div>
    `);

    $(`#${v.account}`).on('click', function() {
      goSingleAccount(this.id)
    });
    $(`#_${v.account}`).on('click', function() {
      goSingleAccount(this.id)
    });
  });
}



goHome = function() {
  hideall();
  $(".bank-home").fadeIn(500);
  refreshAccounts();
}


goSingleAccount = function(id) {
  console.log(id)
  const aId = id.replace("_", "")
  console.log(aId)
  const sA = userAccounts[aId]
  $.each(sA, function (k, v) {
    console.log(k,v)
  });
  
  hideall();
  $(".bank-account").fadeIn(250);

  $(".bank-account-info").html("");
  $(".bank-account-balance").html("");
  $(".bank-account-info-rigthbar-history").html("");
  $("#bank-account-chart-myShart").html("");
  $("#bank-account-info-rigthbar-chart-myPlot").html("");

  setTimeout(() => {
    $(".bank-account-balance").append(`
      <span class="bank-account-balance-text">Compte N°${sA.account}</span>
      <span class="bank-account-balance-balance">${numberWithCommas(sA.balance)} $</span>
    `);

    $(".bank-account-info").append(`
      <span class="bank-account-info-text">Informations</span>
      <span class="bank-account-info-desc">
        Propriétaire: ${sA.owner}
        <br><br>
        Type: ${sA.type}
        <br><br>
        IBAN: ${sA.iban}
      </span>
      <button class="bank-account-info-deposit" data-account="${sA.account}">Dépot</button>
      <button class="bank-account-info-withdraw" data-account="${sA.account}">Retrait</button>
      <button class="bank-account-info-give" data-account="${sA.account}">Virement</button>
      <button class="bank-account-info-iban" data-iban="${sA.iban}">IBAN</button>

      <button title="NOP FRERE" class="bank-account-info-card" id="bank-account-info-btns-${sA.isPly}" data-access=${sA.isPly} data-account="${sA.account}">Crée carte</button>
      <button title="NOP FRERE" class="bank-account-info-delete" id="bank-account-info-btns-${sA.isPly}" data-access=${sA.isPly} data-account="${sA.account}">Supprimer</button>
    `);
    
    tippy('#bank-account-info-btns-false', {
      placement: 'bottom',
      arrow: false,
      duration: 10,
      theme: 'translucent',
      followCursor: "horizontal",
      content: "Vous ne pouvez pas faire ceci !",
    });
    
    let myShart = {
      ["fuel"] : {
        int: parseFloat(0),
        label: "Essence",
        color: "#750000"
      },
      ["clothe"] : {
        int: parseFloat(0),
        label: "Vetement",
        color: "#006075"
      },
      ["property"] : {
        int: parseFloat(0),
        label: "Proprieté",
        color: "#007504"
      },
      ["vehicle"] : {
        int: parseFloat(0),
        label: "Vehicule",
        color: "#B2A200"
      },
      ["billing"] : {
        int: parseFloat(0),
        label: "Facture",
        color: "#754900"
      },
    }


    let myPlot = [0, 0]

    if (sA.history.length > 0) {
      $.each(sA.history.reverse(), function (k, v) {
        // console.log(k,v)
        $(".bank-account-info-rigthbar-history").append(`
          <div class="bank-account-info-rigthbar-history-box" id="bank-history-box-${v.isAdd}">
            <span class="bank-account-info-rigthbar-history-box-label">${v.label}</span>
            <span class="bank-account-info-rigthbar-history-box-desc">${v.desc}</span>
            <span class="bank-account-info-rigthbar-history-box-amount" id="bank-history-amount-${v.isAdd}">${numberWithCommas(v.amount)} $</span>
            <img class="bank-account-info-rigthbar-history-box-img" src="img/icons/${v.type}.png">
          </div>
        `);

        if (v.isAdd) {
          myPlot[0] = +myPlot[0]+ +v.amount;
          console.log("Add", myPlot[0]);
        } else {
          myPlot[1] = +myPlot[1]+ +v.amount;
          console.log("Remove", myPlot[1]);
          if (myShart[v.type] != undefined) {
            myShart[v.type].int = +myShart[v.type].int+ +v.amount;
          }
        }
      });
      historyMyPlot(myPlot);
      historyMyShart(myShart);
    }
    

    $(`.bank-account-info-deposit`).on('click', function() {
      console.log($(this).data('account'))
      openDepositWithdraw($(this).data('account'), "deposit");
    });

    $(`.bank-account-info-withdraw`).on('click', function() {
      console.log($(this).data('account'))
      openDepositWithdraw($(this).data('account'), "withdraw");
    });

    $(`.bank-account-info-iban`).on('click', function() {
      console.log($(this).data('iban'))
      navigator.clipboard.writeText($(this).data('iban'));
      openNotify("success", 800, "IBAN copier avec succées.");
    });

    $(`.bank-account-info-give`).on('click', function() {
      console.log($(this).data('account'))
      openTransfer($(this).data('account'));
    });

    $(`.bank-account-info-card`).on('click', function() {
      if (!$(this).data('access')) {
        return openNotify("error", 1400, "Vous ne pouvez pas faire ceci !")
      }
      console.log($(this).data('account'))
      openNotify("success", 1200, "Carte crée avec succéss")
    });

    $(`.bank-account-info-delete`).on('click', function() {
      if (!$(this).data('access')) {
        return openNotify("error", 1400, "Vous ne pouvez pas faire ceci !")
      }
      console.log($(this).data('account'))
      openConfirm("Confirmer ?", "Etes vous sûr de continuer, cette action sera irréversible.", $(this).data('account'));
    });
  }, 450);
}


historyMyPlot = function(myPlot) {
  var data = [{
    labels:["Gains", "Pertes"],
    values:myPlot,
    type:"pie",
    marker: {
      line: {
        color: 'white',
        width: 1
      },
      colors:["#007504", "#750000"]
    },
    texttemplate: "%{percent:.2%f}",
  }];
  var layout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'white',
    font: {
      size: "12px",
      color: "white"
    },
    showlegend: false
  };
  Plotly.newPlot("bank-account-info-rigthbar-chart-myPlot", data, layout);
}


historyMyShart = function(myShart) {
  console.log(myShart)
  let nbr = 0
  let labels = []
  let colors = []
  let values = []

  $.each(myShart, function(k,v) {
    console.log(k, v)
    if ( v.int > 0 ) {
      labels[nbr] = v.label;
      colors[nbr] = v.color;
      values[nbr] = v.int;
      nbr++;
    }
  });
  var data = [{
    labels: labels,
    values: values,
    type: "pie",
    marker: {
      colors: colors
    },
    texttemplate: "%{percent:.2%f}",
  }];
  var layout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      size: "12px",
      color: "white"
    },
    showlegend: true
  };
  Plotly.newPlot("bank-account-chart-myShart", data, layout);
}




$(document).on('click','#home',function() {
  goHome();
});

$(document).on('click','#newAccount',function() {
  openNewAccount();
});

$(document).on('click','#quit',function() {
  closeBank();
});